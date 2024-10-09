'use strict';

import { isEmpty, merge } from 'lodash-es';
import { jsonApi } from '../utils';
import env from '../env';
import {User, Session} from './types'
import { AppError, NotImplemented } from '../errors';

const AUTH_STATE_KEY = 'AUTH_STATE';
const AUTH_INITIAL_URL_KEY = 'AUTH_INITIAL_URL';

/**
 * 認可トークン
 * @typedef {Object} AuthToken
 * @property {string} access_token
 * @property {string} id_token
 * @property {string} refresh_token
 * @property {string} token_type
 * @property {number} expires_in
 */

class OidcUser extends User {

  #username = null;
  #email = null;

  constructor(username, email) {
    super();
    this.#username = username;
    this.#email = email;
  }

  get username() {
    return this.#username;
  }

  get email() {
    return this.#email
  }
}

/**
 * OIDC認証セッション情報クラス
 */
class OidcSession extends Session {

  /**
   * @type {import('./types').stateChangeCallback}
   */
  listener;

  /**
   * @type {OidcUser}
   */
  user;

  /**
   * @type {AuthToken}
   */
  token;

  /**
   * @type {TokenStore}
   */
  tokenStore;

  /**
   * @type {OidcIdp}
   */
  oidc;

  /**
   * @param {OidcIdp} oidc 
   * @param {import('../bootstrap').SessionConf} conf
   */
  constructor(oidc, conf) {
    super();
    this.oidc = oidc;
    this.tokenStore = new WebStorageTokenStore(`${conf.tokenStore}Storage`);
  }

  /**
   * @override
   */
  set listener(listener) {
    this.listener = listener;
  }

  /**
   * @override
   */
  get user() {
    return this.user;
  }

  /**
   */
  dispatchStateChange() {
    if(typeof this.listener === 'function') {
      console.log('[session] execute callback');
      this.listener();
    }
  }

  /**
   */
  async completeAuthentication() {
    this.user = await this.oidc.fetchUserinfo(this.token);
    console.log('[session] complete authentication')
    this.dispatchStateChange();
  }

  /**
   * @override
   */
  async checkAuthenticationProceeding() {
    let state = sessionStorage.getItem(AUTH_STATE_KEY);
    if(state != null) {
      // 認証フロー中
      let initialURL = sessionStorage.getItem(AUTH_INITIAL_URL_KEY);
      sessionStorage.removeItem(AUTH_STATE_KEY);
      sessionStorage.removeItem(AUTH_INITIAL_URL_KEY);
      let params = new URLSearchParams(window.location.search);

      let code = params.get('code');
      if(code == null) {
        console.log('[session] authentication flow canceled.', state, initialURL, params);
        throw new AppError('session', `unexpected response parameters: ${params.toString()}`);
      }
      console.log('[session] authenticated.', state, initialURL, params);
      this.token = await this.oidc.exchangeToken(params.get('code'));
      await this.completeAuthentication();
      await this.tokenStore.store(this.token);
      window.history.replaceState(null, null, initialURL);
      console.log('[session] exchanged. replace url', initialURL);
      return true;
    } else {
      // 認証済み
      let token = await this.tokenStore.get();
      if(token != null) {
        this.token = await this.oidc.refreshToken(token);
        if(this.token == null) {
          console.log('[session] session expired.');
          await this.tokenStore.cleare();
        } else {
          await this.tokenStore.store(this.token);
          await this.completeAuthentication();
          console.log('[session] session recovery completed.', this.user);
        }
      }
      return false;
    }
  }

  /**
   * @override
   */
  async authenticate() {
    await this.tokenStore.cleare();
    sessionStorage.setItem(AUTH_STATE_KEY, 'ella');
    sessionStorage.setItem(AUTH_INITIAL_URL_KEY, location.href);
    await this.oidc.authenticate();
  }

  /**
   * @override
   */
  async logout() {
    if(this.token != null) {
      await this.tokenStore.cleare();
      await this.oidc.signOut(this.token);
      this.token = null;
      this.dispatchStateChange();
    }
  }

  /**
   * API呼び出し
   * @param {string} path APIパス
   * @param {Object<string, (Object<string, string>|string)} [options] fetchオプション
   * @returns {Promise<Response>}
   */
  async callApi(path, options) {
    await this.oidc.refreshToken(this.token);
    this.tokenStore.store(this.token);
    let apiPath = `${env.API_ENDPOINT}${path}`;
    let fetchOptions = merge({
      method: 'get',
      headers: {
        Authorization: `Bearer ${this.token.access_token}`
      }
    }, options);
    return fetch(apiPath, fetchOptions);
  }
}

/**
 * OIDC構成情報
 * @typedef {Object} OidcConfiguration
 * @property authorization_endpoint
 * @property token_endpoint
 * @property userinfo_endpoint
 * @property revocation_endpoint
 * @property end_session_endpoint
 */


/**
 * well-known openid-configuration URL
 * @param {(URL|string)} url 
 * @returns {OidcConfiguration}
 */
async function discovery(url) {
  console.log('[session] fetch well-known openid-configration from', url);
  let config = await jsonApi(fetch(url));
  console.log('[session] oidc configuration', config);
  return config;
}

/**
 * OIDC IdP操作クラス
 */
class OidcIdp {

  /**
   * @type {OidcConfiguration}
   */
  #config = {};

  constructor(config) {
    merge(this.#config, config);
    Object.freeze(this.#config);
  }

  /**
   * @returns {OidcConfiguration}
   */
  get config() {
    return this.#config;
  }

  /**
   * OIDCエンドポイント呼び出し
   * @param {string} endpoint エンドポイント種別
   * @param {*} options
   * @returns {Promise<Respone>}
   */
  async callOidcEndpoint(endpoint, options) {
    let endpointURL = this.config[endpoint];
    if(typeof endpointURL === 'string') {
      console.log('[session] call oidc endpoint:', endpoint, endpointURL)
      return fetch(this.config[endpoint], options);
    } else {
      console.error('[session] invalid endpoint type.', endpoint);
      throw new AppError('oidc', `invalid endpoint type. ${endpoint}`);
    }
  }

  /**
   * 認証エンドポイントに遷移します
   */
  async authenticate() {
    sessionStorage.setItem(AUTH_STATE_KEY, 'ella');
    sessionStorage.setItem(AUTH_INITIAL_URL_KEY, window.location.href);
    let config = this.config;
    let url = new URL(this.config.authorization_endpoint);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', env.AUTH_CLIENT_ID);
    url.searchParams.append('redirect_uri', env.BASE_URL);
    url.searchParams.append('scope', env.AUTH_OIDC_SCOPES);
    window.location.href = url;
  }

  /**
   * サインアウト
   * @param {AuthToken} token 
   */
  async signOut(token) {
    let url = new URL(this.config.end_session_endpoint);
    url.searchParams.append('client_id', env.AUTH_CLIENT_ID);
    url.searchParams.append('id_token_hint', token.id_token);
    url.searchParams.append('post_logout_redirect_uri', env.BASE_URL);
    location.href = url;
  }

  /**
   * トークンエンドポイント呼び出し
   * @param {Object<string, (string|Object<string, string>)>} options 
   * @returns {AuthToken} 認可トークン
   */
  async issueToken(options) {
    let params = new URLSearchParams();
    params.set('client_id', env.AUTH_CLIENT_ID);
    for(let key in options) {
      params.set(key, options[key]);
    }
    return jsonApi(this.callOidcEndpoint('token_endpoint', {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }), {400: (res, data)=>null});
  }

  /**
   * 認証コードから認可トークンを取得
   * @param {string} code 
   * @returns {AuthToken} 認可トークン
   */
  async exchangeToken(code) {
    console.log('[session] exchange authentication code to authorization token', code);
    return this.issueToken({grant_type: 'authorization_code', code: code, redirect_uri: env.BASE_URL});
  }

  /**
   * トークン更新
   * @param {AuthToken} token 現在の認証トークン
   * @returns {AuthToken} 更新後の認証トークン
   */
  async refreshToken(token) {
    console.log('[session] refresh token', token);
    let refreshed = await this.issueToken({grant_type: 'refresh_token', refresh_token: token.refresh_token});
    if(refreshed != null) {
      console.log('[session] token refreshed')
      return merge(token, refreshed);
    } else {
      console.log('[session] token expired.');
      return null;
    }
  }

  /**
   * @param {AuthToken} token 認証トークン
   * @returns {Promise<OidcUser>}
   */
  async fetchUserinfo(token) {
    let data = await jsonApi(this.callOidcEndpoint('userinfo_endpoint', {
      headers: {
        'Authorization': `Bearer ${token.access_token}`
      }
    }));
    return new OidcUser(data.username || data.sub, data.email);
  }
}

/**
 * トークンストア
 */
class TokenStore {
  /**
   * トークンを保存します
   * @param {AuthToken} token 
   */
  async store(token) {
    throw new NotImplemented();
  }

  /**
   * トークンを取得します
   */
  async get() {
    throw new NotImplemented();
  }

  /**
   * トークンを削除します
   */
  async cleare() {
    throw NotImplemented();
  }
}

/**
 * Web Storage トークンストア
 */
class WebStorageTokenStore extends TokenStore {

  static #TOKEN_KEY = 'AUTH_TOKEN';

  /**
   * @type {Storage}
   */
  #storage;

  /**
   * @type {AuthToken}
   */
  #token;

  /**
   * @param {'sessionStorage'|'localStorage'} type 
   */
  constructor(type) {
    super();
    this.#storage = window[type]
    let token = this.#storage.getItem(WebStorageTokenStore.#TOKEN_KEY);
    if(!isEmpty(token)) {
      this.#token = JSON.parse(token);
    }
  }

  /**
   * @override
   */
  async get() {
    return this.#token;
  }

  /**
   * @override
   */
  async store(token) {
    this.#token = token;
    this.#storage.setItem(WebStorageTokenStore.#TOKEN_KEY, JSON.stringify(token));
  }

  /**
   * @override
   */
  async cleare() {
    this.#storage.removeItem(WebStorageTokenStore.#TOKEN_KEY);
  }
}

/**
 * OIDCセッションインスタンスを生成します
 * @param {import("../bootstrap").SessionConf} conf
 */
export default async (conf)=>{
  console.log('[session] create session instance', env, conf);
  let oidcConfig = await discovery(env.AUTH_OIDC_DISCOVERY_URL);
  return new OidcSession(new OidcIdp(oidcConfig), conf);
};
export {
  OidcUser,
  OidcSession,
  OidcIdp,
  discovery,
  TokenStore,
  WebStorageTokenStore
}
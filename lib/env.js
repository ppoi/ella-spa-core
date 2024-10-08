'use strict';

import { assign, isEmpty } from 'lodash-es';

/**
 * 環境情報
 * @typedef {Object} AppEnv
 * @property {string} BASE_URL SPAベースURL
 * @property {string} [API_ENDPOINT] APIエンドポイントURL
 * @property {string} [AUTH_OIDC_DISCOVERY_URL] OIDC構成情報URL
 * @property {string} [AUTH_OIDC_SCOPES] OIDC scope
 * @property {string} [AUTH_CLIENT_ID] 認証クライアントID
 * @property {string} [AUTH_SESSION_STORE] 認証セッションストア
 */
const env = {};

/**
 * 環境情報
 * @type {AppEnv}
 */
export default env;

/**
 * 環境情報の初期化
 * @param {(string|URL|AppEnv)} definition 環境情報取得元。値が文字列またはURLの場合は指定されたURLからfetchで取得します。Objectの場合、指定されたオブジェクトを環境情報として設定します。省略した場合、{document.baseURI}/env.jsonを参照します。
 * @param {Object} [defaults] definitionからのデータ取得に失敗した場合のデフォルト値。未設定の場合、Promiseはrejectになります。
 * @returns {Promise<AppEnv>}
 */
export function __setup__(definition = new URL('env.json', document.baseURI), defaults) {
  return new Promise((resolve, reject)=>{
    if(definition == null) {
      reject({
        type: 'env',
        reason: 'missing argument: difinition'
      });
    } else if(typeof definition == 'string' || definition.constructor.name === URL.name) {
      fetch(definition).then(res=>{
        if(res.ok && res.headers.get('Content-Type') == 'application/json') {
          return res.json();
        } else {
          throw `unexpected response: ${res.status}`;
        }
      }).then((json=>{
        applyValues(json);
        resolve(env);
      })).catch(e=>{
        console.warn('[env] fail to fetch from definition:', definition, e);
        if(defaults != null) {
          console.log('[env] use default value', defaults);
          resolve(defaults);
        } else {
          reject({
            type: 'env',
            reason: e
          });
        }
      });
    } else {
      applyValues(definition);
      resolve(env);
    }
  });
}

function applyValues(values) {
  /** @type {string} */
  let baseURI  = values.BASE_URL;
  if(isEmpty(baseURI)) {
    baseURI = document.baseURI;
  }
  if(baseURI.endsWith('/')) {
    baseURI = baseURI.substring(0, baseURI.lastIndexOf('/'));
  }
  assign(env, values, {BASE_URL: baseURI});
  Object.freeze(env);
}
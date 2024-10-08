'use strict';

import { NotImplemented } from "../errors";

/**
 * ユーザ情報
 * @interface
 */
class User {
  get username() {
  }
  get email() {
  }
}

/**
 * @callback stateChangeCallback
 * @param {string} state
 */

/**
 * セッション情報クラス
 * @interface
 */
class Session {

  /**
   * セッション状態の変更を受け取るリスナー関数
   * @param {stateChangeCallback} listener
   */
  set listener(listener) {
    throw new NotImplemented();
  }

  /**
   * ユーザ情報
   * @returns {User}
   */
  get user() {
    throw new NotImplemented();
  }

  /**
   * 未認証セッションかどうかを判定します。
   * @returns {boolean} セッションが未認証の場合true
   */
  isAnonymous() {
    return this.user == null;
  }

  /**
   * 認証処理中かどうかを判定します。
   * @returns {boolean} 認証処理を完了した場合true
   */
  async checkAuthenticationProceeding() {
    throw new NotImplemented();
  }

  /**
   * ユーザ認証を実行します
   */
  async authenticate() {
    throw new NotImplemented();
  }

  /**
   * セッションをログアウトします
   */
  async logout() {
    throw new NotImplemented();
  }

  /**
   * API呼び出し
   * @param {string} path APIパス
   * @param {Object<string, (Object<string, string>|string)} [options] fetchオプション
   * @returns {Response}
   */
  async callApi(path, options) {
    throw new NotImplemented();
  }
}

export {
  User,
  Session
}
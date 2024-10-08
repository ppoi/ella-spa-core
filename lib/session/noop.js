'use strict';

import { Session } from "./types";
import env from "../env";

class NoopSession extends Session {


  /** @type {import("./types").User} */
  #user = null;

  /**
   * @type {import("./types").stateChangeCallback}
   */
  listener;

  /**
   * @override
   */
  set listener(listener) {
    this.listener = listener;
  }

  /**
   * リスナーにセッション状態の変更を通知します
   */
  dispatchStateChange() {
    if(typeof this.listener === 'function') {
      console.log('[session] execute callback');
      this.listener();
    }
  }

  /**
   * @override
   */
  get user() {
    return this.#user;
  }

  /**
   * @override
   */
  async checkAuthenticationProceeding(){
  }

  /**
   * @override
   * @returns {Promise}
   */
  async authenticate() {
    this.#user = new {id:'dummy', username:'dummy'}
  }

  /**
   * @override
   * @returns {Promise}
   */
  async logout() {
    this.#user = null;
    this.dispatchStateChange();
  }

  /**
   * @override
   */
  asynccallApi(path, options) {
    return fetch(`${env.API_ENDPOINT}${path}`, options);
  }
}

export default ()=>{return new NoopSession()}
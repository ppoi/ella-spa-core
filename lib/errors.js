'use strict';

/**
 * アプリケーションエラー
 */
export class AppError extends Error {
  /**
   * @type {Error}
   */
  #cause;

  get cause() {
    return this.#cause;
  }

  /**
   * @param {string} typeName error type name 
   * @param {string} [message] 
   * @param {Error} [cause] 
   */
  constructor(typeName, message, cause) {
    super(message);
    this.name = typeName;
    this.#cause = cause;
  }
}

/**
 * 未実装エラー
 */
export class NotImplemented extends Error {
  constructor() {
    super('not implemented')
    this.name  = 'app'
  }
}
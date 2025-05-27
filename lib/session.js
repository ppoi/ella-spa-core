'use strict';

import { AppError } from './errors';

/**
 * 環境構成情報に基づきセッションモジュールを構成します。
 * @param {import('./index.d.ts').SessionConfig} conf - セッション構成情報
 * @returns {Promise<import('./session/types.js').Session>} セッション情報
 */
export async function __setup__(conf) {
  try {
    console.log('[session] loaading module', conf.module);
    /** @todo 最適化されない問題 */
    Object.setPrototypeOf(session, await (await conf.module)(conf));
    return session;
  } catch(e) {
    if(e instanceof AppError) {
      throw e;
    } else {
      throw new AppError('bootstrap', 'unexpected error at session module setup.', e);
    }
  }
}

let session = {};

/**
 * セッション情報
 * @type {import("./session/types.js").Session}
 */
export default session;
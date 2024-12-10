'use strict';

import { startsWith } from "lodash-es";
import { AppError } from "./errors";

/**
 * @callback responseHandler
 * @param {Response} response
 * @param {*} data
 * @returns {any} resolve value
 * @throws {any} reject value
 */

/**
 * JSONレスポンスを返すPromise<Response>のハンドラーラッパー
 * 1. Content-Typeがappliction/jsonではない場合 → reject()
 * 2. HTTP status(あるいは'ok', 'ng')に対応するハンドラがある場合
 *     - jsonパースでエラーが発生した場合、エラー情報でreject
 *     - responseHandlerが正常終了した場合はその戻り値でresolve
 *     - 例外をthrowした場合はその例外オブジェクトでreject
 * 3. ハンドラがなくres.okがtrueの場合 → resolve(data)
 * 4. ハンドラがなくres.okがfalseの場合 → reject()
 * @param {Promise<Response>} promise fetch promise
 * @param {(Function|Object<(number|'ok'|'ng'),responseHandler>)} [handlers]
 * @returns {Promise}
 */
export async function jsonApi(promise, handlers) {
  try {
    let res = await promise;
    if(startsWith('application/json'), res.headers.get('content-type')) {
      let data;
      if(res.headers.get('Content-Length') != '0') {
        data = await res.json();
      }
      let handler;
      if(typeof handlers === 'function' && res.ok) {
        handler = handlers;
      } else if(handlers != null) {
        handler = handlers[res.status] || handlers[res.ok ? 'ok' : 'ng'];
      }
      if(handler != null) {
        return await handler(res, data);
      } else if(res.ok) {
        console.log('[api] default handler. return data.', res.status);
        return data;
      } else {
        console.log('[api] handler missing', res.status);
        throw new AppError('api', `not ok response: ${res.status}`);
      }
    } else {
      throw new AppError('api',  `unexpected content-type: ${res.headers.get('content-type')}`);
    }
  } catch(e) {
    console.log('[api] fatch failed', e);
    if(e instanceof AppError) {
      throw e;
    } else {
      throw new AppError('api', 'unexpected error', e);
    }
  }
}

/**
 * 現在のWindow Classを取得します。
 * @returns {"sm" | "lg" | "xl"}
 */
export function getWindowClass() {
  let viewportWidth = window.innerWidth;
  if(viewportWidth < 768) {
    return "sm";
  } else if(viewportWidth < 1200) {
    return "lg";
  } else {
    return "xl";
  }
}
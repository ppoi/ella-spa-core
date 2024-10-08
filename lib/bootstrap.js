'use strict';

import env, { __setup__ as envSetup } from './env';
import { AppError } from './errors';
import { configure } from './router';
import { __setup__ as sessionSetup } from './session';

/**
 * セッション設定
 * @typedef {Object} SessionConf
 * @property {(module)} module セッションモジュール
 * @property {'local'|'session'} tokenStore トークンストア
 */

/**
 * コア機能設定
 * @typedef {Object} CoreConf
 * @property {Objecct<string,string>|string|URL} envDef 環境定義情報ソース
 * @property {SessionConf} session セッション機能設定
 */


/**
 * コア機能の初期化を行います
 * @param {CoreConf} definition 環境構成情報
 */
export default async (definition)=>{
  try {
    console.log('[app] initialize');
    console.log('[app] setup env.', definition);
    await envSetup(definition.envDef);
    console.log('[app] environment vars fixed.', env);
    console.log('[app] setup session feature.')
    let session = await sessionSetup(definition.session)
    await session.checkAuthenticationProceeding();
    console.log('[boottrap] session', session);

    console.log('[bootstrap] configure router. base:', env.BASE_URL);
    configure({
      base: env.BASE_URL
    });
  } catch(e) {
    if(e instanceof AppError) {
      throw e;
    } else {
      throw new AppError('bootstrap', 'fail to setup core features.', e);
    }
  }
};
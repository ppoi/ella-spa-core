'use strict';

import env, { __setup__ as envSetup } from './env.js';
import { AppError } from './errors.js';
import { configure } from './router.js';
import session, { __setup__ as sessionSetup } from './session.js';


/**
 * Core機能を初期化します。
 * @param {import("./index.d.ts").CoreConfig} definition 
 */
export async function bootstrap(definition) {
  try {
    console.log('[bootstrap] initialize');
    console.log('[bootstrap] setup env.', definition);
    await envSetup(definition.envDef);
    console.log('[bootstrap] environment vars fixed.', env);
    console.log('[bootstrap] setup session feature.')
    let s = await sessionSetup(definition.sessionDef)
    await s.checkAuthenticationProceeding();
    console.log('[boottrap] session', s);

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


/** @type {HTMLDialogElement} */
let loadingScreenDialog;

/**
 * ローディングスクリーンを表示または非表示にします。
 * @param {boolean} show - ローディングスクリーンの表示状態 
 */
export function loading(show) {
  if(loadingScreenDialog == null) {
    loadingScreenDialog = document.createElement('dialog');
    loadingScreenDialog.classList.add('loading-screen');
    loadingScreenDialog.innerHTML = '<span class="loading-spinner"></span>'
    loadingScreenDialog.addEventListener('keydown', (ev)=>{
      if(ev.key == "Escape") {
        ev.preventDefault();
      }
    });
    document.body.append(loadingScreenDialog);
  }
  if(show) {
    loadingScreenDialog.showModal();
  } else {
    loadingScreenDialog.close();
  }
}

export {
  env,
  session
};
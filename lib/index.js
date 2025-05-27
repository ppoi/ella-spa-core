'use strict';

import env, { __setup__ as envSetup } from './env.js';
import { AppError } from './errors.js';
import { configure } from './router.js';
import session, { __setup__ as sessionSetup } from './session.js';


/**
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

/**
 * ローディングスクリーンを表示または非表示にします。
 * @param {boolean} show - ローディングスクリーンの表示状態 
 */
export function loading(show) {
  /** @type {HTMLElement} */
  let screenElement = document.querySelector('#loading-screen');
  if(show) {
    if(screenElement == null) {
      // <div id="loading-screen" class="loading-screen"><div class="loading-spinner spinner-border text-primary"><span class="visibility-hidden">Loading...</span></div></div>
      screenElement = document.body.appendChild(document.createElement('div'));
      screenElement.id = 'loading-screen';
      screenElement.classList.add('loading-screen');
      let spinnerContainer = screenElement.appendChild(document.createElement('div'));
      spinnerContainer.classList.add('loading-spinner', 'spinner-border', 'text-primary');
      spinnerContainer.role = 'status';
      let spinner = spinnerContainer.appendChild(document.createElement('span'));
      spinner.classList.add('visually-hidden');
      spinner.textContent = 'Loading...';
    }
    screenElement.hidden = false;
  } else if(screenElement != null) {
    screenElement.hidden = true;
  }
}

export {
  env,
  session
};
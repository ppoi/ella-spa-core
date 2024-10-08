'use strict';
import route, { router, toRegexp, match, configure as rawthConfigure} from 'rawth';
import { tick } from 'svelte';
import { writable } from 'svelte/store';

router.on.error((error)=>{
  console.error('[router] router error', error);
});

/**
 * ページルータのマッチング状態
 * @type {import('svelte/store').Writable<boolean>}
 */
const routeMatched = writable(false);

/**
 * ページルータにページを登録します。
 * @param {string} path ページ表示を行うパス正規表現
 * @param {Function} entered 現在のURLにマッチした際のコールバック
 * @param {Function} exited 現在のURLがマッチしなくなった際のコールバック
 * @returns {Function} 終了時コールバック
 */
function register(path, entered, exited) {
  console.log('[router] register path', path);
  let pathRegexp = toRegexp(path);
  let stream = route(path);
  let active = false;

  const exit = ()=>{
    console.log('[router] exit', path, active);
    if(active) {
      router.off.value(checkExit);
      active = false;
      exited();
    }
    routeMatched.set(false);
  };
  const checkExit = (value)=>{
    console.log('[router] check path', value);
    if(!match(value, pathRegexp)) {
      exit();
    }
  };

  stream.on.value(async params=>{
    exit();
    await tick();
    active = true;
    router.on.value(checkExit);
    routeMatched.set(active);
    entered(params);
  });
  stream.on.error((error)=>{
    console.error('[router] error!', error);
  })

  return ()=>{
    console.log('[router] router end.', path);
    exit();
    stream.end();
  }
}

/**
 * 指定されたページに遷移します。
 * @param {string} path 遷移先パス
 * @param {boolean} [silently] ヒストリを更新しない場合true
 */
function navigate(path, silently) {
  console.log('[router] navigate', path);
  setTimeout(()=>{
    if(silently) {
      window.history.replaceState(null, null, path);
    } else {
      window.history.pushState(null, null, path);
    }
    router.push(path);
  });
}

/**
 * クリックイベントをnavigateにアタッチします。
 * @param {PointerEvent} ev クリックイベント
 */
async function handleClick(ev) {
  if(ev.defaultPrevented) {
    // 条件: 不活性化されてない
    return;
  }
  let node = ev.target;
  do {
    if(node.nodeName == 'A') {
      // 条件: Aタグ内からのclickイベント
      if(node.dataset['widget'] == 'pushmenu') {
        // 条件: (AdminLTE対応)data-widget="pushmenu"がない
        break;
      };
      let href = node.attributes.href;
      if(href && href.value) {
        try {
          let url = new URL(href.value, baseURI).toString();
          if(url.startsWith(baseURI)) {
            // 条件: 外部URLではない
            ev.preventDefault();
            navigate(url);
          }
        } catch(e) {
          console.error('invalid URL', href.value, e);
        }
        break;
      }
    }
    node = node.parentNode;
  } while(node);
}

/**
 * popstateイベントをnavigateにアタッチします。
 * @param {PopStateEvent} ev PopStateイベント
 */
function handlePopstate(ev) {
  navigate(window.location.href, true);
}

/**
 * ルーティング処理とDOMイベントを関連付けます。
 */
function registerDOMEventListeners() {
  window.addEventListener('click', handleClick);
  window.addEventListener('popstate', handlePopstate);
}

/**
 * DOMイベントとのルーティング処理の関連付けを解除します。
 */
function unregisterDOMEventListeners() {
  window.removeEventListener('click', handleClick);
  window.removeEventListener('popstate', handlePopstate);
}

/**
 * ベースURI
 */
let baseURI = document.baseURI;

/**
 * rawthルータ設定
 * @param {*} options rawthルータオプション
 */
function configure(options) {
  if(options.base != null) {
    baseURI = options.base;
  }
  console.log('[router] configure', options);
  rawthConfigure(options);
}

export {
  configure,
  navigate,
  register,
  routeMatched,
  registerDOMEventListeners,
  unregisterDOMEventListeners
}
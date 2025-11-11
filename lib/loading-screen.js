'use strict';

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

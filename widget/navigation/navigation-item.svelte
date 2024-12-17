<script>
  /**
   * @typedef {Object} Props
   * @property {string} path - リンクパス
   * @property {string} icon - Material Symbol
   * @property {string} label - ラベル
   * @property {boolean} [active] - アクティブ状態
   * @property {Function} [onclick] - clickイベントハンドラ
   * @property {Function} [onmouseenter] - mouseenterイベントハンドラ
   * @property {boolean} [blocked] - 閉塞フラグ
   */
  /** @type Props */
  let { path, icon, label, active = $bindable(false), blocked, onclick, onmouseenter } = $props();

  function eventHandler(callback) {
    return (e)=>{
      if(blocked) {
        e.preventDefault();
      } else {
        callback?.();
      }
    }
  }
</script>

<a href="{path}" class="section-link" class:active="{ active }" class:blocked={blocked} onclick={eventHandler(onclick)} onmouseover={eventHandler(onmouseenter)}>
  <span class="navicon material-symbols-outlined">{ icon }</span>
  <div class="label">{ label }</div>
</a>

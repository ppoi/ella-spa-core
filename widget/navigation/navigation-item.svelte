<script>
  /**
   * @typedef {Object} Props
   * @property {string} path - リンクパス
   * @property {string} icon - Material Symbol
   * @property {string} label - ラベル
   * @property {boolean} [active] - アクティブ状態
   * @property {Function} [onclick] - clickイベントハンドラ
   * @property {Function} [onmouseenter] - mouseenterイベントハンドラ
   */
  /** @type Props */
  let { path, icon, label, active = $bindable(false), onclick, onmouseenter } = $props();
</script>

<a href="{path}" class="section-link" class:active="{ active }" {onclick} {onmouseenter}>
  <span class="navicon material-symbols-outlined">{ icon }</span>
  <div class="label">{ label }</div>
</a>

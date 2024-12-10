<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children] - navigation-barに表示するコンテンツ
   */
  /** @type Props */
  let { children } = $props();
</script>

<nav class="navigation-rail">
  {@render children?.()}
</nav>

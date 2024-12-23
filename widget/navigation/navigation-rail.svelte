<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [menu] - navigation-barに表示するコンテンツ
   * @property {import('svelte').Snippet} [children] - navigation-barに表示するコンテンツ
   */
  /** @type Props */
  let { menu, configuration, children } = $props();
</script>

<div class="navigation-rail">
  <nav class="navigation-rail-content mt-3">
    <div class="menu">
      {@render menu?.()}
    </div>
    {@render children?.()}
  </nav>
  <div class="navigation-rail-configuration">
    {@render configuration?.()}
  </div>
</div>

<style>
  .navigation-rail {
    background: linear-gradient(0deg,rgba(209,225,255,.08),rgba(209,225,255,.08)), var(--gv-navigation-background-color, #1f1f1f);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0px;
    left: 0px;
    height: 100vh;
    width: var(--gv-navigation-width, 80px);
    justify-content: space-between;
    overflow-y: auto;
    z-index: 101;
  }
</style>
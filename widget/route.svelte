<script>
  import { onDestroy, onMount } from 'svelte';
  import { register } from '../lib/router';

  /**
   * @typedef {Object} Props
   * @property {string} path - ページパス
   * @property {import('svelte').SvelteComponent} [tag] - ルート有効時に表示するSvelteタグ
   * @property {import('svelte').Snippet} [children] - ルート有効時に表示するコンテンツ
   */
  /** @type {Props} */
  let { path = null, tag: Tag = null, children } = $props();

  let active = $state(false);
  let properties = $state(null);
  let cleanup = null;

  function entered(params){
    active = true;
    properties = params;
    console.log('[route] entered', path, params);
  }

  function exited() {
    active = false;
    console.log('[route] exited', path);
  }

  onMount(()=>{
    cleanup = register(path, entered, exited);
  });
  onDestroy(()=>{
    cleanup();
  });
</script>

{#if active}
  {#if Tag != null}
    <Tag {...properties}></Tag>
  {:else}
    {@render children?.()}
  {/if}
{/if}

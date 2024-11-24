<script module>
  import { writable } from "svelte/store";
  export const loading = writable(false);
</script>

{#if $loading}
<div class="loading-screen">
  <div class="loading-spinner spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
{/if}

<style>
  :scope { display: block; }
  .loading-screen {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    margin: 0;
    padding: 0;
    background-color: black;
    opacity: 0.5;
    z-index: 99999;
  }
  .loading-spinner {
    margin-left: calc(50vw - 2rem);
    margin-top: calc(50vh - 2rem);
  }
</style>

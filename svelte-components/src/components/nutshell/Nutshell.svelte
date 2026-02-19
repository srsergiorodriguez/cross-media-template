<svelte:options customElement="dh-nutshell" />
<script>
  let { message } = $props();
</script>

<div class="catalog-wrapper">
  {message}
</div>

<style>
  .catalog-wrapper {
    display: inline;
    padding: 10px;
    color: white;
    background: black;
  }
  /* CSS here stays inside the component's Shadow DOM */
</style>
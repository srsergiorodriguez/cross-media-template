<script>
  // import devData from '../../../../input/media/files/api/data.json';
  import devData from '$api/data.json';

  // Svelte 5 uses the $props() rune to get data from the outside
  let { message, config } = $props();

  let items = $state([]);
  let loading = $state(true);

  async function loadData() {
    // Check if we are in dev or in production
    const isLive = window.location.protocol === 'https:';
    
    try {
      if (!isLive) {
        // This will bake the current version of the data.json when npm run build/dev is executed. This is good enough for development and testing
        items = devData;
      } else {
        const url = `${config.media}api/data.json`;
        const response = await fetch(url);
        const data = await response.json();      
        items = data;
      }
    } catch (err) {
      console.error("Error loading Data:", err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadData();
  });

  // We use the $state() rune for reactivity
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<div class="test-container">
  <h1>{message}</h1>
  <!-- <pre>{JSON.stringify(items, null, 2)}</pre> -->
  <p>Status: <strong>Svelte 5 Runes are Active</strong></p>
  
  <button onclick={increment}>
    Interactive Check: {count}
  </button>

  {#if loading}
    <p>Cargando catálogo...</p>
  {:else}
    <ul>
      {#each items as item}
        <li><strong>{item.name}</strong> ({item.date})</li>
      {/each}
    </ul>
  {/if}

</div>

<style>
  .test-container {
    padding: 20px;
    border: 2px solid #ff3e00; /* Svelte Orange */
    border-radius: 8px;
    background: #fff5f0;
    font-family: sans-serif;
  }
  
  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
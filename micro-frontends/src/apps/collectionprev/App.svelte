<script>
  import { onMount } from 'svelte';
  import devData from '$api/data.json';

  let { config } = $props();

  // --- Reactive State ---
  let items = $state([]);
  let loading = $state(true);
  let currentId = $state(null); // Moved to top level so $derived can see it

  // --- Derived State (Automagic Filtering) ---
  // This updates whenever 'items' finishes loading OR the 'currentId' (URL hash) changes
  let selectedItem = $derived(items.find(i => i.id == currentId));

  async function loadData() {
    const isLive = window.location.protocol.startsWith('http');
    
    try {
      if (!isLive || window.location.hostname === 'localhost') {
        items = devData;
      } else {
        // Use the config passed from Publii
        const url = `${config.media}api/data.json`;
        const response = await fetch(url);
        items = await response.json();      
      }
    } catch (err) {
      console.error("Error loading Data:", err);
    } finally {
      loading = false;
    }
  }

  // Helper to handle the URL hash logic
  const updateRoute = () => {
    // Converts "#/45" into "45"
    const hash = window.location.hash.replace('#/', '');
    currentId = hash ? hash : null;
  };

  // onMount is better than $effect for event listeners to avoid memory leaks
  onMount(() => {
    loadData();
    window.addEventListener('hashchange', updateRoute);
    updateRoute(); // Initial check on load

    return () => window.removeEventListener('hashchange', updateRoute);
  });

  function getImagePath(pid) {
    const basePath = config?.media ? config.media : '..input/media/filesimages';
    return `${basePath}images/${pid}.jpg`;
  }
</script>

<div class="serie-mini-container">
  {#if loading}
    <p>Cargando colección...</p>
  {:else if selectedItem}
    <div class="detail-card">
      <button onclick={() => window.location.hash = ''}>← Volver al catálogo</button>
      <pre>{JSON.stringify(selectedItem)}</pre>
    </div>
  {:else}
    <div class="grid">
      {#each items as item}
        <div class="card">
          <a href="#/{item.id}">
            <div class="image-container">
              <img src={getImagePath(item.pid)} alt={item.titulo} />
            </div>
            <h3>{item.label}</h3>
          </a>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .image-container {
    width: 300px;
  }
  .image-container img {
    width: 100%;
  }
</style>
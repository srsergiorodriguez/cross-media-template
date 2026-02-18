<script>
  import devData from '$api/data.json';

  // Svelte 5 uses the $props() rune to get data from the outside
  let { message, config } = $props();

  let items = $state([]);
  let loading = $state(true);

  async function loadData() {
    // Check if we are in dev or in production
    const isLive = window.location.protocol === 'https:' || window.location.protocol === 'http:';
    
    try {
      if (!isLive || window.location.hostname === 'localhost') {
        // Local Vite development fallback
        items = devData;
      } else {
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

  $effect(() => {
    loadData();
  });

  // Helper function to safely resolve image paths whether in dev or Publii
  function getImagePath(pid) {
    const basePath = config?.media ? config.media : '/media/files/';
    return `${basePath}images/${pid}.jpg`;
  }
</script>

<div class="catalog-container">  
  {#if loading}
    <p class="loading-text">Cargando catálogo...</p>
  {:else}
    <div class="table-responsive">
      <table class="metadata-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Título</th>
            <th>Autores</th>
            <th>Año</th>
            <th>Ubicación</th>
            <th>Formato</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr>
              <td class="img-cell">
                <img src={getImagePath(item.pid)} alt={item.label} loading="lazy" />
              </td>
              <td class="title-cell"><strong>{item.label}</strong></td>
              <td>{item.autores}</td>
              <td class="center-text">{item.fecha}</td>
              <td>{item.ciudad}, {item.pais}</td>
              <td>
                <span class="tag">{item.tipo_principal}</span>
                <span class="tag tag-outline">{item.medio_impresion}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .catalog-container {
    padding: 20px;
    background: #ffffff;
    font-family: sans-serif;
    color: #333;
  }

  .loading-text {
    font-style: italic;
    color: #666;
  }

  /* Make the table scroll horizontally on small screens */
  .table-responsive {
    overflow-x: auto;
  }

  .metadata-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    text-align: left;
  }

  .metadata-table th, 
  .metadata-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #eaeaea;
    vertical-align: middle;
  }

  .metadata-table th {
    background-color: #f9f9f9;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }

  .metadata-table tr:hover {
    background-color: #fcfcfc;
  }

  .title-cell strong {
    font-size: 1.05rem;
    color: #000;
  }

  .center-text {
    text-align: center;
  }

  /* Image Styling */
  .img-cell {
    width: 80px; /* Fixed width for the image column */
  }

  .img-cell img {
    width: 80px;
    height: 80px;
    object-fit: cover; /* Ensures images are square without stretching */
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* Tags for the format/medium */
  .tag {
    display: inline-block;
    padding: 4px 8px;
    margin-right: 4px;
    margin-bottom: 4px;
    font-size: 0.75rem;
    background: #eee;
    border-radius: 4px;
    white-space: nowrap;
  }

  .tag-outline {
    background: transparent;
    border: 1px solid #ccc;
  }
</style>
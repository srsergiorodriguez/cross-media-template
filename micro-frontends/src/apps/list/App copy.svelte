<script>
  import Papa from 'papaparse';

  // In Svelte 5, we use the $props() rune to get data from the outside
  let { message, config } = $props();

  let items = $state([]);
  let loading = $state(true);

  async function loadCSV() {
    // We use the assets path from our Publii bridge
    // const url = `${config.media}/data/publications.csv`;
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVeaLQWAIhdwPIUVNLZBjHuZQSyYOgkBoU3cvSKHaCKwZyBHfOs7ywsgVC4Nb3BkQTCJjeCtzhtFJN/pub?output=csv";
    
    try {
      const response = await fetch(url);
      const csvText = await response.text();

      const results = await new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: 'greedy',
          complete: resolve,
          error: reject
        });
      });

      // Verification: Check your headers in the console!
      //console.log("Headers found:", Object.keys(results.data[0]));
      
      items = results.data;
    } catch (err) {
      console.error("Error loading CSV:", err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadCSV();
  });

  /* {
    "assets":"file:///Users/sergiorodriguez/Documents/Publii/sites/cross-media-template/preview/assets",
    "media":"file:///Users/sergiorodriguez/Documents/Publii/sites/cross-media-template/preview/media/files/",
    "lang":"es",
    "postTitle":"Test post"}
    https://getpublii.com/dev/introduction-global-variables/
  */

  // We use the $state() rune for reactivity
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<div class="test-container">
  <h1>{message}</h1>
  <!-- <pre>{JSON.stringify(items[0], null, 2)}</pre> -->
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
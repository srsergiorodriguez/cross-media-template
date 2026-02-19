<script>
  import { onMount } from 'svelte';

  // --- Configuration ---
  // If this fails due to CORS/Anubis, we add "https://corsproxy.io/?" to the front
  const SRU_BASE = "https://digital.iai.spk-berlin.de/viewer/sru/";
  
  let query = $state("digital.collection:fotos"); // Default search (e.g., Photos)
  let items = $state([]);
  let loading = $state(false);

  async function searchIAI() {
    loading = true;
    // SRU URL building: we ask for Dublin Core (dc) metadata
    const url = `${SRU_BASE}?version=1.1&operation=searchRetrieve&query=${encodeURIComponent(query)}&maximumRecords=10&recordSchema=dc`;

    try {
      const res = await fetch("https://corsproxy.io/?" + url);
      // const res = await fetch(url);
      const xmlText = await res.text();
      console.log(xmlText)

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const records = xmlDoc.getElementsByTagName("zs:record");

      items = Array.from(records).map(record => {
        return {
          id: record.getElementsByTagName("dc:identifier")[0]?.textContent,
          title: record.getElementsByTagName("dc:title")[0]?.textContent,
          author: record.getElementsByTagName("dc:creator")[0]?.textContent || "Anónimo",
          date: record.getElementsByTagName("dc:date")[0]?.textContent || "S.D.",
          link: "https://digital.iai.spk-berlin.de/viewer/image/" + record.getElementsByTagName("dc:identifier")[0]?.textContent + "/1/"
        };
      });
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      loading = false;
    }
  }

  onMount(searchIAI);
</script>

<div class="iai-explorer">
  <div class="search-bar">
    <input bind:value={query} placeholder="Ej: digital.collection:mapas" />
    <button onclick={searchIAI}>Consultar Repositorio</button>
  </div>

  {#if loading}
    <p>Conectando con Berlín...</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Autor</th>
          <th>Año</th>
          <th>Enlace IAI</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item}
          <tr>
            <td><strong>{item.title}</strong></td>
            <td>{item.author}</td>
            <td>{item.date}</td>
            <td><a href={item.link} target="_blank">🔗 Ver Original</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .iai-explorer { font-family: sans-serif; }
  .search-bar { margin-bottom: 1rem; display: flex; gap: 5px; }
  .search-bar input { flex-grow: 1; padding: 5px; border: 1px solid #ccc; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
  th { background: #f9f9f9; text-transform: uppercase; font-size: 0.7rem; }
  a { color: #b16286; text-decoration: none; font-weight: bold; }
</style>
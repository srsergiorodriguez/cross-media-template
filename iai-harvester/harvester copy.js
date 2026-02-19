import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const API_KEY = process.env.DDB_API_KEY;
const OUTPUT_PATH = path.resolve('../input/media/files/api/iai_items.json');

// The internal ID for IAI Berlin in the DDB system
const IAI_PROV_ID = "00010419"; 

async function harvestDDB() {
  console.log("🚀 Iniciando cosecha desde Deutsche Digitale Bibliothek...");
  
  if (!API_KEY) {
    console.error("❌ Error: No se encontró DDB_API_KEY en el archivo .env");
    return;
  }

  let allItems = [];
  let rows = 100; // DDB allows up to 100 per request
  let offset = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      // We search for everything where the provider is IAI
      const url = `https://api.deutsche-digitale-bibliothek.de/search?query=provider_id:${IAI_PROV_ID}&rows=${rows}&offset=${offset}&oauth_consumer_key=${API_KEY}`;
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`DDB API Error: ${response.status}`);

      const data = await response.json();

      console.log(data);
      const docs = data.results[0].docs;

      if (!docs || docs.length === 0) {
        hasMore = false;
        break;
      }

      // Map the DDB schema to your project's clean schema
      const batch = docs.map(doc => ({
        id: doc.id,
        title: doc.title,
        subtitle: doc.subtitle || "",
        // The DDB provides a nice thumbnail path
        thumb: doc.thumbnail ? `https://www.deutsche-digitale-bibliothek.de${doc.thumbnail}` : null,
        mediaType: doc.media || "unknown",
        // Direct link to the item in DDB
        link: `https://www.deutsche-digitale-bibliothek.de/item/${doc.id}`
      }));

      allItems.push(...batch);
      console.log(`📦 Guardados ${allItems.length} de ${data.results[0].numberOfResults} ítems totales...`);

      offset += rows;
      
      // Safety limit for testing - remove for full harvest
      if (offset >= 500) hasMore = false; 

      // Be a good citizen: small delay
      await new Promise(r => setTimeout(r, 200));
    }

    // Write file to Publii input
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allItems, null, 2));

    console.log(`\n🎉 ÉXITO: Se han guardado ${allItems.length} ítems en ${OUTPUT_PATH}`);

  } catch (error) {
    console.error("❌ Falló la cosecha:", error.message);
  }
}

harvestDDB();
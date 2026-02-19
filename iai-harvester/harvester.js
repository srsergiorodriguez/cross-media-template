import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const BASE_URL = "https://digital.iai.spk-berlin.de/viewer/oai";
const OUTPUT_PATH = path.resolve('../input/media/files/api/iai_items.json');
const CUSTOM_USER_AGENT = "Revistas Culturales 2.0 - Eberhard Karls Universität Tübingen";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  parseAttributeValue: true
});

async function fetchPage(resumptionToken = "") {
  // We use oai_dc for speed/simplicity, or 'mets' for deep data
  // Let's stick to oai_dc for the first full test of 12k items
  const url = resumptionToken
    ? `${BASE_URL}?verb=ListRecords&resumptionToken=${resumptionToken}`
    : `${BASE_URL}?verb=ListRecords&metadataPrefix=oai_dc`;

  const response = await fetch(url, {
    headers: { 'User-Agent': CUSTOM_USER_AGENT, 'Accept': 'application/xml' }
  });

  const xml = await response.text();
  return parser.parse(xml)["OAI-PMH"].ListRecords;
}

async function startHarvest() {
  console.log("🚀 Iniciando cosecha de ítems...");
  let allItems = [];
  let currentToken = "";
  let hasMore = true;
  let page = 1;

  try {
    while (hasMore) {
      console.log(`📑 Procesando página ${page}...`);
      const result = await fetchPage(currentToken);
      const records = Array.isArray(result.record) ? result.record : [result.record];

      const batch = records.map(r => {
        const dc = r.metadata.dc;
        const id = r.header.identifier;

        // Helper to handle both single strings and arrays of values
        const getFirst = (val) => Array.isArray(val) ? val[0] : val;
        const getAll = (val) => Array.isArray(val) ? val : (val ? [val] : []);

        return {
          id: id,
          title: getFirst(dc.title) || "Sin título",
          creator: getFirst(dc.creator) || "Desconocido",
          date: getFirst(dc.date) || "N.D.",
          // Enhanced metadata
          subjects: getAll(dc.subject),       // Array for tags
          description: getFirst(dc.description) || "",
          type: getFirst(dc.type) || "desconocido",
          language: getFirst(dc.language) || "zxx", // zxx = no linguistic content
          rights: getFirst(dc.rights) || "Consultar repositorio",

          // Context
          collections: getAll(r.header.setSpec), // All sets this item belongs to

          // Media links
          thumb: `https://digital.iai.spk-berlin.de/viewer/content/${id}/800/0/default.jpg`,
          link: `https://digital.iai.spk-berlin.de/viewer/image/${id}/1/`
        };
      });

      allItems.push(...batch);
      const totalRecords = result.resumptionToken?.['completeListSize'] || "Unknown";
      console.log(`📦 Status: ${allItems.length} / ${totalRecords} items collected.`);

      if (result.resumptionToken && result.resumptionToken['#text']) {
        currentToken = result.resumptionToken['#text'];
        page++;
        // 12,000 items is a lot. Let's pause 1s between pages to be a good guest.
        await new Promise(r => setTimeout(r, 1000));
      } else {
        hasMore = false;
      }

      // SAFETY LIMIT for your first test run. Remove this to get all
      // if (page > 2) hasMore = false;
    }

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allItems, null, 2));

    console.log(`\n🎉 ÉXITO: Se guardaron ${allItems.length} ítems.`);

  } catch (error) {
    console.error("❌ Error en la cosecha:", error.message);
  }
}

startHarvest();
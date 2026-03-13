const fs = require('fs');
const path = require('path');

class MirlaCollectionGenerator {
  constructor(API, name, config) {
    this.API = API;
    this.name = name;
    this.config = config;
  }

  addEvents() {
    // Only run if the user toggled "Enable Collection Generation" to ON
    if (this.config.enableGenerator) {
      // 'afterRender' means Publii has finished building the standard website.
      // Now it's our turn to run.
      this.API.addEvent('afterRender', this.locateDataset.bind(this), 1, this);
    }
  }

  locateDataset() {
    console.log("==========================================");
    console.log("[Mirla Plugin] Starting Step 1: Locating Dataset");
    
    // 1. Get the path the user typed in the settings
    const datasetPath = this.config.datasetPath;

    // Check if the user left the path blank
    if (!datasetPath) {
      console.warn("[Mirla Plugin] ERROR: No dataset path provided in settings.");
      return;
    }

    // Check if the folder actually exists on the computer
    if (!fs.existsSync(datasetPath)) {
      console.warn(`[Mirla Plugin] ERROR: Folder does not exist at path: ${datasetPath}`);
      return;
    }

    console.log(`[Mirla Plugin] Folder found: ${datasetPath}`);

    // 2. Look for the Metadata.csv inside that folder
    const metadataPath = path.join(datasetPath, 'Metadata.csv');

    if (!fs.existsSync(metadataPath)) {
      console.error(`[Mirla Plugin] ERROR: Could not find Metadata.csv in ${datasetPath}`);
      return;
    }

    console.log("[Mirla Plugin] Success! Metadata.csv found.");

    // 3. Just read the raw file as text to prove we have access to it
    const rawText = fs.readFileSync(metadataPath, 'utf8');
    
    // Print out the first 100 characters just to verify it's reading the right file
    console.log("[Mirla Plugin] Raw file preview (first 100 characters):");
    console.log(rawText.substring(0, 100));
    console.log("==========================================");
  }
}

module.exports = MirlaCollectionGenerator;
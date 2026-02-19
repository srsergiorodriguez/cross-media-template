import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        // This is the magic switch for Web Components
        customElement: true, 
      },
      // Ensure CSS is bundled into the JS component
      emitCss: false 
    })
  ],
  resolve: {
    alias: {
      '$api': path.resolve(__dirname, '../input/media/files/api'),
      '$lib': path.resolve(__dirname, './src/lib'),
    }
  },
  build: {
    // Direct output to Publii theme JS folder
    outDir: '../input/themes/crossmedia/assets/js', 
    emptyOutDir: false,
    
    // We use Library Mode for Web Components
    lib: {
      entry: {
        'dh-nutshell': './src/components/nutshell/index.js',
      },
      formats: ['iife'], // Best for direct <script> includes in Publii
      name: 'DHComponents'
    },
    
    rollupOptions: {
      output: {
        // This ensures the filename matches the key in the entry object
        entryFileNames: '[name].js',
        // In Svelte 5 Web Components, we usually don't need manual inlining 
        // because the compiler handles the Shadow DOM CSS
        inlineDynamicImports: true
      }
    },
    target: 'es2017', // Svelte 5 likes slightly newer JS
  },
});
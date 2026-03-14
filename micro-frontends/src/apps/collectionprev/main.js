import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('svelte-collection-app');

if (target) {  
  mount(App, {
    target: target,
    props: {
      config: window.PUBLII_CONTEXT || {}
    }
  });
}
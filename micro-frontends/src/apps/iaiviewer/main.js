import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('svelte-iaiviewer-app');

if (target) {  
  mount(App, {
    target: target,
    props: {
      config: window.PUBLII_CONTEXT || {}
    }
  });
}
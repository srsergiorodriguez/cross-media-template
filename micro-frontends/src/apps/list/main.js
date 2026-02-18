import { mount } from 'svelte';
import App from './App.svelte';

/* {
  Examples:
  "assets":"file:///USERPATH/Publii/sites/cross-media-template/preview/assets",
  "media":"file:///USERPATH/Publii/sites/cross-media-template/preview/media/files/",
  "lang":"es",
  "postTitle":"Test post"}
  https://getpublii.com/dev/introduction-global-variables/
*/

const target = document.getElementById('svelte-list-app');

if (target) {
  // Clear any "Loading..." text inside the div before mounting
  target.innerHTML = ''; 
  
  mount(App, {
    target: target,
    props: { 
      // You can pass your Publii data here later
      message: "Hello from Svelte 5 Runes!",
      config: window.PUBLII_CONTEXT || {}
    }
  });
}
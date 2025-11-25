import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {createPinia} from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'nes.css/css/nes.min.css'
import "nes.icons/css/nes-icons.min.css";
import "@fontsource/press-start-2p";

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.mount('#app')
import { useUserStore } from './stores/UserStore.js';
useUserStore().init()

<script setup>
import Header from './components/Header.vue'
import Lobby from './components/Lobby.vue'
import Console from './components/Console.vue'
import {computed} from 'vue'
import { useModeStore } from './stores/ModeStore'

const isAdmin = computed(() => useModeStore().isAdminMode())
</script>

<template>
  <div class="app-root d-flex flex-column min-vh-100">
    <Header />
    <template v-if="isAdmin">
      <Console></Console>
    </template>
    <template v-else>
      <Lobby></Lobby>
    </template>
    <main class="app-main flex-grow-1">
      <div class="container py-3">
        <router-view />
      </div>
    </main>
  </div>
 
</template>

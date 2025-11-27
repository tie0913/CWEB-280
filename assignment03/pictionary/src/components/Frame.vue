<template>
<template v-if="isAdminMode">
    <Console />
</template>
<template v-else>
    <Lobby />
</template></template>
<script setup>
import {computed} from 'vue'
import { useModeStore } from '../stores/ModeStore';
import Lobby from './Lobby.vue';
import Console from './Console.vue';

const modeStore = useModeStore()
const isAdminMode = computed(() => modeStore.isAdminMode)
</script>
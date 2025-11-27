<template>
<template v-if="isAdminMode">
    <Console />
</template>
<template v-else>
    <Lobby @sign-in="emit('sign-in')"/>
</template></template>
<script setup>
const emit = defineEmits(['sign-in'])
import {computed} from 'vue'
import { useModeStore } from '../stores/ModeStore';
import Lobby from './Lobby.vue';
import Console from './Console.vue';

const modeStore = useModeStore()
const isAdminMode = computed(() => modeStore.isAdminMode)
</script>
<!-- 
    Frame Widget contains Console and Lobby
-->
<template>
<template v-if="isAdminMode">
    <Console :admin-tab="props.adminTab" />
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

const props = defineProps({
    adminTab:{
        type: String,
        default: 'user'
    }
})
</script>
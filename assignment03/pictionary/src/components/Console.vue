<script setup>
import UserAdminPage from "./UserAdminPage.vue"
import RoomAdminPage from "./RoomAdminPage.vue"
import WordAdminPage from "./WordAdminPage.vue"
const props = defineProps({
    adminTab:{
        type: String,
        default: 'user'
    }
})
</script>

<template>
<section class="nes-container is-rounded">
    <h1 class="nes-text is-primary">Admin Console</h1>
    <p class="nes-text is-success">
        Active tab: {{ props.adminTab }}
    </p>
    <div v-if="props.adminTab==='user'">
        <UserAdminPage/>
    </div>
    <div v-else-if="props.adminTab==='room'">
        <RoomAdminPage/>
    </div>
    <div v-else-if="props.adminTab==='word'">
        <WordAdminPage/>
    </div>
</section>
</template>
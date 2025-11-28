<script setup>
import { apiRequest } from '../network/Request';
import { ref, onMounted, computed } from 'vue'
import RoomCard from './RoomCard.vue'
import { useUserStore } from '../stores/UserStore';
import CreateRoomModal from './CreateRoomModal.vue';
import Room from './Room.vue';

const curRoom = ref()
const rooms = ref([])
const selectedRoomId = ref('')
const loading = ref(false)

const emit = defineEmits(['sign-in'])

const isGuest = computed(() => !useUserStore().get())

const load = async () => {
  loading.value = true
  try {
    const last = rooms.value.length == 0 ? {_id:''} : rooms.value[rooms.value.length - 1]
    const url = `/rooms/fetch?lastId=${last?._id}`
    const result = await apiRequest(url, {
      method: "GET",
    })

    if (result.code === 0) {
      rooms.value = rooms.value.concat(result.body)
    }
  } catch (e) {
    console.log('err', e)
  }finally{
    loading.value = false
  }
}

onMounted(() => {
  load()
})

const refresh = async () => {
  const ids =  rooms.value.map((e) => e._id)
  loading.value = true
  try{
    const result = await apiRequest('/rooms/rr', {
      method:'POST',
      body:JSON.stringify(ids)
    })
    if(result.code === 0){
      rooms.value = result.body
    }
  }catch(e){
    console.log('err', e)
  }finally{
    loading.value = false
  }

}
const roomCreated = (newRoom) => {
  rooms.value = [newRoom].concat(rooms.value)
  open(newRoom._id, newRoom)
}

const open = (roomId, newRoom) => {
  selectedRoomId.value = roomId
  curRoom.value = newRoom
  showRoom.value = true
}


const showCreateModal = ref(false)
const showRoom = ref(false)

</script>
<template>
  <section class="lobby">
    <div v-if="loading" class="lobby-loading d-flex flex-column justify-content-center align-items-center">
      <i class="nes-icon coin is-large"></i>
      <p class="mt-3 mb-0">Loading rooms...</p>
    </div>
    <template v-else>
      <div class="lobby-content">
        <div v-if="!rooms || rooms.length === 0" class="lobby-empty nes-container">
          <h3>The Lobby is Empty</h3>
          <p v-if="isGuest">Please sign in or up, we are waiting for you</p>
          <p v-else>Create a room by clicking the button on the bottom right corner</p>
        </div>

        <div v-else class="room-list">
          <div v-for="room in rooms" :key="room._id" class=" nes-container with-title room-card">
            <RoomCard :room="room" @open="open" @sign-in="emit('sign-in')"/>
          </div>
        </div>
      </div>

      <div v-if="!isGuest" class="lobby-panel d-flex justify-content-end gap-3 mt-3">
        <button class="nes-btn is-warning" title="Refresh" @click="refresh()">
          <svg width="18" height="18" viewBox="0 0 24 24" style="image-rendering: pixelated;">
            <path fill="black"
              d="M17.65 6.35a8 8 0 1 0 2.3 5.65h-2a6 6 0 1 1-1.76-4.24l-2.12 2.12H22V2l-2.12 2.12a9.923 9.923 0 0 0-2.23 2.23z" />
          </svg>
        </button>
        <button class="nes-btn is-primary " title="Load More" @click="load">
          <svg width="20" height="20" viewBox="0 0 24 24" style="image-rendering: pixelated;">
            <path fill="currentColor" d="M7 10h2l3 3 3-3h2l-5 5-5-5z" />
          </svg>
        </button>
        <button class="nes-btn is-success" title="Create Room" @click="showCreateModal = true">
          <svg width="20" height="20" viewBox="0 0 24 24" style="image-rendering: pixelated;">
            <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
          </svg>
        </button>
      </div>
    </template>
  </section>

  <CreateRoomModal v-model:show="showCreateModal" @create="roomCreated"></CreateRoomModal>
  <Room v-model:show="showRoom" :room-id="selectedRoomId" :room="curRoom" @update:rooms="refresh()"></Room>
</template>
<style scoped>
.lobby {
  position: relative;
  height: 80vh;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.lobby-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}


.lobby-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  z-index: 10;
  text-align: center;
}

/* 空状态 */
.lobby-empty {
  margin:auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.room-card {
  box-sizing: border-box;
  flex: 0 0 calc(25% - 1rem);  
  max-width: calc(25% - 1rem); 
  margin: 0;                   
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lobby-panel {
  flex: 0 0 auto;
  padding-top: 0.75rem;
  border-top: 2px dashed rgba(0, 0, 0, 0.2);
}
</style>
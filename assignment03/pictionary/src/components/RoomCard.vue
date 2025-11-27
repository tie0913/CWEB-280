<template>
  <p class="title">{{ room.name }}</p>
  <p>Players:{{ room.members.length }} / {{ room.maxPlayers }}</p>
  <p>Status:{{ statusText(room.state) }}</p>
  <div class="actions">
    <button v-if="!isGuest" class="nes-btn is-success" @click="enterRoom">
      Enter
    </button>
    <button v-if="isGuest" class="nes-btn is-error disabled" @click="emit('sign-in')">
      Sign In
    </button>
  </div>
</template>

<script setup>
const statusText = (status) => {
  let text = "Known"
  switch (status) {
    case 0: {
      text = 'Closed'
      break
    }
    case 1: {
      text = 'Waiting'
      break
    }
    case 2: {
      text = 'OnGoing'
      break
    }
  }
  return text
}
import { computed } from 'vue'
import { useUserStore } from '../stores/UserStore'
const props = defineProps({ room: { type: Object, required: true } })
const emit = defineEmits(['open', 'sign-in'])
const userStore = useUserStore()
const isGuest = computed(() => !userStore.get())

const enterRoom = () => {
  emit('open', props.room._id)
}
</script>
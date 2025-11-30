<script setup>
import { useModeStore } from '@/stores/ModeStore'
import { useUserStore } from '@/stores/UserStore'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'user',
  },
})

const emit = defineEmits(['change-tab'])

const modeStore = useModeStore()
const userStore = useUserStore()

const setTab = (tab) => emit('change-tab', tab)

const handleSwitchMode = () => {
  modeStore.toggle()
}

const handleSignOut = () => {
  userStore.logout()
}
</script>

<template>
  <header class="admin-header nes-container is-rounded">
    <div class="left">
      <span class="title nes-text is-primary">
        Admin – {{
          activeTab === 'user'
            ? 'User'
            : activeTab === 'room'
            ? 'Room'
            : 'Words'
        }}
      </span>
    </div>

    <nav class="tabs">
      <button
        class="nes-btn"
        :class="activeTab === 'user' ? 'is-primary' : 'is-default'"
        @click="setTab('user')"
      >
        User
      </button>
      <button
        class="nes-btn"
        :class="activeTab === 'room' ? 'is-primary' : 'is-default'"
        @click="setTab('room')"
      >
        Room
      </button>
      <button
        class="nes-btn"
        :class="activeTab === 'words' ? 'is-primary' : 'is-default'"
        @click="setTab('words')"
      >
        Words
      </button>
    </nav>

    <div class="right-actions">
      <button class="nes-btn is-warning" @click="handleSwitchMode">
        Switch Play Mode
      </button>
      <button class="nes-btn is-error" @click="handleSignOut">
        Sign Out
      </button>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #e2e2e2;
  box-sizing: border-box;
}

.title {
  font-weight: 600;
  font-size: 12px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.right-actions {
  display: flex;
  gap: 8px;
}

.nes-btn.is-default {
  background-color: #f5f5f5;
}
</style>

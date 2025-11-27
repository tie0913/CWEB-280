<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/UserStore'

import Switch from './Switch.vue'
import { useModeStore } from '../stores/ModeStore'

const userStore = useUserStore()
const modeStore = useModeStore()
const isGuest = computed(() => !userStore.get())
const isAdmin = computed(() => userStore.get()?.admin)
const isPlayMode = computed(() => modeStore.isPlayMode)
const uname = computed(() => userStore.get()?.name)


const emit = defineEmits(['openSignIn', 'openSignUp', 'openSignOut', 'openProfile'])


</script>

<template>
  <header class="app-header w-100">
    <div class="container d-flex justify-content-between align-items-center py-2">
      <div class="d-flex align-items-center gap-2">
        <i class="nes-logo"></i>
        <span class="nes-text is-primary fw-bold">Pictionary</span>
      </div>

      <div class="d-flex align-items-center gap-3">
        <template v-if="isGuest">
          <button class="nes-btn is-primary" @click="emit('openSignIn')" title="Sign In">
            <i class="nes-icon user is-small clickable"></i>
          </button>
          <button class="nes-btn is-success" @click="emit('openSignUp')" title="Sign Up">
            <i class="nes-icon star is-small clickable"></i>
          </button>
        </template>
        <template v-else>
          <template v-if="isAdmin">
            <span class="nes-text is-warning">
              <Switch label-position="left"/>
            </span>
          </template>
          <button class="nes-btn is-success" @click="emit('openProfile')" title="Profile">
            <span>{{ uname }}</span><i class="nes-icon user is-small clickable" ></i>
          </button>
          <button class="nes-btn is-error" @click="emit('openSignOut')" title="Sign Out">
            <i class="nes-icon close is-small clickable"></i>
          </button>
        </template>
      </div>
    </div>
 
  </header>
</template>

<style scoped>
.app-header {
  background-color: #f7e9a5;
  border-bottom: 3px solid #000;
  padding: 10px 0;
  box-shadow: 0 4px 0 #e5d48c;
}

.app-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.clickable:hover {
  transform: scale(1.15);
  filter: brightness(1.15);
}

.app-header i {
  display: inline-block;
}

.app-header .title {
  color: #000;
  font-weight: bold;
  font-size: 14px;
}
</style>
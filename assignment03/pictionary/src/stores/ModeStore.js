import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export const useModeStore = defineStore('mode', () => {
  const PLAY_MODE = 'Play Mode'
  const ADMIN_MODE = 'Admin Mode'

  const mode = ref(PLAY_MODE)

  const isPlayMode = computed(() => mode.value === PLAY_MODE)
  const isAdminMode = computed(() => mode.value === ADMIN_MODE)

  const isEmpty = () => mode.value == null

  const clear = () => {
    console.log('[ModeStore] clear')
    mode.value = null
  }

  const toggle = () => {
    const from = mode.value
    mode.value = isPlayMode.value ? ADMIN_MODE : PLAY_MODE
    console.log('[ModeStore] toggle:', from, '=>', mode.value)
  }

  const init = () => {
    try {
      const modeInStorage = localStorage.getItem('mode')
      mode.value = modeInStorage || PLAY_MODE
      console.log('[ModeStore] init, mode =', mode.value)
    } catch (e) {
      console.log('loading mode from local storage has error', e)
      mode.value = PLAY_MODE
    }
  }

  watch(mode, (val) => {
    console.log('[ModeStore] watch, save to localStorage:', val)
    if (val) localStorage.setItem('mode', val)
    else localStorage.removeItem('mode')
  })

  return {
    mode,
    isPlayMode,
    isAdminMode,
    toggle,
    init,
    clear,
    isEmpty
  }
})

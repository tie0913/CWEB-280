import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

/**
 * Pinia store for managing application mode state (Play/Admin),
 * synchronized with localStorage and reactive across the application.
 *
 * - Provides getters to check current mode.
 * - Persists mode changes to localStorage.
 * - Supports initialization, clearing, and toggling between modes.
 *
 * @store useModeStore
 * @state {Ref<string|null>} mode - Current mode value.
 * @computed {boolean} isPlayMode - Whether current mode is Play Mode.
 * @computed {boolean} isAdminMode - Whether current mode is Admin Mode.
 *
 * @function toggle - Switches between Play Mode and Admin Mode.
 * @function init - Loads mode from localStorage or defaults to Play Mode.
 * @function clear - Clears stored mode and removes from localStorage.
 * @function isEmpty - Returns true if mode is null.
 */
export const useModeStore = defineStore('mode', () => {
  const PLAY_MODE = 'Play Mode'
  const ADMIN_MODE = 'Admin Mode'

  const mode = ref(PLAY_MODE)

  const isPlayMode = computed(() => mode.value === PLAY_MODE)
  const isAdminMode = computed(() => mode.value === ADMIN_MODE)
  const isEmpty = () => mode.value == null

  /**
   * Clean mode in local storage
   */
  const clear = () => {
    console.log('[ModeStore] clear')
    mode.value = null
  }

  /**
   * Switch mode
   */
  const toggle = () => {
    const from = mode.value
    mode.value = isPlayMode.value ? ADMIN_MODE : PLAY_MODE
    console.log('[ModeStore] toggle:', from, '=>', mode.value)
  }

  /**
   * Init mode by loading info from local storage if it exists
   */
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

  /**
   * watch dog for mode
   */
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

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useModeStore = defineStore('mode', () => {

    const PLAY_MODE = "Play Mode"
    const ADMIN_MODE = "Admin Mode"

    const mode = ref(null)

    const clear = () => {
        mode.value = null
        localstorage.removeitem('mode')
    }

    const isPlayMode = () => {
        return mode.value === PLAY_MODE
    }

    const isAdminMode = () => {
        return mode.value === ADMIN_MODE
    }

    const toggle = () => {
        if(isPlayMode()){
            mode.value = ADMIN_MODE
        }else {
            mode.value = PLAY_MODE
        }
    }

    const get = () => {
        return mode.value
    }

    const init = () => {
        try {
            const modeInStorage = localStorage.getItem('mode')
            if (modeInStorage) {
                mode.value = modeInStorage
            } else {
                mode.value = PLAY_MODE
            }
        } catch (e) {
            console.log('loading user from local storage has error', e)
        }
    }

    watch(mode, (val) => {
        if (val) localStorage.setItem('mode', val)
        else localStorage.removeItem('mode')
    }, { deep: true })

    return { get, init, clear, toggle, isPlayMode, isAdminMode }
})

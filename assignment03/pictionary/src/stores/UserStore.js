import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * Pinia store for managing authenticated user state.
 *
 * - Holds user profile data.
 * - Persists changes to localStorage.
 * - Supports initialization and logout.
 *
 * @store useUserStore
 * @state {Ref<Object|null>} user - Current authenticated user data.
 *
 * @function set - Updates the user profile.
 * @function logout - Clears user data and removes stored session.
 * @function get - Returns the current user value.
 * @function init - Loads stored user data from localStorage if available.
 */
export const useUserStore = defineStore('user', () => {

  const user = ref(null)

  const set = (profile = null) => {
    user.value = profile
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const get =() => {
    return user.value
  }

  const init = () => {
    try{
      const savedUser  = localStorage.getItem('user')
      if (savedUser)  user.value = JSON.parse(savedUser)
    }catch(e){
      console.log('loading user from local storage has error',e)
    }
  }

  watch(user, (val) => {
    if (val) localStorage.setItem('user', JSON.stringify(val))
    else localStorage.removeItem('user')
  }, { deep: true })

  return { get, set, logout, init}
})

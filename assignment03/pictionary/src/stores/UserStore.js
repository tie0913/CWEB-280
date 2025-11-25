import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUserStore = defineStore('user', () => {

  const user = ref(null)

  const setAuth = (profile = null) => {
    user.value = profile
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const get =() => {
    return user.value
  }

  const isLoggedIn = () => !!user.value

  const init = () => {
    const savedUser  = localStorage.getItem('user')
    if (savedUser)  user.value = JSON.parse(savedUser)
  }

  watch(user, (val) => {
    if (val) localStorage.setItem('user', JSON.stringify(val))
    else localStorage.removeItem('user')
  }, { deep: true })

  return { get, setAuth, logout, isLoggedIn, init}
})

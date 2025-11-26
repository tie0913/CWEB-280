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

  return { get, setAuth, logout, init}
})

<script setup>
import {ref, watch} from 'vue'
import { apiRequest } from '../network/Request'
import { useUserStore } from '../stores/UserStore'
import { useModeStore } from '../stores/ModeStore'

const props = defineProps({
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['update:show', 'signed-in'])

const close = () => emit('update:show', false)
const email = ref('')
const password = ref('')
const errorMsg = ref('')

const userStore = useUserStore()
const modeStore = useModeStore()

const onSubmit = async () => {
  try{
    const result = await apiRequest('/auth/signIn', {
      method:'POST',
      body:JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    if(result.code === 0){

      if(modeStore.isEmpty){
        modeStore.init()
      }

      userStore.set(result.body)
      if(userStore.get().admin && modeStore.isPlayMode){
        modeStore.toggle()
      }else{
        modeStore.init()
      }
      emit('signed-in')
      close()
    }else{
      errorMsg.value = result.message
    }
  }catch(e){
    console.error('Sign in has error', e)
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      email.value = ''
      password.value = ''
      errorMsg.value = ''
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop">
      <div class="nes-container is-rounded modal-panel">
        <h3>Sign In</h3>

        <p v-if="errorMsg" class="nes-text is-error" style="margin-bottom: 10px;">
          {{ errorMsg }}
        </p>

        <div class="mb-3">
          <label>Email</label>
          <input type="text" class="nes-input" v-model="email"/>
        </div>
        <div class="mb-3">
          <label>Password</label>
          <input type="password" class="nes-input" v-model="password"/>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button class="nes-btn" @click="close">Cancel</button>
          <button class="nes-btn is-primary" @click="onSubmit">Sign In</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-panel {
  min-width: 320px;
  max-width: 480px;
}
</style>

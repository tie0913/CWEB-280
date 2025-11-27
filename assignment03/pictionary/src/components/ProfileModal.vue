<script setup>
import { ref, computed, watch} from 'vue'
import { apiRequest } from '../network/Request'
import { useUserStore } from '../stores/UserStore'

const props = defineProps({
    show: { type: Boolean, default: false },
})
const emit = defineEmits(['update:show'])
const close = () => emit('update:show', false)

const email = ref('')
const password = ref('')
const name = ref('')
const errorMsg = ref('')
const onSubmit = async () => {
    try {
        const param = password.value ? {
                _id: useUserStore().get()._id,
                name: name.value,
                email: email.value,
                password: password.value
            } :{
                _id: useUserStore().get()._id,
                name: name.value,
                email: email.value
            }
        const result = await apiRequest('/users/self', {
            method: 'POST',
            body: JSON.stringify(param)
        })
        
        if (result.code === 0) {
            useUserStore().get().name = name.value
            close()
        } else {
            errorMsg.value = result.message
        }
    } catch (e) {
        console.error('Updating profile has error', e)
    }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
        const user = useUserStore().get()
        email.value = user.email
        name.value = user.name
        password.value = ''
        errorMsg.value = ''
    }
  },
  {immediate: true}
)
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="modal-backdrop">
            <div class="nes-container is-rounded modal-panel">
                <h3>Profile</h3>

                <p v-if="errorMsg" class="nes-text is-error" style="margin-bottom: 10px;">
                    {{ errorMsg }}
                </p>

                <div class="mb-3">
                    <label>Email</label>
                    <input type="text" class="nes-input" v-model="email" />
                </div>
                <div class="mb-3">
                    <label>Name</label>
                    <input type="text" class="nes-input" v-model="name" />
                </div>
                <div class="mb-3">
                    <label>Password</label>
                    <input type="password" class="nes-input" v-model="password" />
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <button class="nes-btn" @click="close">Cancel</button>
                    <button class="nes-btn is-primary" @click="onSubmit">Confirm</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
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
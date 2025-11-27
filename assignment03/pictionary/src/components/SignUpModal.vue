<script setup>
import { ref } from 'vue'
import { apiRequest } from '../network/Request'

const props = defineProps({
    show: { type: Boolean, default: false },
})
const emit = defineEmits(['update:show', 'signed-up'])
const close = () => emit('update:show', false)

const email = ref('')
const password = ref('')
const name = ref('')
const errorMsg = ref('')

const onSubmit = async () => {
    try {
        const result = await apiRequest('/auth/signUp', {
            method: 'POST',
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                password: password.value
            })
        })
        if (result.code === 0) {
            emit('signed-out')
            close()
        } else {
            errorMsg.value = result.message
        }
    } catch (e) {
        console.error('Sign up has error', e)
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="modal-backdrop">
            <div class="nes-container is-rounded modal-panel">
                <h3>Sign Up</h3>

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
                    <button class="nes-btn is-primary" @click="onSubmit">Sign Up</button>
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
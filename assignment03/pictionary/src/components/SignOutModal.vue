<script setup>
import { useUserStore } from '../stores/UserStore'
import { apiRequest } from '../network/Request'
import { useModeStore } from '../stores/ModeStore'

const props = defineProps({
    show: { type: Boolean, default: false },
})

const emit = defineEmits(['update:show'])
const errorMsg = ref('')
const onConfirm = async () => {
    try{
        const result = await apiRequest('/auth/signOut', {
            method:"Post"
        })
        if(result.code === 0){
            useUserStore().logout()
            useModeStore().clear()
            emit('update:show')
        }else{
            errorMsg.value = result.message
        }
    }catch(e){
        console.error('Signing out has error', e)
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="modal-backdrop">
            <div class="nes-container is-rounded modal-panel">
                <h3>Sign Out</h3>

                <p style="margin-bottom: 16px;">
                    Are you sure you want to sign out?
                </p>
                <p v-if="errorMsg" class="nes-text is-error" style="margin-bottom: 10px;">
                    {{ errorMsg }}
                </p>


                <div class="d-flex justify-content-end gap-2">
                    <button class="nes-btn" @click="close">
                        Cancel
                    </button>
                    <button class="nes-btn is-error" @click="onConfirm">
                        Sign Out
                    </button>
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

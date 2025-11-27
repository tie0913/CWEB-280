<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="room-modal-backdrop d-flex justify-content-center align-items-center"
    >
      <div class="nes-container is-rounded room-modal">
        <h3 class="mb-3">Create Room</h3>

        <form @submit.prevent="onSubmit">
          <!-- Room name -->
          <div class="mb-3">
            <label class="form-label nes-text is-primary">Room Name</label>
            <input
              v-model="form.name"
              type="text"
              class="nes-input form-control"
              required
            />
          </div>

          <!-- Max players -->
          <div class="mb-3">
            <label class="form-label nes-text is-primary">Max Players</label>
            <input
              v-model.number="form.maxPlayers"
              type="number"
              class="nes-input form-control"
              min="1"
              max="16"
              required
            />
          </div>

          <!-- Private room -->
          <div class="form-check mb-3 d-flex align-items-center gap-2">
            <label class="nes-text is-warning mb-0">
              Private
            </label>
            <input
              v-model="form.private"
              type="checkbox"
              class="form-check-input"
            />
          </div>

          <!-- Error hint -->
          <p v-if="error" class="nes-text is-error mb-2">
            {{ error }}
          </p>

          <!-- Actions -->
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              class="nes-btn"
              @click="onCancel"
              :disabled="submitting"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="nes-btn is-success"
              :disabled="submitting"
            >
              {{ submitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { apiRequest } from '../network/Request'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
})

const submitting = ref(false)
const error = ref('') 

const emit = defineEmits(['update:show', 'create'])

const form = reactive({
  name: '',
  maxPlayers: 4,
  private: false
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.name = ''
      form.maxPlayers = 4
      form.private = false
    }
  }
)

const onCancel = () => {
    emit('update:show')
}

const onSubmit = async () => {
  if (!form.name.trim()) return

  const param = {
    name: form.name.trim(),
    maxPlayers: form.maxPlayers,
    visibility: form.private? 0 : 1
  }

  submitting.value = true

  try{
    const result = await apiRequest('/rooms', {
      method:"POST", 
      body: JSON.stringify(param)
    })

    if(result.code === 0){
        emit('create', result.body)
        onCancel()
    }else{
        error.value = result.message
    }
  }catch(e){

  }finally{
    submitting.value = false
  }
}
</script>

<style scoped>
.room-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 2000;
  padding: 1rem;
  box-sizing: border-box;
}

.room-modal {
  max-width: 420px;
  width: 100%;
  background: #fff;
}
</style>

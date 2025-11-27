<script setup>
import { ref, watch, computed } from 'vue'
import { apiRequest } from '../network/Request'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  roomId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['update:show'])

const loading = ref(false)
const room = ref(null)
const error = ref(null)

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
})

const close = () => {
  visible.value = false
}

const loadRoom = async () => {
  if (!props.roomId) return
  loading.value = true
  error.value = null
  room.value = null

  try {
    const res = await apiRequest(`/rooms/${props.roomId}`, {
      method: 'GET',
    })

    if (res.code === 0) {
      room.value = res.body
    } else {
      error.value = res.message || 'Failed to load room data'
    }
  } catch (e) {
    error.value = 'Network error'
  } finally {
    loading.value = false
  }
}

// 当 show 变为 true 或 roomId 变化时，重新加载
watch(
  () => [props.show, props.roomId],
  ([show]) => {
    if (show) {
      loadRoom()
    }
  },
  { immediate: false }
)
</script>

<template>
  <!-- 遮罩层 -->
  <div v-if="visible" class="room-overlay">
    <section class="room-modal nes-container with-title">
      <h3 class="title">
        <template v-if="room">
          {{ room.name || 'Room ' + roomId }}
        </template>
        <template v-else>
          Room {{ roomId }}
        </template>
      </h3>

      <!-- 内容区域 -->
      <div class="room-body">
        <!-- loading -->
        <div v-if="loading" class="room-loading d-flex flex-column align-items-center">
          <i class="nes-icon coin is-large"></i>
          <p class="mt-3 mb-0">Loading room...</p>
        </div>

        <!-- error -->
        <div v-else-if="error" class="room-error nes-container is-dark">
          <p>{{ error }}</p>
        </div>

        <!-- 正常房间内容（先画个简单的房间） -->
        <div v-else-if="room" class="room-content">
          <div class="room-header">
            <p><strong>Room ID:</strong> {{ roomId }}</p>
            <p v-if="room.owner"><strong>Host:</strong> {{ room.owner }}</p>
            <p v-if="room.players">
              <strong>Players:</strong> {{ room.players.length }}<span v-if="room.maxPlayers"> / {{ room.maxPlayers }}</span>
            </p>
          </div>

          <!-- 简单的“房间座位图” -->
          <div v-if="room.players" class="room-seats">
            <div
              v-for="player in room.players"
              :key="player.id || player.name"
              class="seat nes-container"
            >
              <i class="nes-icon user is-medium"></i>
              <span class="seat-name">{{ player.name || 'Player' }}</span>
            </div>
            <!-- 如果有 maxPlayers，可以补空位 -->
            <div
              v-for="n in (room.maxPlayers ? (room.maxPlayers - room.players.length) : 0)"
              :key="'empty-' + n"
              class="seat nes-container empty"
            >
              <i class="nes-icon close is-medium"></i>
              <span class="seat-name">Empty</span>
            </div>
          </div>

          <!-- 没有 players 字段时就展示原始数据，方便调试 -->
          <div v-else class="room-raw">
            <pre>{{ room }}</pre>
          </div>
        </div>

        <!-- 没有任何数据（极端情况） -->
        <div v-else class="room-empty">
          <p>No data for this room.</p>
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="room-actions">
        <button class="nes-btn" @click="close">Close</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.room-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.room-modal {
  width: 640px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.room-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.room-loading,
.room-empty {
  text-align: center;
  padding: 2rem 1rem;
}

.room-error {
  padding: 1rem;
}

.room-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.room-header p {
  margin: 0.25rem 0;
}

.room-seats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.seat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  text-align: center;
}

.seat.empty {
  opacity: 0.7;
}

.seat-name {
  margin-top: 0.25rem;
}

.room-raw {
  max-height: 200px;
  overflow: auto;
  background: #fff;
}

.room-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>

<script setup>
import { ref, watch, computed } from 'vue'
import { apiRequest } from '../network/Request'
import { useUserStore } from '../stores/UserStore'
import Board from './Board.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  roomId: {
    type: [Number, String],
    required: true,
  },
  room: {
    type: Object,
    required: false
  }
})

const userStore = useUserStore()

const emit = defineEmits(['update:show', 'update:rooms'])

const loading = ref(false)
const room = ref()
const error = ref(null)

const isOwner = computed(() => userStore.get()._id === room.value?.ownerId)

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
})

const close = async () => {
  const result = await apiRequest(`/rooms/${props.roomId}/leave`, {
    method: 'POST',
  })

  if (result.code === 0) {
    visible.value = false
    emit('update:rooms')
  } else {
    error.value = result.message
  }
}

const loadRoom = async () => {
  if (!props.roomId) return

  if(props.room){
    room.value = props.room
    return
  }

  loading.value = true
  error.value = null
  room.value = null

  try {
    const res = await apiRequest(`/rooms/${props.roomId}/join`, {
      method: 'POST',
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

watch(
  () => [props.show, props.roomId],
  ([show]) => {
    error.value = ''
    room.value = null
    if (show) {
      loadRoom()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="visible" class="room-overlay">
    <section class="room-modal nes-container with-title">
      <h3 class="title">
        <template v-if="room">
          {{ room.name}}
        </template>
      </h3>

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

        <div v-else-if="room" class="room-content">
          <div class="room-layout">
            <section class="drawing-area nes-container is-dark">
              <header class="drawing-header">
                <span class="nes-text is-primary">Drawing Board</span>
                <span class="drawing-status">Round 1 · 00:45</span>
              </header>

              <div class="drawing-canvas-wrapper">
                <div class="drawing-canvas">
                  <Board/>
                </div>
              </div>
            </section>

            <aside class="side-panel">
              <div class="room-info nes-container is-rounded">
                <p class="info-line">
                  <strong>Room Name:</strong>
                  <span class="info-value">{{ room.name }}</span>
                </p>
                <p v-if="room.owner" class="info-line">
                  <strong>Host:</strong>
                  <span class="info-value">{{ room.owner }}</span>
                </p>
                <p v-if="room.players" class="info-line">
                  <strong>Players:</strong>
                  <span class="info-value">
                    {{ room.members.length }}
                    <span v-if="room.maxPlayers"> / {{ room.maxPlayers }}</span>
                  </span>
                </p>
              </div>

              <div class="players-panel nes-container is-rounded">
                <h4 class="players-title">Players</h4>

                <div class="players-list">
                  <div
                    v-for="player in room.players"
                    :key="player.id || player.name"
                    class="player-item"
                  >
                    <i
                      class="nes-icon user is-small player-icon"
                      :class="{ 'is-primary': player.name === room.owner }"
                    ></i>
                    <div class="player-meta">
                      <span class="player-name">
                        {{ player.name || 'Player' }}
                        <span v-if="player.name === room.owner" class="player-tag">
                          HOST
                        </span>
                      </span>
                      <span class="player-status">ready</span>
                    </div>
                  </div>

                  <!-- 空座位 -->
                  <div
                    v-for="n in (room.maxPlayers ? room.maxPlayers - room.players.length : 0)"
                    :key="'empty-' + n"
                    class="player-item empty"
                  >
                    <i class="nes-icon close is-small player-icon"></i>
                    <div class="player-meta">
                      <span class="player-name">Empty seat</span>
                      <span class="player-status">waiting</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section class="chat-panel nes-container is-rounded">
              <header class="chat-header">
                <h4 class="chat-title">Chat</h4>
              </header>

              <div class="chat-body">
                <div class="chat-message system">
                  <span class="chat-author">SYSTEM</span>
                  <span class="chat-text">Welcome to the room!</span>
                </div>
                <div class="chat-message">
                  <span class="chat-author">Alice:</span>
                  <span class="chat-text">Guess the word!</span>
                </div>
              </div>

              <div class="chat-input-bar">
                <input
                  class="nes-input chat-input"
                  type="text"
                  placeholder="Type your guess..."
                />
                <button class="nes-btn chat-send-btn" disabled>Send</button>
              </div>
            </section>
          </div>
        </div>

        <!-- room 为空 -->
        <div v-else class="room-empty">
          <p>No data for this room.</p>
        </div>
      </div>

      <div class="room-actions">
        <div class="room-actions-left">
          <button
            v-if="isOwner"
            class="nes-btn is-success"
            type="button"
          >
            Start
          </button>
          <!--
          <button
            v-if="isOwner"
            class="nes-btn is-warning"
            type="button"
          >
            Stop
          </button>
        -->
        </div>

        <div class="room-actions-right">
          <!-- 所有人都有：退出 -->
          <button class="nes-btn" type="button" @click="close">
            Exit
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.room-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.room-modal {
  width: 90vw;
  height: 80vh;
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
  height: 100%;
}

/* 主布局：上层画板 + 右侧面板，下层聊天 */
.room-layout {
  display: grid;
  grid-template-columns: 3fr 1.2fr; /* 左宽右窄，大约 70% / 30% */
  grid-template-rows: minmax(0, 1.4fr) minmax(0, 1fr); /* 上 画板+侧边，下 聊天 */
  grid-template-areas:
    'draw side'
    'chat chat';
  gap: 0.75rem;
  height: 100%;
  min-height: 0;
}

/* 画图区域 */
.drawing-area {
  grid-area: draw;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
}

.drawing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.drawing-status {
  font-family: monospace;
}

.drawing-canvas-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.drawing-canvas {
  flex: 1;
  border: 2px dashed #ccc;
  background: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.02),
      rgba(0, 0, 0, 0.02) 4px,
      rgba(0, 0, 0, 0.06) 4px,
      rgba(0, 0, 0, 0.06) 8px
    );
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawing-placeholder {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 右侧面板 */
.side-panel {
  grid-area: side;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.room-info {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.info-line {
  margin: 0.15rem 0;
  display: flex;
  justify-content: space-between;
}

.info-value {
  margin-left: 0.5rem;
}

/* 玩家列表 */
.players-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.75rem;
}

.players-title {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.players-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.25rem;
}

.player-item.empty {
  opacity: 0.7;
}

.player-icon {
  flex-shrink: 0;
}

.player-meta {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
}

.player-name {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.player-tag {
  font-size: 0.7rem;
  padding: 0 0.25rem;
  border: 1px solid currentColor;
  border-radius: 2px;
}

.player-status {
  opacity: 0.7;
}

/* 聊天区域 */
.chat-panel {
  grid-area: chat;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.75rem;
  min-height: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  margin: 0;
  font-size: 0.9rem;
}

.chat-body {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
}

.chat-message {
  display: flex;
  gap: 0.25rem;
}

.chat-message.system {
  font-style: italic;
  opacity: 0.8;
}

.chat-author {
  font-weight: bold;
}

.chat-input-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.chat-input {
  flex: 1 1 auto;
}

.chat-send-btn {
  flex-shrink: 0;
}

/* 按钮区域在底部 */
.room-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.room-actions-left {
  display: flex;
  gap: 0.5rem;
}

.room-actions-right {
  margin-left: auto;
}

/* 简单响应式：窄屏改为上下布局 */
@media (max-width: 900px) {
  .room-layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1.1fr) minmax(0, 0.8fr) minmax(0, 0.9fr);
    grid-template-areas:
      'draw'
      'side'
      'chat';
  }

  .room-modal {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>

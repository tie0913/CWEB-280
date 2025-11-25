<script setup>
import { computed, ref } from 'vue'
import SignInModal from './SignInModal.vue'
import { useUserStore } from '../stores/UserStore'
import SignOutModal from './SignOutModal.vue'

const userStore = useUserStore()
const isGuest = computed(() => !userStore.get())
const isAdmin = computed(() => userStore.get()?.admin === false)

const u = userStore.get()
for(var p in u){
  console.log(p)
}

const showSignIn = ref(false)
const showSignUp = ref(false)
const showSignOut = ref(false)
const showProfile = ref(false)

const goLobby = () => { }
const handleLogout = () => { }

const swicthMode = () => {
}
</script>

<template>
  <header class="app-header w-100">
    <div class="container d-flex justify-content-between align-items-center py-2">
      <div class="d-flex align-items-center gap-2" style="cursor: pointer;" @click="goLobby">
        <i class="nes-logo"></i>
        <span class="nes-text is-primary fw-bold">Pictionary</span>
      </div>

      <div class="d-flex align-items-center gap-3">
        <template v-if="isGuest">
          <button class="nes-btn is-primary" @click="showSignIn = true">
            <i class="nes-icon user is-small clickable" title="Sign in"></i>
          </button>
          <button class="nes-btn is-success" @click="showSignUp = true">
            <i class="nes-icon star is-small clickable" title="Sign Up"></i>
          </button>
        </template>

        <template v-else>
          <button class="nes-btn is-success" @click="switchMode">
            <span>{{ userStore.get().name }}</span><i class="nes-icon user is-small clickable" title="{{ userStore.get().name }}"></i>
          </button>
          <span v-if="isAdmin" class="nes-text is-warning">(Admin)</span>
          <button class="nes-btn" @click="showProfile = true">
            <i class="nes-icon edit is-small clickable" title="Profile"></i>
          </button>
          <button class="nes-btn is-error" @click="showSignOut = true">
            <i class="nes-icon close is-small clickable" title="Switch"></i>
          </button>
        </template>
      </div>
    </div>
    <SignInModal v-model:show="showSignIn"/>
    <SignOutModal v-model:show="showSignOut"/>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #f7e9a5;
  /* 柔和复古卡带色 */
  border-bottom: 3px solid #000;
  /* NES像素边框 */
  padding: 10px 0;
  box-shadow: 0 4px 0 #e5d48c;
  /* 像素风阴影加强层级感 */
}

/* Header内部元素保持一致间距和对齐 */
.app-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* 图标交互样式 */
.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

/* 鼠标悬停 → 微动画，增强卡通互动感 */
.clickable:hover {
  transform: scale(1.15);
  filter: brightness(1.15);
}

/* 让 NES icons 在布局里表现为可控对象，不至于错位 */
.app-header i {
  display: inline-block;
}

/* 让文字颜色跟背景协调一点（可调） */
.app-header .title {
  color: #000;
  font-weight: bold;
  font-size: 14px;
}
</style>
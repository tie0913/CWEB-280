<script setup>
import { computed, ref } from 'vue'
import SignInModal from './SignInModal.vue'
import { useUserStore } from '../stores/UserStore'
import SignOutModal from './SignOutModal.vue'
import SignUpModal from './SignUpModal.vue'
import ProfileModal from './ProfileModal.vue'
import Switch from './Switch.vue'

const userStore = useUserStore()
const isGuest = computed(() => !userStore.get())
const isAdmin = computed(() => userStore.get()?.admin)
const uname = computed(() => userStore.get()?.name)
const showSignIn = ref(false)
const showSignUp = ref(false)
const showSignOut = ref(false)
const showProfile = ref(false)


</script>

<template>
  <header class="app-header w-100">
    <div class="container d-flex justify-content-between align-items-center py-2">
      <div class="d-flex align-items-center gap-2">
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
          <template v-if="isAdmin">
            <span class="nes-text is-warning">
              <Switch label-position="left"/>
            </span>
          </template>
          <button class="nes-btn is-success" @click="showProfile = true">
            <span>{{ uname }}</span><i class="nes-icon user is-small clickable" title="{{ userStore.get().name }}"></i>
          </button>
          <button class="nes-btn is-error" @click="showSignOut = true">
            <i class="nes-icon close is-small clickable" title="Switch"></i>
          </button>
        </template>
      </div>
    </div>
    <SignInModal v-model:show="showSignIn"/>
    <SignOutModal v-model:show="showSignOut"/>
    <SignUpModal v-model:show="showSignUp" />
    <ProfileModal v-model:show="showProfile"/>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #f7e9a5;
  border-bottom: 3px solid #000;
  padding: 10px 0;
  box-shadow: 0 4px 0 #e5d48c;
}

.app-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.clickable:hover {
  transform: scale(1.15);
  filter: brightness(1.15);
}

.app-header i {
  display: inline-block;
}

.app-header .title {
  color: #000;
  font-weight: bold;
  font-size: 14px;
}
</style>
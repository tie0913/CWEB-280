<script setup>
import Header from './components/Header.vue'
import Frame from './components/Frame.vue'
import Footer from './components/Footer.vue'
import SignInModal from './components/SignInModal.vue'
import SignOutModal from './components/SignOutModal.vue'
import SignUpModal from './components/SignUpModal.vue'
import ProfileModal from './components/ProfileModal.vue'
import {ref} from 'vue'
const showSignIn = ref(false)
const showSignUp = ref(false)
const showSignOut = ref(false)
const showProfile = ref(false)
const adminTab = ref('user');
</script>

<template>
  <div class="app-root d-flex flex-column min-vh-100">
    <Header 
    @openSignIn="showSignIn = true" 
    @openSignUp="showSignUp = true" 
    @openSignOut="showSignOut = true" 
    @openProfile="showProfile = true"
    @changeAdminTab="adminTab = $event"/>
    <Frame 
    :admin-tab="adminTab"
    @sign-in="showSignIn = true"/>
    <Footer />
  </div>
    <SignInModal v-model:show="showSignIn"/>
    <SignOutModal v-model:show="showSignOut"/>
    <SignUpModal v-model:show="showSignUp" />
    <ProfileModal v-model:show="showProfile"/>
</template>

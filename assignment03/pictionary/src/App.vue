<script setup>
import Header from './components/Header.vue';
</script>

<template>
  <div class="app-root d-flex flex-column min-vh-100">
    <!-- Header：全宽 -->
    <Header />

    <!-- 主内容区：你可以选择用 container/container-fluid 控制宽度 -->
    <main class="app-main flex-grow-1">
      <div class="container py-3">
        <router-view />
      </div>
    </main>
  </div>
 
</template>

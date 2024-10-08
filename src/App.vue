<script setup lang="ts">
import FIlterComponent from "./components/FIlterComponent.vue";
</script>

<template>
  <div class="wrapper">
    <fIlter-component msg="Vite + Vue" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}
</style>

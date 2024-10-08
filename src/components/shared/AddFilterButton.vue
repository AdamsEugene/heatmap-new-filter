<script setup lang="ts">
defineProps<{ onclick: () => void; label?: string }>();
</script>

<template>
  <div class="sidebar_filter_button change_color" @click="onclick">
    <img class="button_icon" src="../../assets/images/add.svg" alt="add icon" />
    <p class="normal_text">{{ label || "Add Custom" }}</p>
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

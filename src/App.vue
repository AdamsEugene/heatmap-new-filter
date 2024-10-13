<script setup lang="ts">
import HeatmapFilter from "./components/HeatmapFilter.vue";
</script>

<template>
  <div class="wrapper">
    <heatmap-filter />
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

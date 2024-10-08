<script setup lang="ts">
const props = defineProps<{ onProceed: () => void; itemsInPending: boolean }>();

const onClick = () => {
  props.itemsInPending && props.onProceed();
};
</script>

<template>
  <div class="flex_sb">
    <div
      class="btn primary"
      :class="{ with_opacity: !itemsInPending }"
      @click="onClick"
    >
      <p class="btn_text">Add</p>
    </div>
  </div>
</template>

<style></style>

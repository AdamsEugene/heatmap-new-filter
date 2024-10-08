<template>
  <svg
    id="close_button"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    @click="onClick()"
  >
    <path
      d="M15 5L5 15"
      stroke="#677078"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5 5L15 15"
      stroke="#677078"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['onClick'],
  components: {},
  data(): {} {
    return {}
  },
  methods: {}
})
</script>

<style scoped>

</style>

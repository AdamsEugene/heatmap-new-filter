<template>
  <svg
    :id="id"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="8"
    viewBox="0 0 15 8"
    fill="none"
    :class="{ rotated: isDropdownOpen }"
  >
    <path
      d="M1.89062 1L7.7519 6.82487C7.8494 6.92177 8.00685 6.92177 8.10435 6.82487L13.9656 1"
      stroke="#34404B"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["isDropdownOpen", "id"],
  components: {},
  data(): {} {
    return {};
  },
  methods: {},
});
</script>

<style scoped></style>

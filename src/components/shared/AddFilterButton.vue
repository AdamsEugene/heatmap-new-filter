<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

import addIcon from "../../assets/images/add.svg";
import addGreenIcon from "../../assets/images/add_g.svg";

const props = defineProps<{
  onclick: () => void;
  label?: string;
  noIcon?: boolean;
  withBorder?: boolean;
}>();

const url = ref(addIcon);

onMounted(() => {
  if (props.withBorder) url.value = addGreenIcon;
});

watch(
  () => props.withBorder,
  () => {
    if (props.withBorder) url.value = addGreenIcon;
  }
);
</script>

<template>
  <div
    class="sidebar_filter_button change_color"
    :class="{ borderClass: withBorder }"
    @click="onclick"
  >
    <img v-if="!noIcon" class="button_icon" :src="url" alt="add icon" />
    <p class="normal_text">{{ label || "Add Custom" }}</p>
  </div>
</template>

<style>
.borderClass {
  border-radius: var(--Padding-Corner, 6px);
  border: 1px solid var(--Primary-03-Main, #00936f);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);

  .button_icon {
    filter: #00936f;
    margin-bottom: -4px !important;
  }

  .normal_text {
    color: #00936f;
  }
}
</style>

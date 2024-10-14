<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

import addIcon from "../../assets/images/add.svg";
import addGreenIcon from "../../assets/images/add_g.svg";

const props = defineProps<{
  onclick: () => void;
  label?: string;
  noIcon?: boolean;
  withBorder?: boolean;
  withBg?: boolean;
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
    :class="{ borderClass: withBorder, withBg, edit_mode: label === 'Edit' }"
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

.edit_mode {
  background-color: var(--Grey-50, #f1f2f3) !important;

  .normal_text {
    color: #2e3338;
  }

  &:hover {
    background-color: var(--Grey-200, #c7ccd1) !important;
  }
}

.withBg {
  background-color: #00936f;
  .normal_text {
    color: #ffffff;
  }

  &:hover {
    background-color: #003f2f;
  }
}

.sidebar_filter_buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;

  * {
    box-sizing: border-box;
  }
  font-family: "IBM Plex Sans";
  p,
  ul,
  li,
  h3 {
    margin: 0;
    padding: 0;
  }
}

.sidebar_filter_button,
.filter_right_title {
  display: flex;
  padding: var(--corner-med, 8px) 6px;
  align-items: center;
  gap: var(--corner-med, 8px);
  align-self: stretch;
  border-radius: 4px;
  transition: background-color 0.3s ease-in-out;
}

.change_color {
  img {
    margin-top: -6px;
  }

  .normal_text {
    color: #225caf;
  }
}

.change_color {
  color: #00936f !important;
}

.button_icon {
  width: var(--horizontal-padding-lg, 18px);
  height: var(--horizontal-padding-lg, 18px);
  transition: all 0.3s ease-in-out;
}

.normal_text {
  color: var(--Grey-800, #34404b);
  font-family: "Source Sans 3";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 12px;
  transition: all 0.3s ease-in-out;
}
</style>

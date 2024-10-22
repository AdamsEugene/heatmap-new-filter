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
    :class="{
      borderClass: withBorder,
      withBg,
      edit_mode: label === 'Edit',
      deleting_button: label?.includes('Delete'),
      add_filter: label === 'Add Additional Filter',
    }"
    @click.stop="onclick"
  >
    <img v-show="!noIcon" class="button_icon" :src="url" alt="add icon" />
    <p class="normal_text">{{ label || "Add Custom" }}</p>
  </div>
</template>

<style>
.borderClass {
  border-radius: var(--Padding-Corner, 6px) !important;
  border: 1px solid var(--Primary-03-Main, #00936f) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;

  .button_icon {
    filter: #00936f !important;
    margin-bottom: -4px !important ;
  }

  .normal_text {
    color: #00936f !important;
  }

  &.deleting_button {
    background: var(--Error-50, #ffebe6) !important;
    border: 1px solid var(--Primary-03-Main, #ffebe6) !important;
    border-radius: var(--Padding-Corner, 6px);

    .normal_text {
      color: var(--Grey-800, #2e3338) !important;
    }
  }

  &.add_filter {
    border-radius: var(--Padding-Corner, 6px);
    padding: var(--Padding-Horizontal-padding, 8px)
      var(--Padding-Vertical-padding, 16px) !important;
    align-items: center;
    gap: 10px;

    .normal_text {
      color: var(--Primary-03-Main, #00936f) !important;
    }
  }
}

.withBg {
  background-color: #00936f !important;
  .normal_text {
    color: #ffffff !important;
  }

  &:hover {
    background-color: #003f2f !important;
  }
}

.sidebar_filter_buttons {
  display: flex;
  flex-direction: column !important;
  align-items: flex-start !important;
  align-self: stretch !important;

  * {
    box-sizing: border-box !important;
  }
  font-family: "IBM Plex Sans" !important;
  p,
  ul,
  li,
  h3 {
    margin: 0 !important;
    padding: 0 !important;
  }
}

.sidebar_filter_button,
.filter_right_title {
  display: flex;
  padding: var(--corner-med, 8px) 6px;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  align-self: stretch !important;
  border-radius: 4px;
  transition: background-color 0.3s ease-in-out !important;

  &.edit_mode {
    background-color: var(--Grey-50, #f1f2f3) !important ;

    .normal_text {
      color: #2e3338 !important ;
    }

    &:hover {
      background-color: var(--Grey-200, #c7ccd1) !important ;
    }
  }
}

.change_color {
  img {
    margin-top: -6px !important;
  }

  .normal_text {
    color: #225caf !important;
  }
}

.change_color {
  color: #00936f;
}

.button_icon {
  width: var(--horizontal-padding-lg, 18px) !important;
  height: var(--horizontal-padding-lg, 18px) !important;
  transition: all 0.3s ease-in-out !important;
}

.normal_text {
  color: var(--Grey-800, #34404b);
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 18px !important;
  transition: all 0.3s ease-in-out !important;
}
</style>

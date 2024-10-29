<script setup lang="ts">
import { computed } from "vue";
import { SessionDataItem } from "../@types";

const props = defineProps<{
  data: SessionDataItem[];
  title?: string;
  adsPlatform: boolean;
  selectedItem?: SessionDataItem;
  handleSidebarItemClick: (item: SessionDataItem) => void;
  disabled: boolean;
  activeClasses?: string[];
}>();

const filteredItems = computed(() => {
  return props.data.filter((item) => {
    if (item.name === "Ads Platform") {
      return props.adsPlatform;
    }
    return true;
  });
});

const isItemSelected = computed(() => {
  return (item: SessionDataItem) =>
    (props.selectedItem?.name || "") + (props.selectedItem?.id || "") ===
    (item.name || "") + (item?.id || "");
});
</script>

<template>
  <div class="sidebar_dropdown">
    <div class="lg_text with_green">{{ title || "Session Data" }}</div>
    <div class="sidebar_filter_buttons">
      <div
        v-for="item in filteredItems"
        :key="item.name"
        @click="disabled ? null : handleSidebarItemClick(item)"
        class="sidebar_filter_button"
        :class="{
          active: activeClasses?.includes(item.name),
          disabled,
          selected: isItemSelected(item),
        }"
      >
        <img class="button_icon" :src="item.iconSrc" :alt="item.name" />
        <p class="normal_text trim_text_3_dots">{{ item.name }}</p>
        <div v-show="item.hasBudge" class="budge">
          <p class="text">NEW</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.selected {
  background: var(--Grey-50, #f1f2f3) !important;
}

.sidebar_filter_button {
  cursor: pointer !important;

  &:hover {
    background-color: var(--Grey-50, #f1f2f3) !important;
  }

  &.active {
    background: var(--Grey-50, #08916f) !important ;

    .normal_text {
      color: #ffffff !important;
    }

    .button_icon {
      filter: invert(100%) !important;
    }
  }
}

.budge {
  display: flex;
  padding: 0px 2px !important;
  justify-content: center !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  border-radius: 2px !important;
  background: var(--Primary-100, #baf7de) !important;

  .text {
    color: var(--Primary-600, #08916f) !important;
    font-family: "Source Sans 3" !important;
    font-size: 10px !important;
    font-style: normal !important;
    font-weight: 500 !important;
    line-height: 12px !important; /* 120% */
    text-transform: uppercase !important;
  }
}

/* Disabled state style */
.disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.sidebar_dropdown {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: var(--corner-med, 4px) !important;
  align-self: stretch !important;
  padding-top: 16px !important;
  width: 174px;

  * {
    box-sizing: border-box !important;
    font-family: "IBM Plex Sans" !important;
  }

  p,
  ul,
  li,
  h3 {
    margin: 0 !important;
    padding: 0 !important;
  }
  h3 {
    font-family: "IBM Plex Sans" !important;
  }
}

.lg_text {
  flex: 1 0 0 !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  line-height: 18px !important; /* 128.571% */
}

.with_green {
  color: var(--Primary-04-Dark, #016f52) !important;
  position: sticky !important;
  top: 0px !important;
  background: #ffffff !important;
  width: 100% !important;
  z-index: 3 !important;
  padding: 4px 0;
}

.sidebar_filter_buttons {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  align-self: stretch !important;
  width: 174px;
}

.button_icon {
  width: var(--horizontal-padding-lg, 18px) !important;
  height: var(--horizontal-padding-lg, 18px) !important;
  transition: all 0.3s ease-in-out !important;
}

.normal_text {
  color: var(--Grey-800, #34404b) !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 18px !important;
  transition: all 0.3s ease-in-out !important;

  &.trim_text_3_dots {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>

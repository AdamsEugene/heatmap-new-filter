<script setup lang="ts">
import { SessionDataItem } from "../@types";

defineProps<{
  data: SessionDataItem[];
  title?: string;
  selectedItem?: SessionDataItem;
  handleSidebarItemClick: (item: SessionDataItem) => void;
  disabled: boolean;
  activeClasses?: string[];
}>();
</script>

<template>
  <div class="sidebar_dropdown">
    <h3 class="lg_text with_green">{{ title || "Session Data" }}</h3>
    <div class="sidebar_filter_buttons">
      <div
        v-for="item in data"
        :key="item.name"
        @click="disabled ? null : handleSidebarItemClick(item)"
        class="sidebar_filter_button"
        :class="{
          active: activeClasses?.includes(item.name),
          disabled,
          selected:
            (selectedItem?.name || '') + (selectedItem?.id || '') ===
            (item.name || '') + (item?.id || ''),
        }"
      >
        <img class="button_icon" :src="item.iconSrc" :alt="item.name" />
        <p class="normal_text">{{ item.name }}</p>
        <div v-if="item.hasBudge" class="budge">
          <p class="text">NEW</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.selected {
  background: var(--Grey-50, #f1f2f3);
}

.active {
  background: var(--Grey-50, #08916f) !important;

  .normal_text {
    color: #ffffff;
  }

  .button_icon {
    filter: invert(100%);
  }
}

.sidebar_filter_button {
  cursor: pointer;

  &:hover {
    background-color: var(--Grey-50, #f1f2f3);
  }
}

.budge {
  display: flex;
  padding: 0px 2px;
  justify-content: center;
  align-items: center;
  gap: var(--corner-med, 8px);
  border-radius: 2px;
  background: var(--Primary-100, #baf7de);

  .text {
    color: var(--Primary-600, #08916f);
    font-family: "Source Sans 3";
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: 12px; /* 120% */
    text-transform: uppercase;
  }
}

/* Disabled state style */
.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.sidebar_dropdown {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--corner-med, 8px);
  align-self: stretch;
  padding-top: 16px;

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

.lg_text {
  flex: 1 0 0;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px; /* 128.571% */
}

.with_green {
  color: var(--Primary-04-Dark, #016f52);
  position: sticky;
  top: 0px;
  background: #ffffff;
  width: 100%;
  z-index: 3;
}

.sidebar_filter_buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
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

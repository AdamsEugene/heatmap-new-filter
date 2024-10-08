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

<style scoped>
.selected {
  background: var(--Grey-50, #f1f2f3);
}

.active {
  background: var(--Grey-50, #08916f);

  .normal_text {
    color: #ffffff;
  }

  .button_icon {
    filter: invert(100%);
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
</style>

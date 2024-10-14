<script setup lang="ts">
import { ReturnData } from "../../@types";

// Define the props using defineProps
defineProps<{ filteredValues?: ReturnData[]; onShowFilterMenu: () => void }>();
</script>

<template>
  <div class="main_filter_button" @click="onShowFilterMenu()">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6.59922 12H17.3992M4.19922 7.19995H19.7992M10.1992 16.8H13.7992"
        stroke="#4D5861"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <p v-if="!filteredValues" class="main_filter_button_text">Add Filter</p>
    <div v-else class="selected_filters">
      <div
        v-for="filter in filteredValues"
        :key="filter.name"
        class="selected_filter"
      >
        <p v-if="filter.name" class="selected_filter_text">
          {{ filter.name }}
        </p>
        <p v-else class="selected_filter_text">Add Filter</p>
      </div>
    </div>
  </div>
</template>

<style>
.main_filter_button {
  display: flex;
  width: max-content;
  padding: 10px var(--corner-med, 8px);
  justify-content: center;
  align-items: center;
  gap: var(--corner-med, 8px);
  border-radius: 10px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  cursor: pointer;
  font-family: "IBM Plex Sans";

  * {
    box-sizing: border-box;
  }
  
  p,
  ul,
  li,
  h3 {
    margin: 0;
    padding: 0;
  }

  .main_filter_button_text {
    color: var(--Grey-800, #34404b);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px; /* 142.857% */
    letter-spacing: -0.05px;
  }

  .selected_filters {
    display: flex;
    align-items: center;
    gap: 4px;

    .selected_filter {
      display: flex;
      /* width: 100px; */
      padding: 6px;
      align-items: center;
      justify-content: center;
      gap: var(--corner-med, 8px);
      border-radius: 4px;
      background: var(--Grey-100, #f6f6f6);

      .selected_filter_text {
        flex: 1 0 0;
        color: var(--Grey-800, #34404b);
        font-size: 12px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 160px;
        white-space: nowrap;
      }
    }
  }
}
</style>

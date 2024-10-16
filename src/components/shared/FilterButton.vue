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
  display: flex !important;
  width: max-content !important;
  padding: 10px var(--corner-med, 8px) !important;
  justify-content: center !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  border-radius: 10px !important;
  border: 1px solid var(--Grey-200, #e6e7e8) !important;
  background: var(--Grey-White, #fff) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  cursor: pointer !important;

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

  .main_filter_button_text {
    color: var(--Grey-800, #34404b) !important;
    font-size: 14px !important;
    font-style: normal !important;
    font-weight: 600 !important;
    line-height: 20px !important; /* 142.857% */
    letter-spacing: -0.05px !important;
  }

  .selected_filters {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;

    .selected_filter {
      display: flex !important;
      /* width: 100px !important; */
      padding: 6px !important;
      align-items: center !important;
      justify-content: center !important;
      gap: var(--corner-med, 8px) !important;
      border-radius: 4px;
      background: var(--Grey-100, #f6f6f6) !important;

      .selected_filter_text {
        flex: 1 0 0 !important;
        color: var(--Grey-800, #34404b) !important;
        font-size: 12px !important;
        font-style: normal !important;
        font-weight: 600 !important;
        line-height: normal !important;
        text-overflow: ellipsis !important;
        overflow: hidden !important;
        max-width: 160px !important;
        white-space: nowrap !important;
      }
    }
  }
}
</style>

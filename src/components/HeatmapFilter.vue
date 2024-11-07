<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import FilterComponent from "./FIlterComponent.vue";
import FilterButton from "./shared/FilterButton.vue";
import { ReturnData, Site, User } from "../@types";
import { getThis } from "./helpers/functions";

const filteredValues = ref<ReturnData[]>();
const showFilterMenu = ref(false);
const emit = defineEmits<{
  (e: "on-filter-values-change", values: ReturnData[]): void;
  (e: "on-filter-reset"): void;
}>();

defineProps<{ user?: User; websites?: Site[]; adsPlatform: boolean }>();

const filterWrapper = ref<HTMLElement | null>(null);

const isRageClick = computed(() => getThis("segment") === "heatmapType==rage");

function onFilterValuesChange(values: ReturnData[]) {
  console.log(values);
  filteredValues.value = values.length > 0 ? values : undefined;
  emit("on-filter-values-change", values);
}

function onResetAllFilters() {
  filteredValues.value = undefined;
  emit("on-filter-reset");
}

function onToggleShowFilterMenu() {
  showFilterMenu.value = !showFilterMenu.value;
}

function handleClickOutside(event: MouseEvent) {
  if (
    filterWrapper.value &&
    !filterWrapper.value.contains(event.target as Node)
  ) {
    showFilterMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  if (isRageClick.value)
    filteredValues.value = [
      {
        definition: "heatmapType==rage",
        name: "Rage Clicks",
        actualName: "Rage Clicks",
      },
    ];
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="main_filter_wrapper" ref="filterWrapper">
    <filter-button
      :onShowFilterMenu="onToggleShowFilterMenu"
      :filteredValues="filteredValues"
    />
    <filter-component
      v-show="showFilterMenu"
      :onToggleShowFilterMenu="onToggleShowFilterMenu"
      :defaultValues="filteredValues"
      :user="user"
      :websites="websites"
      :ads-platform="adsPlatform"
      @filter-values="onFilterValuesChange"
      @reset-all-filters="onResetAllFilters"
      ref="filterComponent"
    />
  </div>
</template>

<style>
.main_filter_wrapper {
  position: relative !important;
  width: max-content !important;

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
}
</style>

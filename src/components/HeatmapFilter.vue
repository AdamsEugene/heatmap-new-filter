<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import FilterComponent from "./FIlterComponent.vue";
import FilterButton from "./shared/FilterButton.vue";
import { ReturnData } from "../@types";

const filteredValues = ref<ReturnData[]>();
const showFilterMenu = ref(false);
const emit = defineEmits<{
  (e: "on-filter-values-change", values: ReturnData[]): void;
  (e: "on-filter-reset"): void;
}>();

const filterWrapper = ref<HTMLElement | null>(null);

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
    // console.log(event.target);

    // showFilterMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
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
      @filter-values="onFilterValuesChange"
      @reset-all-filters="onResetAllFilters"
      ref="filterComponent"
    />
  </div>
</template>

<style>
.main_filter_wrapper {
  position: relative;
  width: max-content;
}
</style>

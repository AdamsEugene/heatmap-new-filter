<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import SidebarItems from "./SidebarItems.vue";
import FilterDetails from "./FilterDetails.vue";
import AddFilterButton from "./shared/AddFilterButton.vue";
import LoadingSpinner from "./shared/LoadingSpinner.vue";

import { sessionData, eCommerceData } from "../data";
import {
  CombinedFilter,
  FilterList,
  ReturnData,
  SessionDataItem,
} from "../@types";
import {
  loadCustomFilters,
  saveEditCustomFilter,
} from "./helpers/makeAPIcalls";

import task from "../assets/images/ads_click.svg";

const props = defineProps<{
  onToggleShowFilterMenu: () => void;
  defaultValues?: ReturnData[];
}>();

const emit = defineEmits<{
  (e: "filter-values", returnData: ReturnData[]): void;
  (e: "reset-all-filters"): void;
}>();

const selectedItem = ref<SessionDataItem>(sessionData[0]);
const prevSelectedItem = ref<SessionDataItem>(sessionData[0]);
const nameIs = (name: string) => name === selectedItem.value?.name;

const loading = ref<boolean>(false);
const reset = ref<boolean>(false);
const canEdit = ref(nameIs("Create Custom Filter"));
const canAdd = ref(false);
const cancelEdit = ref(false);
const disabledComparison = ref(false);

// const updatedSelectedItem = ref<SessionDataItem>();
const pendingList = ref<CombinedFilter[]>([]);
const waitingRoom = ref<CombinedFilter>();
const customFilters = ref<SessionDataItem[]>([]);
const customData = ref<SessionDataItem>({
  definition: "",
  iconSrc: task,
  idsegment: 1,
  name: "Create Custom Filter",
  title: "Create Custom Filter",
  data: [{ action: "", default: "", name: "", segment: "", value: "" }],
});

const readyToCompare = computed(() => pendingList.value.length);

const activeClasses = computed(() => pendingList.value.map((i) => i.name));

const runOnCreated = async () => {
  loading.value = true;
  const _customFilters = await loadCustomFilters<FilterList>();

  if (_customFilters) {
    customFilters.value = _customFilters.map((data: any) => ({
      definition: data.definition,
      iconSrc: task,
      idsegment: 2,
      name: data.title,
      title: data.title,
      isDefinitionValueSet: true,
      ...data,
    }));
  }
  loading.value = false;
};

onMounted(() => {
  runOnCreated();

  resetFilters();
  document.addEventListener("reset-all-filters-event", () => {
    resetFilters(true);
  });
  document.addEventListener("disable-comparison-event", (event: any) => {
    disabledComparison.value = event.detail.disabled;
  });
});

const onLoading = (status: boolean) => {
  loading.value = status;
};

const onFilterSelect = (item: { item: SessionDataItem }) => {
  // updatedSelectedItem.value = item.item;
  // if (pendingList.value.length === 1)
  pendingList.value.push(item.item);
  // console.log(selectedItem.value, item);
};

const createCustomFilter = () => {
  selectedItem.value = customData.value;
};

const handleAddToWaitingRoom = (item: { item: CombinedFilter }) => {
  waitingRoom.value = item.item;
  // console.log("waitingRoom", waitingRoom.value);
};

const handleSidebarItemClick = (item: SessionDataItem) => {
  selectedItem.value = item;
  if (item.name !== "Create Custom Filter") prevSelectedItem.value = item;
};

const handleCompareFilters = () => {
  if (waitingRoom.value) pendingList.value.push(waitingRoom.value);
  else pendingList.value.push(selectedItem.value);
  waitingRoom.value = undefined;
  canAdd.value = false;
};

const removeItemFromPendingList = (filter: CombinedFilter) => {
  pendingList.value = pendingList.value.filter(
    (item) => item.name !== filter.name
  );
};

const onEditingMode = () => {
  canEdit.value = true;
  cancelEdit.value = false;
};

const onExitEditMode = () => {
  canEdit.value = false;
  cancelEdit.value = true;
  if (nameIs("Create Custom Filter"))
    selectedItem.value = prevSelectedItem.value;
};

const onSave = (state: boolean) => {
  canAdd.value = state;
};

const resetFilters = (click?: boolean, enable?: boolean) => {
  pendingList.value = [];
  reset.value = true;

  if (enable) {
    emit("filter-values", []);
    props.onToggleShowFilterMenu();
  }
  if (click) emit("reset-all-filters");

  setTimeout(() => {
    reset.value = false;
  }, 10);
};

const saveCustomFilter = async () => {
  loading.value = true;
  const res = await saveEditCustomFilter(selectedItem.value);
  const { name, ...others } = selectedItem.value;
  const existingItemIndex = customFilters.value.findIndex(
    (filter) => filter.id === selectedItem.value.id
  );

  if (res) {
    if (existingItemIndex === -1) {
      customFilters.value.push({
        isDefinitionValueSet: true,
        name: selectedItem.value.title,
        ...others,
      });
    } else {
      customFilters.value[existingItemIndex] = {
        ...customFilters.value[existingItemIndex],
        isDefinitionValueSet: true,
        name: selectedItem.value.title,
        ...others,
      };
    }
  }
  canEdit.value = false;
  if (nameIs("Create Custom Filter"))
    selectedItem.value = prevSelectedItem.value;
  loading.value = false;
};

const applyFilters = () => {
  let returnData: ReturnData[] = [];
  if (!pendingList.value.length && (waitingRoom.value || selectedItem.value)) {
    const { definition, name, nameForCompare, rest } =
      waitingRoom.value || selectedItem.value;
    returnData = [{ definition, name: nameForCompare || name, rest }];
  } else {
    const data = pendingList.value.map((filter) => ({
      name: filter.nameForCompare || filter.name,
      definition: filter.definition,
      rest: filter.rest,
    }));

    returnData = data;
  }

  emit("filter-values", returnData);
  props.onToggleShowFilterMenu();
};

const saveApplyFilters = async () => {
  await saveCustomFilter();
  applyFilters();
};

watch(
  () => props.defaultValues,
  (newVal) => {
    if (newVal) {
      const names = newVal.map((item) => ({
        name: item.name.split(":")[0],
        definition: item.definition,
      }));
      const data = [...sessionData, ...eCommerceData, ...customFilters.value];

      const affectedData = data
        .filter((d) => names.some((nameObj) => nameObj.name === d.name))
        .map((d) => {
          const matchingNameObj = names.find(
            (nameObj) => nameObj.name === d.name
          );
          return matchingNameObj
            ? { ...d, definition: matchingNameObj.definition }
            : d;
        });

      pendingList.value = affectedData;
    }
  },
  { immediate: true }
);

watch(selectedItem, () => {
  canEdit.value = nameIs("Create Custom Filter");
});
</script>

<template>
  <div class="main-filter-wrapper">
    <div class="filter-wrapper">
      <div class="filter-header">
        <p v-if="canEdit" class="big_text">{{ selectedItem.name }}</p>
        <p v-else class="big_text">
          {{ readyToCompare ? "Compare" : "All Filters" }}
        </p>
        <template
          v-if="!canEdit"
          v-for="(filter, index) in pendingList.slice(0, 2)"
          :key="filter.nameForCompare || filter.name"
        >
          <div class="right_button not_clickable new_color insideCompare">
            <p class="right_button_text">
              {{ filter.nameForCompare || filter.name }}
            </p>
            <img
              @click="removeItemFromPendingList(filter)"
              class="small_close_icon"
              src="../assets/images/close.png"
              alt="add icon"
            />
          </div>
          <p v-if="index < 1" class="heat_custom_filter_header_text">to</p>
          <div
            v-if="index === pendingList.length - 1 && index < 1"
            class="right_button not_clickable awaiting"
          >
            <p class="right_button_text">Select a filter</p>
          </div>
        </template>
        <loading-spinner v-if="loading" />
      </div>
      <div class="filter-body">
        <transition name="slide-left-right">
          <div v-show="!canEdit" class="filter-body_left">
            <sidebar-items
              :data="sessionData"
              :selected-item="selectedItem"
              :handle-sidebar-item-click="handleSidebarItemClick"
              :disabled="pendingList.length === 2"
              :active-classes="activeClasses"
            />
            <sidebar-items
              :data="eCommerceData"
              :title="'Ecommerce Data'"
              :selected-item="selectedItem"
              :handle-sidebar-item-click="handleSidebarItemClick"
              :disabled="pendingList.length === 2"
              :active-classes="activeClasses"
            />
            <sidebar-items
              :data="customFilters"
              :title="'Custom Filters'"
              :selected-item="selectedItem"
              :handle-sidebar-item-click="handleSidebarItemClick"
              :disabled="pendingList.length === 2"
              :active-classes="activeClasses"
            />
            <add-filter-button :onclick="createCustomFilter" />
          </div>
        </transition>
        <filter-details
          :selected-item="selectedItem"
          :items-in-pending="pendingList.length"
          :reset="reset"
          :can-edit="canEdit"
          :can-add="canAdd"
          :cancel-edit="cancelEdit"
          @on-add-to-waiting-room="handleAddToWaitingRoom"
          @on-loading="onLoading"
          @on-selected="onFilterSelect"
          @editing-mode="onEditingMode"
          @on-save="onSave"
        />
      </div>
      <div class="filter-footer">
        <div v-show="!canEdit" class="btn" @click="resetFilters(false, true)">
          <p class="btn_text">Reset</p>
        </div>
        <div v-show="canEdit" class="btn" @click="onExitEditMode">
          <p class="btn_text">Back to Filters</p>
        </div>
        <div class="right_btns">
          <div
            v-show="!readyToCompare && !canEdit && !disabledComparison"
            class="btn border"
            @click="handleCompareFilters"
          >
            <p class="btn_text">Compare to...</p>
          </div>
          <div v-show="canEdit" class="btn border" @click="saveCustomFilter">
            <p class="btn_text">Save</p>
          </div>
          <div v-show="!canEdit" class="btn primary" @click="applyFilters">
            <p class="btn_text">
              {{ pendingList.length === 2 ? "Compare" : "Apply" }}
            </p>
          </div>
          <div v-show="canEdit" class="btn primary" @click="saveApplyFilters">
            <p class="btn_text">Save and Apply</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Define the fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

.small_close_icon {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  right: 0px;
  top: 0px;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  z-index: 1;
  cursor: pointer;
  background-color: #f1f2f3;
  border: 1px solid #f1f2f3;
  transition: all 0.3s ease-in-out;
}

.slide-left-right-enter-active,
.slide-left-right-leave-active {
  transition: transform 0s ease-in-out;
}

.slide-left-right-enter {
  transform: translateX(100%);
  opacity: 1;
}

.slide-left-right-leave-to {
  transform: translateX(-100%);
  opacity: 0.3;
}

.main-filter-wrapper {
  position: absolute;
  top: 58px;
  left: 0;
  z-index: 9;
  display: flex;
  width: 682px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: var(--horizontal-padding-lg, 12px);
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  overflow: hidden;

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

.filter-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* gap: var(--vertical-padding-lg, 24px); */
  align-self: stretch;
  max-height: 620px;
}

.filter-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--corner-med, 8px);
  align-self: stretch;
  min-height: 90px;
  border-radius: 4px;
  padding: var(--vertical-padding-lg, 24px);
  border-bottom: 1px solid var(--Grey-200, #e6e7e8);
}

.big_text {
  color: #4b5563;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
}

.right_button {
  display: flex;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px);
  align-items: flex-start;
  gap: 10px;
  border-radius: var(--Padding-Corner, 6px);
  border: 1.5px solid var(--Primary-03-Main, #00936f);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  cursor: pointer;

  &.not_clickable {
    cursor: auto !important;
  }

  &.new_color {
    background-color: var(--Primary-03-Main, #00936f);
    .right_button_text {
      color: var(--Grey-White, #fff);
    }
  }

  &.awaiting {
    background-color: var(--Grey-100, #f6f6f6);
    border: 1.5px solid var(--Primary-03-Main, #f6f6f6);
    padding: 6px 10px;
    .right_button_text {
      color: var(--Grey-White, #b3b7bc);
      font-size: 12px;
    }
  }

  &.insideCompare {
    position: relative;
    padding: 6px 10px;
    .right_button_text {
      font-size: 12px;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 190px;
      white-space: nowrap;
    }
  }

  .right_button_text {
    color: var(--Primary-03-Main, #00936f);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px; /* 200% */
  }

  &.disabled_me {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover {
    .small_close_icon {
      visibility: visible;
      opacity: 1;
    }
  }
}

.right_btns {
  display: flex;
  align-items: center;
  gap: var(--horizontal-padding-lg, 12px);
}

.heat_custom_filter_header_text {
  color: var(--Grey-800, #34404b);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px; /* 150% */
  padding: 8px 0px;
}

.filter-body {
  display: flex;
  justify-content: center;
  width: 100%;
}

.filter-body_left {
  display: flex;
  flex-direction: column;
  min-width: 208px;
  max-height: calc(620px - 174px);
  height: 100%;
  border-right: 1px solid var(--Grey-200, #e6e7e8);
  padding: 0 24px 24px 24px;
  overflow-y: auto;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For IE and Edge */
}

.filter-body_left::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.filter-footer {
  display: flex;
  padding: var(--vertical-padding-lg, 24px);
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 0px 0px var(--horizontal-padding-lg, 12px)
    var(--horizontal-padding-lg, 12px);
  border-top: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px);
  align-items: flex-start;
  gap: 10px;
  width: max-content;
  border-radius: var(--Padding-Corner, 6px);
  background: var(--Grey-100, #f6f6f6);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  cursor: pointer;
}

.btn.border {
  border: 1.5px solid var(--Primary-03-Main, #00936f);
  background: var(--Grey-100, #ffffff);

  .btn_text {
    color: var(--Primary-600, #08916f);
  }
}

.btn.primary {
  background: var(--Primary-03-Main, #00936f);
  transition: all 0.3s ease-in-out;

  .btn_text {
    color: var(--Grey-White, #fff);
  }
}

.btn_text {
  color: var(--Grey-800, #2e3338);
  text-align: center;
  font-family: "Source Sans 3";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  text-transform: capitalize;
}

.right_btns {
  display: flex;
  align-items: center;
  gap: var(--horizontal-padding-lg, 12px);
}

.right_button {
  display: flex;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px);
  align-items: flex-start;
  gap: 10px;
  border-radius: var(--Padding-Corner, 6px);
  border: 1.5px solid var(--Primary-03-Main, #00936f);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  cursor: pointer;

  &.not_clickable {
    cursor: auto !important;
  }

  &.new_color {
    background-color: var(--Primary-03-Main, #00936f);
    .right_button_text {
      color: var(--Grey-White, #fff);
    }
  }

  &.awaiting {
    background-color: var(--Grey-100, #f6f6f6);
    border: 1.5px solid var(--Primary-03-Main, #f6f6f6);
    padding: 6px 10px;
    .right_button_text {
      color: var(--Grey-White, #b3b7bc);
      font-size: 12px;
    }
  }

  &.insideCompare {
    position: relative;
    padding: 6px 10px;
    .right_button_text {
      font-size: 12px;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 190px;
      white-space: nowrap;
    }
  }

  .right_button_text {
    color: var(--Primary-03-Main, #00936f);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px; /* 200% */
  }

  &.disabled_me {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover {
    .small_close_icon {
      visibility: visible;
      opacity: 1;
    }
  }
}

.heat_custom_filter_header_text {
  color: var(--Grey-800, #34404b);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px; /* 150% */
  padding: 8px 0px;
}
</style>

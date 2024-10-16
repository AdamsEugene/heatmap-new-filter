<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import SidebarItems from "./SidebarItems.vue";
import FilterDetails from "./FilterDetails.vue";
import AddFilterButton from "./shared/AddFilterButton.vue";
import LoadingSpinner from "./shared/LoadingSpinner.vue";

import { sessionData, eCommerceData } from "../data";
import {
  AuthorizationRequest,
  CombinedFilter,
  FilterList,
  ReturnData,
  SessionDataItem,
} from "../@types";
import {
  loadCustomFilters,
  manageAdsConnection,
  saveEditCustomFilter,
} from "./helpers/makeAPIcalls";

import task from "../assets/images/ads_click.svg";
import { getThis } from "./helpers/functions";

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
  const url = location.href;
  localStorage.setItem("heatmap_com_redirect_url", url);
  const partner = localStorage.getItem("ads-partner-name");

  console.log({ partner, code: getThis("code") });

  if (partner && getThis("code")) {
    const makeExchangeRequest = async (partner: string) => {
      let payload: AuthorizationRequest = {
        action: "exchange" as const,
        userId: "adamseugene292gmail",
        partner,
        websiteIds: [12],
        code: getThis("code"),
        redirectType: "dashboard",
      };

      if (partner.toLowerCase() === "x") {
        payload.twitterCodeVerifier =
          JSON.parse(localStorage.getItem("twitterCodeVerifier") || "{}")
            ?.codeVerifier || "";
      }

      const res = await manageAdsConnection({ ...payload });
      console.log(res);
      localStorage.removeItem("ads-partner-name");
    };

    makeExchangeRequest(partner);
  }
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

const onDeleteCustomFilter = () => {
  customFilters.value = customFilters.value.filter(
    (item) => item.id !== selectedItem.value.id
  );
  selectedItem.value = sessionData[0];
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
        <p v-if="canEdit" class="big_text in_cap">{{ selectedItem.name }}</p>
        <p v-else class="big_text in_cap">
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
              @click.stop="removeItemFromPendingList(filter)"
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
          @on-delete-custom-filter="onDeleteCustomFilter"
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
  transition: opacity 0.5s ease !important;
}

.in_cap {
  text-transform: capitalize !important;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0 !important;
}

.small_close_icon {
  visibility: hidden;
  opacity: 0;
  position: absolute !important;
  right: 0px !important;
  top: 0px !important;
  border-radius: 50% !important;
  width: 14px !important;
  height: 14px !important;
  z-index: 1 !important;
  cursor: pointer !important;
  background-color: #f1f2f3 !important;
  border: 1px solid #f1f2f3 !important;
  transition: all 0.3s ease-in-out !important;
}

.slide-left-right-enter-active,
.slide-left-right-leave-active {
  transition: transform 0s ease-in-out !important;
}

.slide-left-right-enter {
  transform: translateX(100%) !important;
  opacity: 1 !important;
}

.slide-left-right-leave-to {
  transform: translateX(-100%) !important;
  opacity: 0.3 !important;
}

.main-filter-wrapper {
  position: absolute !important;
  top: 58px !important;
  left: 0 !important;
  z-index: 9 !important;
  display: flex;
  width: 682px !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  border-radius: var(--horizontal-padding-lg, 12px) !important;
  border: 1px solid var(--Grey-200, #e6e7e8) !important;
  background: var(--Grey-White, #fff) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  overflow: hidden !important;

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

.filter-wrapper {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  /* gap: var(--vertical-padding-lg, 24px) !important; */
  align-self: stretch !important;
  max-height: 620px !important;
}

.filter-header {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  align-self: stretch !important;
  /* min-height: 90px !important; */
  border-radius: 4px;
  padding: var(--vertical-padding-lg, 24px) !important;
  border-bottom: 1px solid var(--Grey-200, #e6e7e8) !important;
}

.big_text {
  color: #4b5563 !important;
  font-size: 18px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 28px !important;
}

.right_button {
  display: flex !important;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px) !important;
  align-items: flex-start !important;
  gap: 10px !important;
  border-radius: var(--Padding-Corner, 6px) !important;
  border: 1.5px solid var(--Primary-03-Main, #00936f) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  cursor: pointer !important;

  &.not_clickable {
    cursor: auto !important;
  }

  &.new_color {
    background-color: var(--Primary-03-Main, #00936f) !important;
    .right_button_text {
      color: var(--Grey-White, #fff) !important;
    }
  }

  &.awaiting {
    background-color: var(--Grey-100, #f6f6f6) !important;
    border: 1.5px solid var(--Primary-03-Main, #f6f6f6) !important;
    padding: 6px 10px !important;
    .right_button_text {
      color: var(--Grey-White, #b3b7bc) !important;
      font-size: 12px !important;
    }
  }

  &.insideCompare {
    position: relative !important;
    padding: 6px 10px !important;
    .right_button_text {
      font-size: 12px !important;
      text-overflow: ellipsis !important;
      overflow: hidden !important;
      max-width: 190px !important;
      white-space: nowrap !important;
    }
  }

  .right_button_text {
    color: var(--Primary-03-Main, #00936f) !important;
    font-size: 16px !important;
    font-style: normal !important;
    font-weight: 600 !important;
    line-height: 26px !important; /* 200% */
  }

  &.disabled_me {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }

  &:hover {
    .small_close_icon {
      visibility: visible;
      opacity: 1;
    }
  }
}

.right_btns {
  display: flex !important;
  align-items: center !important;
  gap: var(--horizontal-padding-lg, 12px) !important;
}

.heat_custom_filter_header_text {
  color: var(--Grey-800, #34404b) !important;
  font-size: 16px !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: 24px !important; /* 150% */
  padding: 8px 0px !important;
}

.filter-body {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
}

.filter-body_left {
  display: flex;
  flex-direction: column !important;
  min-width: 216px !important;
  max-height: min(45vh, 446px) !important;
  height: 100% !important;
  border-right: 1px solid var(--Grey-200, #e6e7e8) !important;
  padding: 0 24px 24px 24px !important;
  overflow-y: auto !important;
  overflow-x: hidden;
}

.filter-footer {
  display: flex !important;
  padding: var(--vertical-padding-lg, 24px) !important;
  justify-content: space-between !important;
  align-items: center !important;
  align-self: stretch !important;
  border-radius: 0px 0px var(--horizontal-padding-lg, 12px)
    var(--horizontal-padding-lg, 12px) !important;
  border-top: 1px solid var(--Grey-200, #e6e7e8) !important;
  background: var(--Grey-White, #fff) !important;
}

.btn {
  display: flex;
  justify-content: center !important;
  align-items: center !important;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px) !important;
  align-items: flex-start !important;
  gap: 10px !important;
  width: max-content !important;
  border-radius: var(--Padding-Corner, 6px) !important;
  background: var(--Grey-100, #f6f6f6) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  cursor: pointer !important;
}

.btn.border {
  border: 1.5px solid var(--Primary-03-Main, #00936f) !important;
  background: var(--Grey-100, #ffffff) !important;

  .btn_text {
    color: var(--Primary-600, #08916f) !important;
  }
}

.btn.primary {
  background: var(--Primary-03-Main, #00936f) !important;
  transition: all 0.3s ease-in-out !important;

  .btn_text {
    color: var(--Grey-White, #fff) !important;
  }
}

.btn_text {
  color: var(--Grey-800, #2e3338) !important;
  text-align: center !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 20px !important; /* 142.857% */
  text-transform: capitalize !important;
}

.right_btns {
  display: flex !important;
  align-items: center !important;
  gap: var(--horizontal-padding-lg, 12px) !important;
}

.right_button {
  display: flex !important;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px) !important;
  align-items: flex-start !important;
  gap: 10px !important;
  border-radius: var(--Padding-Corner, 6px) !important;
  border: 1.5px solid var(--Primary-03-Main, #00936f) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  cursor: pointer !important;

  &.not_clickable {
    cursor: auto !important ;
  }

  &.new_color {
    background-color: var(--Primary-03-Main, #00936f) !important;
    .right_button_text {
      color: var(--Grey-White, #fff) !important;
    }
  }

  &.awaiting {
    background-color: var(--Grey-100, #f6f6f6) !important;
    border: 1.5px solid var(--Primary-03-Main, #f6f6f6) !important;
    padding: 6px 10px !important;
    .right_button_text {
      color: var(--Grey-White, #b3b7bc) !important;
      font-size: 12px !important;
    }
  }

  &.insideCompare {
    position: relative !important;
    padding: 6px 10px !important;
    .right_button_text {
      font-size: 12px !important;
      text-overflow: ellipsis !important;
      overflow: hidden !important;
      max-width: 190px !important;
      white-space: nowrap !important;
    }
  }

  .right_button_text {
    color: var(--Primary-03-Main, #00936f) !important;
    font-size: 16px !important;
    font-style: normal !important;
    font-weight: 600 !important;
    line-height: 26px !important; /* 200% */
  }

  &.disabled_me {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }

  &:hover {
    .small_close_icon {
      visibility: visible;
      opacity: 1;
    }
  }
}

.heat_custom_filter_header_text {
  color: var(--Grey-800, #34404b) !important;
  font-size: 16px !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: 24px !important; /* 150% */
  padding: 8px 0px !important;
}
</style>

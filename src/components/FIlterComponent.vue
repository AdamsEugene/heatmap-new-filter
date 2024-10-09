<script setup lang="ts">
defineProps<{ msg: string }>();
import { computed, onMounted, ref } from "vue";

import SidebarItems from "./SidebarItems.vue";
import FilterDetails from "./FilterDetails.vue";
import AddFilterButton from "./shared/AddFilterButton.vue";
import LoadingSpinner from "./shared/LoadingSpinner.vue";

import { sessionData, eCommerceData } from "../data";
import { CombinedFilter, FilterList, SessionDataItem } from "../@types";
import { loadCustomFilters } from "./helpers/makeAPIcalls";

import task from "../assets/images/ads_click.svg";
import { initialNewFilter } from "./helpers/functions";

const loading = ref<boolean>(false);
const reset = ref<boolean>(false);

const data = { ...initialNewFilter };

const selectedItem = ref<SessionDataItem>(sessionData[0]);
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
  data: data.data,
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
  // if (item.isDefinitionValueSet && pendingList.value.length === 1)
  //   pendingList.value.push(selectedItem.value);
  // console.log({ item });
};

const handleCompareFilters = () => {
  if (waitingRoom.value) pendingList.value.push(waitingRoom.value);
  else pendingList.value.push(selectedItem.value);
  waitingRoom.value = undefined;
};

const removeItemFromPendingList = (filter: CombinedFilter) => {
  pendingList.value = pendingList.value.filter(
    (item) => item.name !== filter.name
  );
};

const resetFilters = () => {
  pendingList.value = [];
  reset.value = true;

  setTimeout(() => {
    reset.value = false;
  }, 10);
};

const applyFilters = () => {
  console.log(
    "apply this filters",
    pendingList.value.map((filter) => ({
      name: filter.name,
      definition: filter.definition,
      rest: filter.rest,
    }))
  );
};
</script>

<template>
  <div class="main-filter-wrapper">
    <div class="filter-wrapper">
      <div class="filter-header">
        <p class="big_text">
          {{ readyToCompare ? "Compare" : "All Filters" }}
        </p>
        <template
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
        <div class="filter-body_left">
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
        <filter-details
          :selected-item="selectedItem"
          :items-in-pending="pendingList.length"
          :reset="reset"
          @on-add-to-waiting-room="handleAddToWaitingRoom"
          @on-loading="onLoading"
          @on-selected="onFilterSelect"
        />
      </div>
      <div class="filter-footer">
        <div class="btn" @click="resetFilters">
          <p class="btn_text">Reset</p>
        </div>
        <div class="right_btns">
          <transition name="fade">
            <div
              v-show="!readyToCompare"
              class="btn border"
              @click="handleCompareFilters"
            >
              <p class="btn_text">Compare to...</p>
            </div>
          </transition>
          <div class="btn primary" @click="applyFilters">
            <p class="btn_text">
              {{ pendingList.length === 2 ? "Compare" : "Apply" }}
            </p>
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
</style>

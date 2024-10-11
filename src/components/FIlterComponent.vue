<script setup lang="ts">
defineProps<{ msg: string }>();
import { computed, onMounted, ref, watch } from "vue";

import SidebarItems from "./SidebarItems.vue";
import FilterDetails from "./FilterDetails.vue";
import AddFilterButton from "./shared/AddFilterButton.vue";
import LoadingSpinner from "./shared/LoadingSpinner.vue";

import { sessionData, eCommerceData } from "../data";
import { CombinedFilter, FilterList, SessionDataItem } from "../@types";
import { loadCustomFilters } from "./helpers/makeAPIcalls";

import task from "../assets/images/ads_click.svg";

const selectedItem = ref<SessionDataItem>(sessionData[0]);
const prevSelectedItem = ref<SessionDataItem>(sessionData[0]);
const nameIs = (name: string) => name === selectedItem.value?.name;

const loading = ref<boolean>(false);
const reset = ref<boolean>(false);
const canEdit = ref(nameIs("Create Custom Filter"));
const canAdd = ref(false);

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
  canEdit.value = !canEdit.value;
};

const onExitEditMode = () => {
  canEdit.value = false;
  if (nameIs("Create Custom Filter"))
    selectedItem.value = prevSelectedItem.value;
};

const onSave = (state: boolean) => {
  canAdd.value = state;
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
          @on-add-to-waiting-room="handleAddToWaitingRoom"
          @on-loading="onLoading"
          @on-selected="onFilterSelect"
          @editing-mode="onEditingMode"
          @on-save="onSave"
        />
      </div>
      <div class="filter-footer">
        <div v-show="!canEdit" class="btn" @click="resetFilters">
          <p class="btn_text">Reset</p>
        </div>
        <div v-show="canEdit" class="btn" @click="onExitEditMode">
          <p class="btn_text">Back to Filters</p>
        </div>
        <div class="right_btns">
          <div
            v-show="!readyToCompare && !canEdit"
            class="btn border"
            @click="handleCompareFilters"
          >
            <p class="btn_text">Compare to...</p>
          </div>
          <div
            v-show="canEdit"
            class="btn border"
            @click="handleCompareFilters"
          >
            <p class="btn_text">Save</p>
          </div>
          <div v-show="!canEdit" class="btn primary" @click="applyFilters">
            <p class="btn_text">
              {{ pendingList.length === 2 ? "Compare" : "Apply" }}
            </p>
          </div>
          <div v-show="canEdit" class="btn primary" @click="applyFilters">
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
</style>

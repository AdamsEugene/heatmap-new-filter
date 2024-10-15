<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { CustomValues, Experiment, SessionDataItem } from "../@types";
import Dropdown from "./shared/Dropdown.vue";
import AddFilterButton from "./shared/AddFilterButton.vue";
import CustomFilterForm from "./shared/CustomFilterForm.vue";
import SaveButton from "./shared/SaveButton.vue";
import { manageAdsConnection, fetchSegmentData } from "./helpers/makeAPIcalls";
import {
  alreadyHaveDisplayName,
  formatUrl,
  getKeyByValue,
  getPartnerValues,
  hasNoDropdown,
  insertItemBeforeSemicolon,
  makeRequestFor,
  numberInput,
  replaceAfterItem,
  replaceAfterEquals,
  conditions,
  replaceAfterSymbols,
  isArrayValid,
  checkForTokens,
} from "./helpers/functions";

const props = defineProps<{
  selectedItem: SessionDataItem;
  itemsInPending: number;
  reset: boolean;
  canEdit: boolean;
  canAdd: boolean;
  cancelEdit: boolean;
}>();

const emit = defineEmits([
  "on-loading",
  "on-selected",
  "on-add-to-waiting-room",
  "editing-mode",
  "on-save",
]);

const nameIs = (name: string) => name === props.selectedItem.name;

const initiallySavedCustomFilters = ref<CustomValues>();

const simpleListResponse = ref<string[]>([]);
const keyValueResponse = ref<Map<string, unknown>>();
const experiments = ref<Experiment[]>();
const shouldEncode = ref(true);
const clearFields = ref(false);
const selectionError = ref(false);

const listForValues = ref<string[]>();
const listOfSelectedItems = ref<string[]>([]);
const hasTokens = ref<string[]>();

let selected: SessionDataItem = { ...props.selectedItem };

const fetchSegment = async () => {
  emit("on-loading", true);
  const [segmentName] = props.selectedItem?.definition?.split("==") || "";
  let res: any;
  if (nameIs("Ads Platform")) {
    res = await manageAdsConnection({
      action: "status",
      userId: "adamseugene292gmail",
      websiteIds: [12],
    });
  } else {
    res = await fetchSegmentData(segmentName);
  }

  keyValueResponse.value = res;
  if (nameIs("Session Tag") || nameIs("Ads Platform")) {
    simpleListResponse.value = Object.keys(res || {});
    hasTokens.value = checkForTokens(res);
    // console.log(hasTokens.value);
  } else if (nameIs("A/B Tests")) {
    simpleListResponse.value = getPartnerValues(
      res.partners_friendly,
      res.partners
    );
    hasTokens.value = undefined;
  } else {
    simpleListResponse.value = res;
    hasTokens.value = undefined;
  }
  // console.log(res);
  emit("on-loading", false);
};

const freeUpSpace = () => {
  keyValueResponse.value = undefined;
  simpleListResponse.value = [];
  initiallySavedCustomFilters.value = undefined;
  listOfSelectedItems.value = [];
};

const onProceed = () => {
  emit("on-selected", { item: selected });
  selected = { ...props.selectedItem };
  emit("on-save", false);
  clearFields.value = true;
};

const saveCustomFilter = (filter: CustomValues & { title: string }) => {
  const { title, options, conditions, ...other } = filter;
  if (isArrayValid(Object.values(other))) {
    initiallySavedCustomFilters.value = other;
  }
};

const onSelected = (item: { item: string; kind: "main" | "value" }) => {
  const KV = keyValueResponse.value as any;
  const seOrAd = nameIs("Session Tag") || nameIs("Ads Platform");
  shouldEncode.value = true;
  clearFields.value = false;
  if (item.kind === "main" && seOrAd) {
    listForValues.value = KV[item.item];
    selected = {
      ...selected,
      definition: insertItemBeforeSemicolon(selected.definition, item.item),
      nameForCompare: selected.name + ": " + formatUrl(item.item),
    };
  } else if (item.kind === "main" && nameIs("A/B Tests")) {
    const partnersFriendly = getKeyByValue(KV.partners_friendly, item.item);
    if (partnersFriendly) {
      experiments.value = KV["experiments"][partnersFriendly];
      listForValues.value = KV["experiments"][partnersFriendly]?.map(
        (partner: Experiment) => partner.value
      );
    }

    selected = {
      ...selected,
      definition: replaceAfterEquals(selected.definition, item.item),
      nameForCompare: selected.name + ": " + formatUrl(item.item),
    };
  } else if (item.kind === "main" && nameIs("Average Order Value")) {
    selected = {
      ...selected,
      definition: replaceAfterItem(
        selected.definition,
        "revenueOrder",
        (conditions as any)[item.item]
      ),
      nameForCompare: selected.name + ": " + formatUrl(item.item),
    };
  } else {
    let definition = "";
    let rest: any = {};
    if (nameIs("A/B Tests"))
      definition = getABTestingData(item.item, definition, rest);
    else if (nameIs("Total Pages Visited"))
      definition = replaceAfterEquals(selected.definition, item.item);
    else if (nameIs("Average Order Value")) {
      definition = replaceAfterSymbols(selected.definition, item.item);
      shouldEncode.value = false;
    } else definition = replaceAfterEquals(selected.definition, item.item);

    selected = {
      ...selected,
      definition: shouldEncode.value ? encodeURI(definition) : definition,
      nameForCompare: alreadyHaveDisplayName(selected, item.item),
      rest: rest,
    };
    listOfSelectedItems.value = [...listOfSelectedItems.value, item.item];
    emit("on-save", true);
  }
  // console.log(selected);

  emit("on-add-to-waiting-room", { item: selected });
  console.log(item);
};

const getABTestingData = (item: string, definition: string, rest: any) => {
  definition = replaceAfterItem(
    `${selected.definition};friendlyName==`,
    ";friendlyName",
    `==${item}`
  );
  if (experiments.value) {
    const experiment = experiments.value.find(
      (experiment) => experiment.value === item
    );
    if (experiment?.variant_id) {
      rest["variant_id"] = experiment.variant_id;
      // definition += `;variantId==${experiment.variant_id}`;
    }
    if (experiment?.experiment_id) {
      rest["experiment_id"] = experiment.experiment_id;
      // definition += `;experienceId==${experiment.experiment_id}`;
    }
    if (experiment?.url) rest["url"] = experiment.url;
  }
  return definition;
};

const handleCanEdit = () => {
  emit("editing-mode");
};

const onClearCurrentCustomFilter = () => {};

const onOnCustomFilterChange = (
  newFilter: CustomValues & { title: string }
) => {
  clearFields.value = false;
  const { title, ...others } = newFilter;
  initiallySavedCustomFilters.value = others;
};

const onLoading = (state: boolean) => {
  emit("on-loading", state);
};

const onSelectionError = () => {
  selectionError.value = true;

  setTimeout(() => {
    selectionError.value = false;
  }, 3000);
};

onMounted(() => {
  freeUpSpace();
  makeRequestFor(props.selectedItem.name) && fetchSegment();
});

watch(
  () => props.reset,
  () => {
    if (props.reset) {
      listOfSelectedItems.value = [];
    }
  }
);

watch(
  () => props.canAdd,
  (newValue) => {
    console.log({ newValue });

    if (!newValue) {
      selected = { ...props.selectedItem };
      clearFields.value = true;
    }
  }
);

watch(
  () => props.selectedItem,
  () => {
    freeUpSpace();
    makeRequestFor(props.selectedItem.name) && fetchSegment();
    selected = { ...props.selectedItem };
    if (nameIs("Average Order Value"))
      simpleListResponse.value = ["Equal To", "Less Than", "Greater Than"];
    listForValues.value = undefined;
  }
);
</script>

<template>
  <div class="filter-body_right padding_32">
    <div v-show="!canEdit" class="filter_right_title">
      <div class="head">
        <div class="flex_8">
          <img
            class="title_icon"
            :src="selectedItem.iconSrc"
            :alt="selectedItem.name"
          />
          <p class="big_text deep_color * { box-sizing: border-box; }ap">
            {{ selectedItem.name }}
          </p>
        </div>
        <p v-if="selectedItem.subTitle" class="small_text">
          {{ selectedItem.subTitle }}
        </p>
      </div>
      <add-filter-button
        v-show="!nameIs('Create Custom Filter') && selectedItem.data"
        :label="'Edit'"
        :onclick="handleCanEdit"
        :no-icon="true"
        :with-bg="canEdit"
      />
    </div>
    <!-- <div v-if="(awaitedFilters?.data?.length || 0) >= 1" class="flex_8">
      <div
        v-for="filter in awaitedFilters?.data"
        :key="filter.name"
        class="created_filters"
        @click="setAsCurrentEditableFilter(filter.name + ':' + filter.value)"
      >
        <p class="medium_text shot">
          {{ filter.name + ":" + filter.value }}
        </p>
        <img
          @click.stop="removeItem(filter.name)"
          class="small_close_icon"
          src="../assets/images/close.png"
          alt="add icon"
        />
      </div>
    </div> -->
    <div
      v-if="nameIs('Create Custom Filter') || selectedItem.data"
      class="filter-body_right"
    >
      <Custom-filter-form
        :selectedItem="selectedItem"
        :save-custom-filter="saveCustomFilter"
        :clear-fields="clearFields"
        :can-edit="canEdit"
        :cancel-edit="cancelEdit"
        @on-loading="onLoading"
        @on-clear-current-custom-filter="onClearCurrentCustomFilter"
        @on-custom-filter-change="onOnCustomFilterChange"
      />
    </div>
    <template v-else-if="!selectedItem?.isDefinitionValueSet">
      <Dropdown
        :key="'dropdown1'"
        :items="simpleListResponse"
        :label="selectedItem.name"
        :position="'up'"
        :definition="'main'"
        :input-type="numberInput(props.selectedItem.name) ? 'number' : 'text'"
        :as-input="hasNoDropdown(props.selectedItem.name)"
        :disabled-item="listOfSelectedItems"
        :clear-fields="clearFields"
        :has-tokens="hasTokens"
        @on-selected="onSelected"
        @on-selection-error="onSelectionError"
      />
      <transition name="fade" mode="default">
        <Dropdown
          v-if="selectedItem?.showSign"
          :key="'dropdown2'"
          :items="listForValues"
          :label="selectedItem.name"
          :input-type="numberInput(props.selectedItem.name) ? 'number' : 'text'"
          :definition="'value'"
          :as-input="!listForValues"
          :disabled-item="listOfSelectedItems"
          :clear-fields="clearFields"
          @on-selected="onSelected"
          @on-selection-error="onSelectionError"
        />
      </transition>
      <save-button
        v-if="itemsInPending >= 1"
        :items-in-pending="canAdd"
        :on-proceed="onProceed"
      />
    </template>
    <template v-else>
      <save-button
        :items-in-pending="itemsInPending !== 2"
        :on-proceed="onProceed"
      />
      <div class="center_me">
        <p class="new_text">Select “Apply” or “Compare To” to continue</p>
      </div>
    </template>
    <transition name="fade">
      <div v-show="selectionError" class="enabled_to_select">
        <p class="medium_text">
          You have already selected this item. Please choose a different one.
        </p>
      </div>
    </transition>
  </div>
</template>

<style>
.enabled_to_select {
  position: absolute !important;
  bottom: 0 !important;
  z-index: 9 !important;
  width: 80% !important;
  display: flex;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  background-color: tomato !important;
  padding: 8px !important;
  border-radius: 8px !important;

  .medium_text {
    color: #fff !important;
  }
}

.active {
  background: var(--Grey-50, #f1f2f3) !important;
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out !important;
}
.fade-enter, 
.fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0 !important;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s ease !important;
}
.fade-scale-enter, 
.fade-scale-leave-to /* .fade-scale-leave-active in <2.1.8 */ {
  opacity: 0 !important;
  transform: scale(0.95) !important;
}

/* Image and text animations */
.title_icon {
  transition: transform 0.4s ease !important;
}
.big_text {
  transition: opacity 0.4s ease !important;
}

.center_me {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
}

.new_text {
  color: var(--Primary-04-Dark, #016f52) !important;
  text-align: center !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: italic !important;
  font-weight: 600 !important;
  line-height: 20px !important; /* 142.857% */
}

.shot {
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  max-width: 120px !important;
  white-space: nowrap !important;
}

.with_opacity {
  background: var(--Grey-300, #cccfd2) !important ;
  cursor: not-allowed !important;
  .btn_text {
    color: var(--Grey-White, #fff) !important;
  }
}

.small_text {
  color: #4b5563 !important;
  font-size: 12px !important;
  font-style: normal !important;
  font-weight: 400 !important;
  line-height: 16px !important; /* 133.333% */
}

.head {
  display: flex !important;
  flex-direction: column !important;
  gap: 4 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out !important;
}

.fade-enter, 
.fade-leave-to /* .fade-leave-active in versions before 2.1.8 */ {
  opacity: 0 !important;
}

.filter-body_right {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  width: 100% !important;

  * {
    box-sizing: border-box !important;
  }

  font-family: "IBM Plex Sans" !important;

  p,
  ul,
  li,
  h3 {
    margin: 0 !important;
    padding: 0 !important;
  }
}

.padding_32 {
  max-height: calc(620px - 174px) !important;
  /* height: 100% !important;  */
  width: 80% !important;
  padding: var(--vertical-padding-lg, 32px) !important;
  transition: all 0.3s ease-in-out !important;

  overflow-y: auto !important;
  scrollbar-width: none !important; /* For Firefox */
  -ms-overflow-style: none !important; /* For IE and Edge */
}

.sidebar_filter_button,
.filter_right_title {
  display: flex;
  padding: var(--corner-med, 8px) 6px !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  align-self: stretch !important;
  border-radius: 4px !important;
  transition: background-color 0.3s ease-in-out !important;
}

.filter_right_title {
  position: sticky !important;
  top: -34px !important;
  justify-content: space-between !important;
  background: #ffffff !important;
  z-index: 2 !important;
}

.flex_8 {
  display: flex !important;
  gap: var(--corner-med, 8px) !important;
  align-items: center !important;
}

.title_icon {
  width: 19.2px !important;
  height: 19.2px !important;
  flex-shrink: 0 !important;
}

.big_text {
  color: #4b5563 !important;
  font-size: 18px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 28px !important;
}

.deep_color {
  color: var(--Grey-800, #2e3338) !important;
}

.in_cap {
  text-transform: capitalize !important;
}

.medium_text {
  color: #4b5563 !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 20px !important;
  text-transform: capitalize !important;
  transition: color 0.3s ease-in-out !important;
  width: 100% !important;

  overflow-wrap: break-word !important;
  word-wrap: break-word !important;
  hyphens: auto !important;
}
</style>

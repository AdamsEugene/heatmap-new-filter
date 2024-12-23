<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import {
  Ad,
  CustomValues,
  Experiment,
  Selected,
  SessionDataItem,
} from "../@types";
import Dropdown from "./shared/Dropdown.vue";
import AddFilterButton from "./shared/AddFilterButton.vue";
import CustomFilterForm from "./shared/CustomFilterForm.vue";
import SaveButton from "./shared/SaveButton.vue";
import {
  manageAdsConnection,
  fetchSegmentData,
  loadPartnerFilers,
} from "./helpers/makeAPIcalls";
import {
  alreadyHaveDisplayName,
  formatUrl,
  getKeyByValue,
  getPartnerValues,
  hasNoDropdown,
  insertItemBeforeSemicolon,
  makeRequestFor,
  numberInput,
  secondNumberInput,
  replaceAfterItem,
  replaceAfterEquals,
  conditions,
  isArrayValid,
  checkForTokens,
  insertValueInRevenueOrder,
  replaceAfterRevenueOrder,
  replaceAdIdValue,
  areAllTrue,
  getThis,
  // updateValuesForEachKey,
  removeVariantSuffix,
  replaceAfterLastEquals,
} from "./helpers/functions";
import { validate } from "./helpers/inputsValidator";
import errorMsgs from "./helpers/errorMsgs";

const props = defineProps<{
  selectedItem: SessionDataItem;
  itemsInPending: number;
  reset: boolean;
  canEdit: boolean;
  canAdd: boolean;
  cancelEdit: boolean;
  selectedItems: string[];
  existingNames: string[];
  errorMsg: Map<number, string>;
  accountID?: number;
  removeThis?: { [key: string]: string };
}>();

const emit = defineEmits<{
  (e: "on-loading", state: boolean): void;
  (e: "on-selected", item: { item: SessionDataItem }): void;
  (e: "on-add-to-waiting-room", item: { item: SessionDataItem }): void;
  (e: "editing-mode"): void;
  (e: "on-save", saved: boolean): void;
  (e: "on-delete-custom-filter"): void;
  (e: "reset-errors", err?: number): void;
  (e: "on-clear-remove"): void;
}>();

const nameIs = (name: string) => name === props.selectedItem.name;

const initiallySavedCustomFilters = ref<CustomValues>();

const simpleListResponse = ref<
  { item: string; id: string; clickable?: boolean }[]
>([]);
const keyValueResponse = ref<Map<string, unknown>>();
const experiments = ref<Experiment[]>();
const shouldEncode = ref(true);
const clearFields = ref(false);
const selectionError = ref(false);

const listForValues =
  ref<{ item: string; id: string; clickable?: boolean }[]>();
const mapOfSelectedItems = ref<Map<string, string[]>>(new Map());
const hasTokens = ref<string[]>();
const _errorMsg = ref(props.errorMsg);
const currentAd = ref<Ad[]>();

let selected: SessionDataItem = { ...props.selectedItem };

const fetchSegment = async () => {
  const accountId = localStorage.getItem("filter-account-id") || 0;
  emit("on-loading", true);
  const [segmentName] = props.selectedItem?.definition?.split("==") || "";
  let res: any;
  if (nameIs("Ads Platform")) {
    res = await manageAdsConnection({
      action: "status",
      userId: props.accountID || +accountId,
      websiteIds: [+getThis("idSite")],
    });

    const isValidObject =
      res && typeof res === "object" && Object.keys(res).length > 0;

    if (!res || (typeof res === "object" && !isValidObject)) {
      emit("on-loading", false);
      return;
    }
  } else {
    res = await fetchSegmentData(segmentName);
    const isValidArray = Array.isArray(res) && res.length > 0;
    const isValidObject =
      res && typeof res === "object" && Object.keys(res).length > 0;

    if (!res || (typeof res === "object" && !isValidArray && !isValidObject)) {
      emit("on-loading", false);
      return;
    }
  }

  keyValueResponse.value = res;
  if (nameIs("Session Tag") || nameIs("Ads Platform")) {
    simpleListResponse.value = Object.keys(res || {}).map((key) => ({
      id: key,
      item: key,
      clickable: true,
    }));
    hasTokens.value = checkForTokens(res);
  } else if (nameIs("A/B Tests")) {
    // updateValuesForEachKey(res.experiments);
    simpleListResponse.value = getPartnerValues(
      res.partners_friendly,
      res.partners
    ).map((key) => ({
      id: key,
      item: key,
      clickable: true,
    }));
    hasTokens.value = undefined;
  } else {
    simpleListResponse.value = res?.map((key: any) => ({
      id: key,
      item: key,
      clickable: true,
    }));
    hasTokens.value = undefined;
  }
  emit("on-loading", false);
};

const freeUpSpace = () => {
  keyValueResponse.value = undefined;
  simpleListResponse.value = [];
  initiallySavedCustomFilters.value = undefined;
  // mapOfSelectedItems.value?.clear();
};

const onProceed = () => {
  const isValid = validate(selected);
  if (areAllTrue(isValid)) {
    emit("on-selected", { item: selected });
    selected = { ...props.selectedItem };
    emit("on-save", false);
    clearFields.value = true;
  } else {
    isValid.forEach((v, i) => {
      if (!v) {
        _errorMsg.value?.set(i, errorMsgs(selected)[i]);
        onSelectionError();
      }
    });
  }
};

const saveCustomFilter = (filter: CustomValues & { title: string }) => {
  const { title, options, conditions, ...other } = filter;
  if (isArrayValid(Object.values(other))) {
    initiallySavedCustomFilters.value = other;
  }
};

const onSelected = async (item: Selected) => {
  const KV = keyValueResponse.value as any;
  if (item.kind === "main") _errorMsg.value.delete(0);
  else _errorMsg.value.delete(1);
  const seOrAd = nameIs("Session Tag") || nameIs("Ads Platform");
  shouldEncode.value = true;
  clearFields.value = false;

  if (item.kind === "main" && seOrAd) {
    if (nameIs("Ads Platform")) {
      emit("on-loading", true);
      const res = await loadPartnerFilers(String(item.item));
      if (!res) {
        emit("on-loading", false);
        return;
      }

      currentAd.value = res[String(item.item)] || undefined;
      if (currentAd.value && currentAd.value.length > 0)
        listForValues.value = currentAd.value
          ?.map((ad) => ad.ad_name || ad.name)
          ?.map((key) => ({
            id: key,
            item: key,
            clickable: true,
          }));

      selected = {
        ...selected,
        definition: insertItemBeforeSemicolon(
          selected.definition,
          String(item.item)
        ),
        nameForCompare: selected.name + ": " + formatUrl(String(item.item)),
      };
      emit("on-loading", false);
    } else {
      listForValues.value = KV[item.item as string]?.map((key: any) => ({
        id: key,
        item: key,
        clickable: true,
      }));

      selected = {
        ...selected,
        definition: insertItemBeforeSemicolon(
          selected.definition,
          String(item.item)
        ),
        nameForCompare: selected.name + ": " + formatUrl(String(item.item)),
      };
    }
  } else if (item.kind === "main" && nameIs("A/B Tests")) {
    const partnersFriendly = getKeyByValue(
      KV.partners_friendly,
      String(item.item)
    );
    if (partnersFriendly) {
      experiments.value = KV["experiments"][partnersFriendly];
      // console.log(experiments.value);
      listForValues.value = KV["experiments"][partnersFriendly]?.map(
        (partner: Experiment) => ({
          id: partner.variant_id || partner.experiment_id || partner.value,
          item: partner.value,
          clickable: partner.clickable ?? true,
        })
      );
      // listForValues.value = KV["experiments"][partnersFriendly];
    }

    selected = {
      ...selected,
      definition: replaceAfterEquals(
        removeVariantSuffix(selected.definition),
        String(item.item)
      ),
      nameForCompare: selected.name + ": " + formatUrl(String(item.item)),
    };
  } else if (item.kind === "main" && nameIs("Average Order Value")) {
    selected = {
      ...selected,
      definition: insertValueInRevenueOrder(
        selected.definition,
        (conditions as any)[String(item.item)]
      ),
      nameForCompare: selected.name + ": " + formatUrl(String(item.item)),
    };
  } else {
    let definition = "";

    let rest: any = {};
    if (nameIs("A/B Tests"))
      definition = getABTestingData(
        removeVariantSuffix(String(item.item)),
        removeVariantSuffix(definition),
        rest,
        item.id
      );
    else if (nameIs("Total Pages Visited"))
      definition = replaceAfterEquals(selected.definition, String(item.item));
    else if (nameIs("Average Order Value")) {
      definition = replaceAfterRevenueOrder(
        selected.definition,
        String(item.item)
      );
      shouldEncode.value = false;
    } else if (seOrAd) {
      if (currentAd.value && nameIs("Ads Platform")) {
        const cur = currentAd.value.find(
          (ad) => (ad.ad_name || ad.name) === item.item
        );
        const adId = cur?.ad_id || cur?.id || "";

        definition = replaceAdIdValue(selected.definition, adId);
      } else if (nameIs("Session Tag")) {
        definition = replaceAfterLastEquals(
          selected.definition,
          String(item.item)
        );
      }
    } else
      definition = replaceAfterEquals(selected.definition, String(item.item));

    const nameForCompare =
      nameIs("Entry Page") || nameIs("Traffic Source") || nameIs("Viewed Page")
        ? replaceAfterEquals(selected.definition, String(item.item))
        : alreadyHaveDisplayName(selected, String(item.item));

    selected = {
      ...selected,
      definition: shouldEncode.value ? encodeURI(definition) : definition,
      nameForCompare: nameForCompare,
      rest: rest,
    };

    emit("on-save", true);
  }
  if (typeof item.item === "string") {
    if (
      mapOfSelectedItems.value.has(props.selectedItem.name) &&
      props.itemsInPending > 0 &&
      props.selectedItems.includes(props.selectedItem.name)
    ) {
      const existingValues =
        mapOfSelectedItems.value.get(props.selectedItem.name) || [];
      if (existingValues.length === 2) {
        existingValues[1] = item.item; // Replace the last item
      } else {
        existingValues.push(item.item); // Add new item
      }
      mapOfSelectedItems.value.set(props.selectedItem.name, existingValues);
    } else {
      mapOfSelectedItems.value.set(props.selectedItem.name, [item.item]);
    }
  }

  emit("on-add-to-waiting-room", { item: selected });
};

const getABTestingData = (
  item: string,
  definition: string,
  rest: any,
  id?: string
) => {
  definition = replaceAfterItem(
    `${selected.definition};friendlyName==`,
    ";friendlyName",
    `==${item}`
  );

  if (experiments.value) {
    const experiment = experiments.value.find((experiment) => {
      // First, check if variant_id exists and matches
      if (experiment.variant_id && experiment.variant_id === id) {
        return true;
      }

      // If no match with variant_id, check if any item has variant_id
      const hasVariantId = experiments.value?.some(
        (exp) => exp.variant_id === id
      );
      if (!hasVariantId) {
        // Only check experiment_id if no variant_id match was found
        if (experiment.experiment_id === id) {
          return true;
        }

        // Finally, check value if no variant_id or experiment_id matches
        if (experiment.value === item) {
          return true;
        }
      }

      return false;
    });

    if (experiment?.variant_id) {
      rest["variant_id"] = experiment.variant_id;
      definition += `;variantId==${experiment.variant_id}`;
    }
    if (experiment?.experiment_id) {
      rest["experiment_id"] = experiment.experiment_id;
      definition += `;experienceId==${experiment.experiment_id}`;
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

const onDeleteCustomFilter = () => {
  emit("on-delete-custom-filter");
};

const onSelectionError = (msg?: string) => {
  if (msg) _errorMsg.value.set(10, msg);
  selectionError.value = true;

  setTimeout(() => {
    selectionError.value = false;

    if (_errorMsg.value.get(10)) {
      emit("reset-errors", 10);
      _errorMsg.value.delete(10);
    } else {
      _errorMsg.value.clear();
      emit("reset-errors");
    }
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
      mapOfSelectedItems.value?.clear();
    }
  }
);

watch(
  () => props.errorMsg,
  (msg) => {
    if (msg.get(10)) {
      _errorMsg.value.set(10, msg.get(10)!);
      onSelectionError();
    } else {
      selectionError.value = false;
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.canAdd,
  (newValue) => {
    if (!newValue) {
      selected = { ...props.selectedItem };
      clearFields.value = true;
    }
  }
);

watch(
  () => props.selectedItems,
  (newItems) => {
    for (const key of mapOfSelectedItems.value.keys()) {
      if (newItems.length && !newItems.includes(key)) {
        mapOfSelectedItems.value.delete(key);
      }
    }
  }
);

watch(
  () => props.removeThis,
  (newItems) => {
    if (newItems && Object.keys(newItems).length) {
      const allKeys = Object.keys(newItems);
      for (const key of allKeys) {
        if (mapOfSelectedItems.value.has(key)) {
          const currentValues = mapOfSelectedItems.value.get(key);
          const updatedValues = currentValues?.filter(
            (value) => value !== newItems[key]
          );
          if (updatedValues && updatedValues.length) {
            mapOfSelectedItems.value.set(key, updatedValues);
          } else {
            mapOfSelectedItems.value.delete(key);
          }
          emit("on-clear-remove");
        } else {
          mapOfSelectedItems.value.delete(key);
          emit("on-clear-remove");
        }
      }
    }
  }
);

watch(
  () => props.selectedItem,
  (item) => {
    // console.log(item);

    freeUpSpace();
    _errorMsg.value.clear();
    makeRequestFor(item.name) && fetchSegment();
    selected = { ...item };
    if (nameIs("Average Order Value"))
      simpleListResponse.value = [
        { id: "Equal To", item: "Equal To", clickable: true },
        { id: "Less Than", item: "Less Than", clickable: true },
        { id: "Greater Than", item: "Greater Than", clickable: true },
      ];
    listForValues.value = undefined;
  }
);
</script>

<template>
  <div
    class="filter-body_right padding_32"
    :class="{ align_me_center: canEdit }"
  >
    <div v-show="!canEdit" class="filter_right_title">
      <div class="head">
        <div class="flex_8">
          <img
            class="title_icon"
            :src="selectedItem.iconSrc"
            :alt="selectedItem.name"
          />
          <p class="big_text deep_color in_cap">
            {{ selectedItem.name }}
          </p>
        </div>
        <p v-show="selectedItem.subTitle" class="small_text">
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
    <div
      v-if="nameIs('Create Custom Filter') || selectedItem.data"
      class="filter-body_right with_margin_bottom"
      :class="{ with_small_width: canEdit }"
    >
      <Custom-filter-form
        :selectedItem="selectedItem"
        :save-custom-filter="saveCustomFilter"
        :clear-fields="clearFields"
        :can-edit="canEdit"
        :cancel-edit="cancelEdit"
        :existing-names="existingNames"
        @on-loading="onLoading"
        @on-clear-current-custom-filter="onClearCurrentCustomFilter"
        @on-custom-filter-change="onOnCustomFilterChange"
        @on-delete-custom-filter="onDeleteCustomFilter"
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
        :disabled-item="mapOfSelectedItems.get(selectedItem.name)"
        :clear-fields="clearFields"
        :has-tokens="hasTokens"
        :error-msg="_errorMsg.get(0)"
        :account-id="accountID"
        @on-selected="onSelected"
        @on-selection-error="onSelectionError"
      />
      <transition name="fade" mode="default">
        <Dropdown
          v-if="selectedItem?.showSign"
          :key="'dropdown2'"
          :items="listForValues"
          :label="selectedItem.name"
          :input-type="
            secondNumberInput(props.selectedItem.name) ? 'number' : 'text'
          "
          :definition="'value'"
          :as-input="!listForValues"
          :disabled-item="mapOfSelectedItems.get(selectedItem.name)"
          :clear-fields="clearFields"
          :error-msg="_errorMsg.get(1)"
          :account-id="accountID"
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
        v-if="itemsInPending >= 1"
        :items-in-pending="itemsInPending !== 2"
        :on-proceed="onProceed"
      />
      <div class="center_me">
        <!-- <p class="new_text">Select “Apply” or “Compare To” to continue</p> -->
      </div>
    </template>
    <transition name="fade">
      <div v-show="selectionError" class="enabled_to_select">
        <p class="medium_text">
          {{
            _errorMsg.get(10) ||
            "You have already selected this item. Please choose a different one."
          }}
        </p>
      </div>
    </transition>
  </div>
</template>

<style>
.enabled_to_select {
  position: sticky !important;
  bottom: 0px !important;
  z-index: 9 !important;
  width: 100% !important;
  display: flex;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  background-color: #ffebe6;
  padding: 8px !important;
  border-radius: 8px !important;

  &.not_error {
    background-color: #e8ffe6ff !important;
  }

  .medium_text {
    color: #2e3338 !important;
  }
}

/* .active {
  background: var(--Grey-50, #f1f2f3) !important;
} */

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
  white-space: normal;
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

  &.with_small_width {
    width: 70% !important;
  }

  &.with_margin_bottom {
    margin-bottom: 36px;
  }

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

.padding_32 {
  max-height: min(45vh, 446px) !important;
  padding: var(--vertical-padding-lg, 32px) !important;
  transition: all 0.3s ease-in-out !important;
  overflow-y: auto !important;
  width: 100% !important;

  &.align_me_center {
    align-items: center;
  }
}

.sidebar_filter_button,
.filter_right_title {
  display: flex;
  padding: var(--corner-med, 8px) 6px !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  align-self: stretch !important;
  border-radius: 4px;
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

.deep_color in_cap {
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
  transition: color 0.3s ease-in-out !important;
  width: 100% !important;

  overflow-wrap: break-word !important;
  word-wrap: break-word !important;
  hyphens: auto !important;
  white-space: normal;
}
</style>

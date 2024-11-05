<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed, onUnmounted } from "vue";
import AddFilterButton from "./AddFilterButton.vue";

import Dropdown from "./Dropdown.vue";
import {
  CustomValues,
  DataItem,
  FilterItem,
  SessionDataItem,
} from "../../@types";
import {
  addOptionsToData,
  convertOptionToArray,
  generateSegmentString,
  getUniqueArray,
  groupDataByCategory,
  initialNewFilter,
  options,
} from "../helpers/functions";
import {
  deleteCustomFilter,
  dynamicallyFetchOptions,
} from "../helpers/makeAPIcalls";
import { _data } from "../../data";
import { validateCustom } from "../helpers/inputsValidator";

type DEF = "main" | "value" | "action" | "condition" | "secValue";
type SELECTED_ITEMS = { item: DataItem | string; kind: DEF; index: number };
type KET_VALUE = { [x: string]: string[] };

const copyOfInitialNewFilter: FilterItem = { ...initialNewFilter };

const newFilter = ref({ ...copyOfInitialNewFilter });

const props = defineProps<{
  selectedItem: SessionDataItem;
  saveCustomFilter: (filter: CustomValues & { title: string }) => void;
  clearFields: boolean;
  activeCustomFilter?: CustomValues;
  canEdit: boolean;
  cancelEdit: boolean;
  existingNames: string[];
}>();

const initialSelectedItem = { ...props.selectedItem };
const selectedItemCopy = JSON.parse(JSON.stringify(initialSelectedItem));

const emit = defineEmits([
  "on-loading",
  "on-custom-filter-change",
  "on-clear-current-custom-filter",
  "on-delete-custom-filter",
]);

const customData = ref<FilterItem>();
const filterName = ref<string>("");
const isSessionTag = ref<Map<number, boolean>>(new Map());

const sessionTagsData = ref<KET_VALUE>();

const nameIs = (name: string) => name === props.selectedItem.name;
const isString = (item: any) => typeof item === "string";

const dataWithConvertedOptions = convertOptionToArray(
  addOptionsToData() as DataItem[]
);
const groupedData = groupDataByCategory(dataWithConvertedOptions);
const allActionItems = ref(groupedData);
const actionItems = ref({ ...allActionItems.value });

const setCustomData = () => {
  if (props.selectedItem.data) {
    customData.value = {
      ...props.selectedItem,
      title: nameIs("Create Custom Filter")
        ? ""
        : props.selectedItem.title || "",
    };
  } else {
    customData.value = { ...props.selectedItem };
  }
  filterName.value = nameIs("Create Custom Filter")
    ? ""
    : customData.value.title;
};

// Computed property to find the current data
const currentData = computed(
  () => (action?: string) => _data.find((item) => item.name === action)
);

// Computed property to find the options for the current category and name
const availableOptions = computed(() => (action?: string) => {
  const category = currentData.value(action)?.category || "";
  const name = currentData.value(action)?.name;
  return actionItems.value[category]?.find((item) => item.name === name)
    ?.options;
});

const loadInitialData = async (filter?: CustomValues) => {
  if (!filter) return;
  emit("on-loading", true);
  const _currentData = currentData.value(filter?.action);

  const option = _currentData?.option;
  const _options = availableOptions.value(filter?.action);

  if (_options && _options.length > 0)
    filter.options = getUniqueArray(_options);
  else {
    const res = await dynamicallyFetchOptions(filter?.segment);
    if (res && res.length) filter.options = getUniqueArray(res);
    else filter.options = undefined;
  }

  filter.conditions = Object.values((options as any)[option || ""] || {}) || [];
  emit("on-loading", false);
};

const onSelected = async (item: SELECTED_ITEMS) => {
  if (props.selectedItem.data) {
    const kind = item.kind === "condition" ? "default" : item.kind;
    props.selectedItem.data[item.index][`error_${kind}`] = "";
  }
  if (item.kind === "action" && typeof item.item !== "string") {
    if (item.item.name === "Session Tag") {
      isSessionTag.value.set(item.index, true);
    } else {
      isSessionTag.value.set(item.index, false);
    }
    let _options: string[] | undefined = undefined;

    if (!newFilter.value.data) {
      newFilter.value.data = [];
    }

    if (!newFilter.value.data[item.index] && item.index) {
      newFilter.value.data[item.index] = {
        action: "",
        segment: "",
        name: "",
        default: "",
        value: "",
      };
    }

    // Now go ahead and update the properties as needed
    newFilter.value.data[item.index].action = item.item.name;
    newFilter.value.data[item.index].segment = item.item.segment || "";
    newFilter.value.data[item.index].name = item.item.name;

    setValues(item.index, item.item.conditions, item.item.options);

    if (!item.item.options || item.item.options?.length === 0) {
      emit("on-loading", true);
      const res = await dynamicallyFetchOptions(
        (item.item as DataItem).segment!
      );

      if (res && (res.length || Object.keys(res || {}).length)) {
        if (Array.isArray(res)) _options = getUniqueArray(res);
        else _options = res;
      } else _options = undefined;

      if (item.item.name === "Session Tag") {
        setValues(item.index, item.item.conditions, _options, true);
      } else setValues(item.index, item.item.conditions, _options);
      emit("on-loading", false);
    }
    newFilter.value.definition = generateSegmentString(newFilter.value.data);
  }

  if (
    item.kind === "condition" &&
    isString(item.item) &&
    props.selectedItem.data
  ) {
    props.selectedItem.data[item.index].default = item.item;
    if (newFilter.value.data) {
      newFilter.value.data[item.index].default = item.item;
      props.selectedItem.data[item.index].value = "";
      props.selectedItem.data[item.index].secValue = "";
      newFilter.value.definition = generateSegmentString(newFilter.value.data);
      props.selectedItem.definition = generateSegmentString(
        newFilter.value.data
      );
    }
  }

  if (item.kind === "value" && isString(item.item) && props.selectedItem.data) {
    props.selectedItem.data[item.index].value = item.item;
    if (
      props.selectedItem.data[item.index].name === "Session Tag" &&
      sessionTagsData.value
    ) {
      props.selectedItem.data[item.index].secOptions =
        sessionTagsData.value[item.item] || [];
      props.selectedItem.data[item.index].secValue = "";
    }

    if (newFilter.value.data) {
      newFilter.value.data[item.index].value = item.item;
      newFilter.value.definition = generateSegmentString(newFilter.value.data);
      props.selectedItem.definition = generateSegmentString(
        newFilter.value.data
      );
    }
  }

  if (
    item.kind === "secValue" &&
    isString(item.item) &&
    props.selectedItem.data
  ) {
    props.selectedItem.data[item.index].secValue = item.item;
    if (newFilter.value.data) {
      newFilter.value.data[item.index].secValue = item.item;
      newFilter.value.definition = generateSegmentString(newFilter.value.data);
      props.selectedItem.definition = generateSegmentString(
        newFilter.value.data
      );
    }
  }
  // console.log(newFilter.value);

  emit("on-custom-filter-change", { ...newFilter.value });
};

const setValues = (
  index: number,
  conditions?: string[],
  options?: string[] | KET_VALUE,
  forSession?: boolean
) => {
  if (typeof index === "number" && props.selectedItem.data) {
    props.selectedItem.data[index].conditions = conditions;
    props.selectedItem.data[index].default = "";
    props.selectedItem.data[index].value = "";
    props.selectedItem.definition = generateSegmentString(
      props.selectedItem.data
    );
    if (!forSession) props.selectedItem.data[index].options = options;
    else {
      sessionTagsData.value = options as KET_VALUE;
      props.selectedItem.data[index].options = Object.keys(
        options as KET_VALUE
      );
    }
  }
};

const removeFilter = (index: number) => {
  const newData = props.selectedItem.data?.filter((_, pos) => pos !== index);
  props.selectedItem.data = newData;
  newFilter.value.definition = generateSegmentString(newData || []);
};

const addNewFilter = () => {
  const isValid = validateCustom(props.selectedItem, props.existingNames);
  if (isValid) {
    const copy = ref({ ...copyOfInitialNewFilter });
    const newCopy = JSON.parse(JSON.stringify(copy.value));
    if (!props.selectedItem.data) props.selectedItem.data = newCopy.data;
    else props.selectedItem.data?.push(...newCopy.data!);
  }
};

const deleteFilter = async () => {
  emit("on-loading", true);
  await deleteCustomFilter(props.selectedItem);
  emit("on-delete-custom-filter");
  emit("on-loading", false);
};

onMounted(() => {
  setCustomData();
  newFilter.value = props.selectedItem;
  props.selectedItem.data?.forEach((data) => {
    loadInitialData(data);
  });
});

onUnmounted(() => {
  props.selectedItem.data = selectedItemCopy.data;
  props.selectedItem.title = selectedItemCopy.title;
  props.selectedItem.definition = selectedItemCopy.definition;
});

watch(
  () => props.selectedItem,
  (newSelectedItem) => {
    setCustomData();
    selectedItemCopy.value = { ...newSelectedItem };

    filterName.value = customData.value?.title || "";
    filterName.value = nameIs("Create Custom Filter")
      ? ""
      : customData.value?.title || "";
    newFilter.value = copyOfInitialNewFilter;
    // newFilter.value = props.selectedItem;
    newSelectedItem.data?.forEach((data) => {
      loadInitialData(data);
    });
  }
);

watch(
  () => props.clearFields,
  () => {
    if (props.clearFields) {
      emit("on-clear-current-custom-filter");
    }
  }
);

watch(
  () => props.cancelEdit,
  (newValue) => {
    if (newValue) {
      props.selectedItem.data = selectedItemCopy.data;
      props.selectedItem.title = selectedItemCopy.title;
      props.selectedItem.definition = selectedItemCopy.definition;
      filterName.value = selectedItemCopy.title;
    } else {
      props.selectedItem.data?.forEach((data) => {
        loadInitialData(data);
      });
    }
  }
);

watch(filterName, async (newName) => {
  await nextTick();
  if (props.selectedItem.title !== newName && newName) {
    emit("on-custom-filter-change", { ...newFilter.value, title: newName });
    props.selectedItem.title = newName;
  }
});
</script>

<template>
  <div class="filter-body_right">
    <div class="dropdown with_border_bottom">
      <label for="this_dropdown" class="medium_text">{{ "Filter Name" }}</label>
      <input
        id="this_dropdown"
        type="text"
        :placeholder="'Enter filter name'"
        class="dropdown-input"
        :class="{ input_error: (selectedItem as any)['error_title'] }"
        v-model="filterName"
        autocomplete="off"
        :disabled="!canEdit"
        @focus="(selectedItem as any)['error_title'] = ''"
      />
      <transition name="fade">
        <div
          v-show="(selectedItem as any)['error_title']"
          class="flex_sb error_sb"
        >
          <p class="input_selection_error medium_text">
            {{ (selectedItem as any)["error_title"] }}
          </p>
        </div>
      </transition>
    </div>
    <div
      v-for="(filter, index) in selectedItem?.data"
      :key="filter.name"
      class="custom_filter"
    >
      <Dropdown
        :action-items="actionItems"
        :label="'Action'"
        :position="'up'"
        :as-input="!canEdit"
        :definition="'action'"
        :input-type="'text'"
        :for-custom="true"
        :initial-value="filter?.action"
        :clear-fields="clearFields"
        :disabled="!canEdit"
        :all-action-items="allActionItems"
        :filter-index="index"
        :error-msg="filter?.error_action"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
      <Dropdown
        :items="filter?.conditions"
        :label="'Condition'"
        :position="'up'"
        :as-input="!canEdit"
        :definition="'condition'"
        :input-type="'text'"
        :initial-value="filter?.default"
        :clear-fields="clearFields"
        :disabled="!canEdit"
        :filter-index="index"
        :error-msg="filter?.error_default"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
      <Dropdown
        :items="filter?.options"
        :label="isSessionTag.get(index) ? 'Session Tag Name' : 'Value'"
        :position="'up'"
        :as-input="!canEdit ? !canEdit : !filter?.options"
        :definition="'value'"
        :initial-value="filter?.value"
        :clear-fields="clearFields"
        :disabled="!canEdit"
        :filter-index="index"
        :error-msg="filter?.error_value"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
      <Dropdown
        v-if="filter.secOptions"
        :items="filter.secOptions"
        :label="'Tag Value'"
        :position="'up'"
        :as-input="!canEdit ? !canEdit : !filter?.secOptions"
        :definition="'secValue'"
        :initial-value="filter?.secValue"
        :clear-fields="clearFields"
        :disabled="!canEdit"
        :filter-index="index"
        :error-msg="filter?.error_secValue"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
      <div v-if="!canEdit && (selectedItem?.data?.length || 0) !== index + 1" />
      <div
        v-show="(selectedItem?.data?.length || 0) > 1 && canEdit"
        class="flex_sb"
      >
        <div></div>
        <div class="remove" @click.stop="removeFilter(index)">
          <img
            class=""
            src="../../assets/images/remove.svg"
            alt="remove icon"
          />
          <p class="remove_test normal_text">Remove Filter</p>
        </div>
      </div>
      <div
        v-show="
          (selectedItem?.data?.length || 0) !== 1 &&
          (selectedItem?.data?.length || 0) !== index + 1
        "
        class="horizontal_wrapper"
      >
        <div class="horizontal" />
        <div class="condition">
          <p class="condition_text medium_text">AND</p>
        </div>
      </div>
    </div>
  </div>
  <div v-show="!canEdit" class="flex_sb">
    <add-filter-button
      :label="`Delete “${selectedItem.title}”`"
      :with-border="true"
      :no-icon="true"
      :onclick="deleteFilter"
    />
  </div>
  <div v-show="canEdit" class="flex_sb">
    <add-filter-button
      :label="'Add Additional Filter'"
      :with-border="true"
      :no-icon="true"
      :onclick="addNewFilter"
    />
  </div>
</template>

<style>
.condition {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  display: inline-flex !important;
  padding: 4px var(--corner-med, 8px) !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 10px !important;
  background: var(--Grey-White, #fff) !important;
}

.condition_text {
  color: var(--Grey-800, #34404b) !important;
}

.horizontal_wrapper {
  position: relative !important;
  width: 100% !important;
}

.horizontal {
  width: 100% !important;
  height: 1px !important;
  background: var(--Grey-200, #e6e7e8) !important;
}

.with_border_bottom {
  padding-bottom: 16px !important;
  border-bottom: 1px solid #e6e7e8 !important;
}

.remove {
  display: flex;
  padding: 4px var(--corner-med, 8px) !important;
  justify-content: flex-end !important;
  align-items: center !important;
  gap: 4px !important;
  /* align-self: stretch !important; */
  background: var(--Grey-White, #fff) !important;
  cursor: pointer !important;

  .remove_test {
    color: var(--Error-05-Darker, #7a0b28) !important;
  }
}

.custom_filter {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  width: 100% !important;
  margin-bottom: 4px !important;
}

.arrow_button_wrapper {
  position: absolute !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  right: 0% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 24px !important;
  height: 24px !important;
  flex-shrink: 0 !important;
  cursor: pointer !important;

  &.we_have_error {
    top: 32% !important;
  }
}

.arrow_button_wrapper svg {
  transition: transform 0.3s ease !important;
}

.arrow_button_wrapper svg.rotated {
  transform: rotate(180deg) !important;
}

.dropdown_body {
  display: flex !important;
  width: calc(100% - 24px) !important;
  padding: 8px 12px !important;
  justify-content: space-between !important;
  align-items: center !important;
  align-self: stretch !important;
  border-radius: var(--corner-med, 8px) !important;
  border: 1px solid var(--Grey-200, #e6e7e8) !important;
  background: var(--Grey-White, #fff) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  margin: 0 !important;
  height: 30px !important;

  &.has_arrow {
    padding-right: 36px !important;
    width: calc(100% - 50px) !important;
  }

  color: var(--Grey-800, #34404b) !important;
  font-size: 16px !important;
  font-style: normal !important;
  font-weight: 400 !important;
  line-height: 24px !important; /* 150% */

  &.second_one {
    text-align: right !important;
  }
}

.dropdown_body::placeholder {
  color: var(--Grey-800, #999fa5) !important;
  font-size: 16px !important;
  font-style: normal !important;
  font-weight: 400 !important;
  line-height: 24px !important; /* 150% */
}

#accordion {
  display: flex;
  flex-direction: column !important;
  max-height: 1000px !important;
  /* transition: max-height 0.5s ease-out !important; */

  .content {
    max-height: 0 !important;
    overflow: hidden !important;
    transition: max-height 0.5s ease-out !important;
    scrollbar-gutter: stable both-edges !important;
  }
}
#accordion label + input[type="checkbox"]:checked + .content {
  max-height: 330px !important;
  overflow-y: auto !important;
  scrollbar-gutter: stable both-edges !important;
}

#accordion input[type="checkbox"]:checked + label {
  transform: rotate(180deg) !important;
}

#inner_arrow {
  margin-right: 2px !important;
}

.filter-body_right {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  /* width: 100% !important; */

  width: 80% !important;

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

.dropdown {
  display: flex !important;
  position: relative !important;
  width: 100% !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 4px !important;
  flex-shrink: 0 !important;
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

.dropdown-input {
  display: flex !important;
  height: 44px !important;
  width: 100% !important;
  padding: 12px !important;
  justify-content: space-between !important;
  align-items: center !important;
  align-self: stretch !important;
  border-radius: 8px !important;
  border: 1px solid #cccfd2 !important;
  background: #fff !important;
  padding-right: 34px !important;

  color: #4b5563 !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 20px !important; /* 142.857% */
  text-transform: capitalize !important;

  &.no_padding {
    padding-right: 12px !important;
  }

  /* Shadows/XS */
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
}

.dropdown-input::placeholder {
  color: #4b5563 !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 20px !important; /* 142.857% */
  text-transform: capitalize !important;
}

.dropdown-input:focus {
  border-color: #00936f !important;
  outline: none !important; /* Removes default outline */
}

.flex_sb {
  display: flex;
  justify-content: space-between !important;
  gap: var(--corner-med, 8px) !important;
  align-items: center !important;
}

.normal_text {
  color: var(--Grey-800, #34404b) !important;
  font-family: "Source Sans 3" !important;
  font-size: 14px !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 18px !important;
  transition: all 0.3s ease-in-out !important;
}

.center_me {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
}
</style>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed } from "vue";

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
  getUniqueArray,
  groupDataByCategory,
  initialNewFilter,
  options,
} from "../helpers/functions";
import { dynamicallyFetchOptions } from "../helpers/makeAPIcalls";
import { _data } from "../../data";

type DEF = "main" | "value" | "action" | "condition";
type SELECTED_ITEMS = { item: DataItem | string; kind: DEF; index: number };

const copyOfInitialNewFilter: FilterItem = { ...initialNewFilter };

const newFilter = ref({ ...copyOfInitialNewFilter });

const props = defineProps<{
  selectedItem: SessionDataItem;
  saveCustomFilter: (filter: CustomValues & { title: string }) => void;
  clearFields: boolean;
  activeCustomFilter?: CustomValues;
}>();

const emit = defineEmits([
  "on-loading",
  "on-custom-filter-change",
  "on-clear-current-custom-filter",
]);

const customData = ref<FilterItem>();
const filterName = ref<string>("");

const nameIs = (name: string) => name === props.selectedItem.name;
const isString = (item: any) => typeof item === "string";

const dataWithConvertedOptions = convertOptionToArray(
  addOptionsToData() as DataItem[]
);
const groupedData = groupDataByCategory(dataWithConvertedOptions);
const allActionItems = ref(groupedData);
const actionItems = ref({ ...allActionItems.value });

// console.log(actionItems.value);

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

  filter.conditions = Object.values((options as any)[option || ""]) || [];
  emit("on-loading", false);
};

const onSelected = async (item: SELECTED_ITEMS) => {
  console.log("onSelected: ", item.item);
  if (item.kind === "action" && typeof item.item !== "string") {
    let _options: string[] | undefined = undefined;

    if (newFilter.value.data) {
      newFilter.value.data[item.index].action = item.item.name;
      newFilter.value.data[item.index].segment = item.item.segment || "";
      newFilter.value.data[item.index].name = item.item.name;
    }

    // console.log(props.selectedItem.data[item.index]);
    setValues(item.index, item.item.conditions, item.item.options);

    if (!item.item.options || item.item.options?.length === 0) {
      emit("on-loading", true);
      const res = await dynamicallyFetchOptions(
        (item.item as DataItem).segment!
      );
      if (res && res.length) _options = getUniqueArray(res);
      else _options = undefined;

      setValues(item.index, item.item.conditions, _options);
      emit("on-loading", false);
    }
  }

  if (
    item.kind === "condition" &&
    isString(item.item) &&
    props.selectedItem.data
  ) {
    props.selectedItem.data[item.index].default = item.item;
    if (newFilter.value.data) {
      newFilter.value.data[item.index].default = item.item;
    }
  }

  if (item.kind === "value" && isString(item.item) && props.selectedItem.data) {
    props.selectedItem.data[item.index].value = item.item;
    if (newFilter.value.data) {
      newFilter.value.data[item.index].value = item.item;
    }
  }

  emit("on-custom-filter-change", { ...newFilter.value });

  console.log(newFilter.value);
  // console.log(props.selectedItem.data);
};

const setValues = (
  index: number,
  conditions?: string[],
  options?: string[]
) => {
  if (typeof index === "number" && props.selectedItem.data) {
    props.selectedItem.data[index].conditions = conditions;
    props.selectedItem.data[index].options = options;
    props.selectedItem.data[index].default = "";
    props.selectedItem.data[index].value = "";
  }
};

onMounted(() => {
  setCustomData();
  props.selectedItem.data?.forEach((data) => {
    loadInitialData(data);
  });
});

watch(
  () => props.selectedItem,
  () => {
    // console.log(props.selectedItem);

    setCustomData();
    filterName.value = customData.value?.title || "";
    filterName.value = nameIs("Create Custom Filter")
      ? ""
      : customData.value?.title || "";
    newFilter.value = copyOfInitialNewFilter;

    props.selectedItem.data?.forEach((data) => {
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

watch(filterName, async (newName) => {
  await nextTick();
  props.selectedItem.name !== newName &&
    newName &&
    emit("on-custom-filter-change", { ...newFilter.value, title: newName });
});
</script>

<template>
  <div class="filter-body_right">
    <div class="dropdown">
      <label for="this_dropdown" class="medium_text">{{ "Filter Name" }}</label>
      <input
        id="this_dropdown"
        type="text"
        :placeholder="'Enter filter name'"
        class="dropdown-input"
        v-model="filterName"
        autocomplete="off"
      />
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
        :as-input="false"
        :definition="'action'"
        :input-type="'text'"
        :for-custom="true"
        :initial-value="filter?.action"
        :clear-fields="clearFields"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
      <Dropdown
        :items="filter?.conditions"
        :label="'Condition'"
        :position="'up'"
        :as-input="false"
        :definition="'condition'"
        :input-type="'text'"
        :initial-value="filter?.default"
        :clear-fields="clearFields"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
      <Dropdown
        :items="filter?.options"
        :label="'Value'"
        :position="'up'"
        :as-input="!filter?.options"
        :definition="'value'"
        :initial-value="filter?.value"
        :clear-fields="clearFields"
        @on-selected="(item) => onSelected({ ...item, index })"
      />
    </div>
  </div>
  <!-- <div class="flex_sb">
    <div
      class="btn primary"
      @click="saveCustomFilter({ ...newFilter, title: filterName })"
    >
      <p class="btn_text">Save</p>
    </div>
  </div> -->
</template>

<style>
.custom_filter {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-bottom: 20px;
}

.arrow_button_wrapper {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 0%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;

  &.we_have_error {
    top: 32%;
  }
}

.arrow_button_wrapper svg {
  transition: transform 0.3s ease;
}

.arrow_button_wrapper svg.rotated {
  transform: rotate(180deg);
}

.dropdown_body {
  display: flex;
  width: calc(100% - 24px);
  padding: 8px 12px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: var(--corner-med, 8px);
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  margin: 0;
  height: 30px;

  &.has_arrow {
    padding-right: 36px;
    width: calc(100% - 50px);
  }

  color: var(--Grey-800, #34404b);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 150% */

  &.second_one {
    text-align: right;
  }
}

.dropdown_body::placeholder {
  color: var(--Grey-800, #999fa5);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 150% */
}

.dropdown_menu_wrapper {
  position: absolute;
  width: 100%;
  border-radius: var(--corner-med, 10px);
  background: var(--Grey-White, #fff);
  border: 1px solid var(--Grey-200, #e6e7e8);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  list-style: none;
  margin-top: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  &.align_center {
    top: 50%;
    transform: translate(0px, -28%);
  }

  .dropdown_menu_item {
    display: flex;
    padding: var(--corner-med, 8px) var(--horizontal-padding-lg, 12px);
    align-items: flex-start;
    align-self: stretch;
    cursor: pointer;
    white-space: pre-wrap !important;

    &.action {
      display: flex;
      padding: 10px 14px 10px var(--horizontal-padding-lg, 12px);
      justify-content: space-between;
      align-items: center;
      align-self: stretch;
      background: var(--Grey-100, #f6f6f6);
    }

    color: var(--Grey-800, #34404b);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
    &:not(:last-child) {
      border-bottom: 1px solid var(--Grey-200, #e6e7e8);
    }
    &.activeClass {
      color: var(--Grey-800, #fff) !important;
      /* background: #03c191 !important; */
    }

    &.inner_items {
      display: flex;
      padding: var(--horizontal-padding-lg, 12px)
        var(--vertical-padding-lg, 24px);
      align-items: center;
      justify-content: space-between;
      align-self: stretch;
      font-weight: 600;
      line-height: 18px; /* 138.462% */
      transition: all 0.3s ease-in-out;
      &.activeClass {
        background: #03c191;
        color: #fff;

        p {
          color: #fff !important;
        }

        .help_icon_inner {
          img {
            filter: invert(100%);
          }
        }
      }

      .help_icon_inner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20px;
        transition: all 0.3s ease-in-out;

        img {
          height: 16px;
          transition: all 0.3s ease-in-out;
        }
      }
    }
  }

  .dropdown_menu_item:hover {
    background: #e6e7e8;
  }
}

#accordion {
  display: flex;
  flex-direction: column;
  max-height: 1000px;
  /* transition: max-height 0.5s ease-out; */

  .content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease-out;
    scrollbar-gutter: stable both-edges;
  }
}
#accordion label + input[type="checkbox"]:checked + .content {
  max-height: 330px;
  overflow-y: auto;
  scrollbar-gutter: stable both-edges;
}

#accordion input[type="checkbox"]:checked + label {
  transform: rotate(180deg);
}

#inner_arrow {
  margin-right: 2px;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, nextTick, InputTypeHTMLAttribute } from "vue";
import {
  labelMap,
  placeholderMap,
  SecondLabelMap,
  SecondPlaceholderMap,
} from "../helpers/lookUps";
import { DataItem, GroupedData } from "../../@types";

const props = defineProps<{
  label?: string;
  placeholder?: string;
  items?: string[];
  actionItems?: GroupedData;
  position?: "up" | "down";
  definition: "main" | "value" | "action" | "condition";
  asInput?: boolean;
  inputType?: InputTypeHTMLAttribute;
  forCustom?: boolean;
  initialValue?: string;
  clearFields?: boolean;
  disabledItem?: string[];
}>();

const emit = defineEmits(["on-selected", "on-selection-error"]);

const searchQuery = ref<string>(props.initialValue || "");
const isDropdownOpen = ref<boolean>(false);
const dropdownListRef = ref<HTMLElement | null>(null);
const dropdownListSecondRef = ref<HTMLElement | null>(null);

const inputLabel = computed(() => {
  if (props.position === "up") {
    return labelMap(props.label);
  }
  return SecondLabelMap(props.label);
});

const inputPlaceholder = computed(() => {
  if (props.position === "up") {
    return placeholderMap(props.label);
  }
  return SecondPlaceholderMap(props.label);
});

// console.log(props.actionItems);

const filteredItems = computed(() => {
  return Array.isArray(props?.items)
    ? props?.items?.slice().sort((a, b) => {
        const query = searchQuery.value.toLowerCase();
        const aMatch = a.toLowerCase().includes(query);
        const bMatch = b.toLowerCase().includes(query);

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return a.localeCompare(b);
      })
    : props.items;
});

const disabledItems = computed(
  () => (item: string) => props.disabledItem?.find((name) => name === item)
);

const disabled = (item: string) =>
  props.disabledItem?.find((name) => name === item);

const closeDropdown = () => {
  if (props.forCustom) return;
  else
    setTimeout(() => {
      isDropdownOpen.value = false;
    }, 150);
};

const nameIs = (name: string) => name === props.label;

const handleItemSelection = (item: string | DataItem) => {
  if (typeof item === "string") searchQuery.value = item;
  else searchQuery.value = item.name;
  emit("on-selected", { item, kind: props.definition });
  isDropdownOpen.value = false;
};

const itemSelectWithDisabled = (item: string | DataItem, check: string) => {
  if (!disabled(check)) handleItemSelection(item);
  else emit("on-selection-error");
};

// Watch for dropdown open state and scroll it into view when opened
watch(isDropdownOpen, async (newValue) => {
  if (newValue) {
    await nextTick(); // Ensure the DOM is updated
    if (dropdownListRef.value) {
      dropdownListRef.value.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    if (dropdownListSecondRef.value) {
      dropdownListSecondRef.value.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
});

watch(
  () => props.items,
  () => {
    searchQuery.value = props.initialValue || "";
  }
);

watch(
  () => props.initialValue,
  () => {
    searchQuery.value = props.initialValue || "";
  }
);

watch(
  () => props.clearFields,
  (newValue) => {
    if (newValue) searchQuery.value = "";
  }
);

watch(searchQuery, (newQuery) => {
  (nameIs("Total Pages Visited") ||
    ((nameIs("Average Order Value") || props.asInput) &&
      props.definition === "value")) &&
    newQuery &&
    emit("on-selected", { item: newQuery, kind: props.definition });
});
</script>

<template>
  <div class="dropdown-container">
    <div class="dropdown">
      <label for="this_dropdown" class="medium_text">{{
        inputLabel || "Select Platform"
      }}</label>
      <input
        id="this_dropdown"
        class="dropdown-input"
        autocomplete="off"
        v-model="searchQuery"
        :type="inputType"
        :placeholder="inputPlaceholder || 'Select items...'"
        :class="{ no_padding: inputType === 'number' }"
        @focus="isDropdownOpen = true"
        @blur="closeDropdown"
      />
      <div
        v-show="!asInput"
        class="arrow_down"
        @click="isDropdownOpen = !isDropdownOpen"
      >
        <img
          :class="['arrow_icon', { rotate: isDropdownOpen }]"
          src="../../assets/images/ArrowDown.svg"
          alt="arrow icon"
        />
      </div>
    </div>

    <div
      v-if="!nameIs('Ads Platform') && isDropdownOpen && !asInput && !forCustom"
      class="dropdown-list"
      ref="dropdownListRef"
    >
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        class="dropdown-item"
        :class="{
          selected: searchQuery === item || disabledItem?.includes(item),
          disabled: disabledItems(item),
        }"
        @click="itemSelectWithDisabled(item, item)"
      >
        <p class="medium_text">{{ item }}</p>
      </div>
    </div>
    <div
      v-if="nameIs('Ads Platform') && isDropdownOpen && !asInput && !forCustom"
      class="dropdown-list_ads"
      ref="dropdownListSecondRef"
    >
      <div class="ads_title">
        <p class="medium_text">AD PLATFORM</p>
      </div>
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        class="dropdown-item_ads"
        :class="{
          selected: searchQuery === item || disabledItem?.includes(item),
          disabled: disabledItems(item),
        }"
        @click="itemSelectWithDisabled(item, item)"
      >
        <div class="ads_left">
          <img
            class="button_icon"
            src="../../assets/images/twitter.svg"
            alt="add icon"
          />
          <p class="medium_text">{{ item }}</p>
        </div>
        <div class="ads_right">
          <p class="medium_text">Connect</p>
          <img
            class="button_icon"
            src="../../assets/images/link.svg"
            alt="add icon"
          />
        </div>
      </div>
    </div>
    <div
      v-if="forCustom && isDropdownOpen"
      class="dropdown_menu_wrapper"
      ref="dropdownListRef"
    >
      <transition name="dropdown">
        <ul
          id="accordion"
          v-show="true"
          class=""
          :class="{ align_center: true }"
        >
          <li v-for="(itemsToLoop, category) in actionItems" :key="category">
            <label
              :for="String(category)"
              class="dropdown_menu_item action"
              :class="{ activeClass: category === undefined }"
            >
              <p>
                {{ category }}
              </p>
              <arrow-svg :id="'inner_arrow'" />
            </label>
            <input
              type="checkbox"
              name="accordion"
              :id="String(category)"
              hidden
            />
            <ul class="content">
              <li
                v-for="innerItem in itemsToLoop"
                :key="innerItem.name"
                class="dropdown_menu_item inner_items"
                :class="{
                  activeClass: innerItem.name === searchQuery,
                }"
                @click="itemSelectWithDisabled(innerItem, innerItem.name)"
              >
                <p>
                  {{ innerItem.name }}
                </p>
                <div
                  class="help_icon_inner"
                  v-if="true"
                  :title="innerItem.name"
                >
                  <img class="filter_image" alt="" />
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<style>
.dropdown-container {
  position: relative;
  width: 100%;
}

.dropdown {
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex-shrink: 0;
}

.medium_text {
  color: #4b5563;
  font-family: "Source Sans 3";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  text-transform: capitalize;
  transition: color 0.3s ease-in-out;
  width: 100%;

  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

.arrow_down {
  position: absolute;
  right: 12px;
  top: 32px;
  cursor: pointer;
}

.dropdown-input {
  display: flex;
  height: 44px;
  width: 100%;
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid #cccfd2;
  background: #fff;
  padding-right: 34px;

  color: #4b5563;
  font-family: "Source Sans 3";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  text-transform: capitalize;

  &.no_padding {
    padding-right: 12px;
  }

  /* Shadows/XS */
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
}

.dropdown-input::placeholder {
  color: #4b5563;
  font-family: "Source Sans 3";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  text-transform: capitalize;
}

.dropdown-input:focus {
  border-color: #00936f;
  outline: none; /* Removes default outline */
}

.dropdown-list,
.dropdown-list_ads {
  position: absolute;
  top: 106%;
  left: 0;
  width: 100%;
  display: flex;
  max-height: 303px;
  padding: var(--corner-med, 8px) 0px;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
  border-radius: var(--corner-med, 8px);
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  overflow-y: auto;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For IE and Edge */
}

.dropdown-item,
.dropdown-item_ads {
  display: flex;
  padding: var(--corner-med, 8px);
  align-items: center;
  gap: var(--corner-med, 8px);
  align-self: stretch;
  border-bottom: 1px solid var(--Grey-200, #e6e7e8);
  transition: background-color 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: var(--Grey-100, #e3e5e8);

    /* .medium_text {
      color: var(--Grey-White, #fff);
    } */
  }
  &.selected {
    background-color: var(--Primary-500-base, #00c291);

    .medium_text {
      color: var(--Grey-White, #fff);
    }
  }
}

.ads_left {
  display: flex;
  align-items: center;
  gap: var(--corner-med, 8px);
}

.ads_right {
  display: flex;
  width: 94px;
  height: 30px;
  padding: 0px var(--corner-med, 8px);
  justify-content: center;
  align-items: center;
  gap: var(--corner-med, 8px);
  border-radius: var(--corner-med, 8px);
  background: var(--Grey-50, #f1f2f3);
}

.dropdown-item_ads {
  padding: 16px var(--horizontal-padding-lg, 12px);
  justify-content: space-between;
}

/* Rotation of the SVG */
.arrow_icon {
  transition: transform 0.3s ease-in-out;
}

.arrow_icon.rotate {
  transform: rotate(180deg);
}

.ads_title {
  display: flex;
  padding: 5px var(--horizontal-padding-lg, 12px);
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid var(--Grey-200, #e6e7e8);
}

.disabled {
  cursor: not-allowed;
}
</style>

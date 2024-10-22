<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  InputTypeHTMLAttribute,
  onMounted,
  onUnmounted,
} from "vue";

import AdsIntegrationModal from "./AdsIntegrationModal.vue";
import {
  labelMap,
  placeholderMap,
  SecondLabelMap,
  SecondPlaceholderMap,
} from "../helpers/lookUps";
import { DataItem, GroupedData } from "../../@types";

import fb from "../../assets/images/facebook.svg";
import x from "../../assets/images/twitter.svg";
import go from "../../assets/images/google.svg";
import ti from "../../assets/images/tiktok.svg";
import ji from "../../assets/images/ji.svg";
import ig from "../../assets/images/ig.svg";
import { manageAdsConnection } from "../helpers/makeAPIcalls";
import {
  actionItemsSearch,
  detectUrlChange,
  getThis,
} from "../helpers/functions";

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
  disabled?: boolean;
  hasTokens?: string[];
  allActionItems?: GroupedData;
  filterIndex?: number;
  errorMsg?: string;
  accountID?: number;
}>();

const returnImg = (name: string) => {
  const obj = {
    facebook: fb,
    x: x,
    google: go,
    tiktok: ti,
    instagram: ig,
    jira: ji,
  };
  return (obj as any)[name] || go;
};

const emit = defineEmits(["on-selected", "on-selection-error"]);

const searchQuery = ref<string>(props.initialValue || "");
const isDropdownOpen = ref<boolean>(false);
const dropdownListRef = ref<HTMLElement | null>(null);
const mainDropdownListRef = ref<HTMLElement | null>(null);
const dropdownListSecondRef = ref<HTMLElement | null>(null);
const loading = ref<string>("");
const showModal = ref(false);
const modalUrl = ref("");

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

const filteredItems = computed(() => {
  return Array.isArray(props?.items)
    ? props.items.filter((item) =>
        item.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : props.items;
});

const filteredActionItems = computed(() =>
  props.actionItems
    ? actionItemsSearch(
        props.actionItems,
        searchQuery.value,
        props.allActionItems
      )
    : props.actionItems
);

const disabledItems = computed(
  () => (item: string) => props.disabledItem?.find((name) => name === item)
);

const _disabled = (item: string) =>
  props.disabledItem?.find((name) => name === item);

const closeDropdown = () => {
  const i = props.items;
  const h = props.hasTokens;
  if (props.forCustom || (h && i && h?.length < i?.length)) return;
  else
    setTimeout(() => {
      isDropdownOpen.value = false;
    }, 150);
};

const onfocus = () => {
  isDropdownOpen.value = true;
};

const nameIs = (name: string) => name === props.label;

const handleItemSelection = (item: string | DataItem) => {
  if (typeof item === "string") searchQuery.value = item;
  else searchQuery.value = item.name;
  emit("on-selected", { item, kind: props.definition });
  isDropdownOpen.value = false;
};

const itemSelectWithDisabled = (item: string | DataItem, check: string) => {
  if (!_disabled(check)) handleItemSelection(item);
  else emit("on-selection-error");
};

const manageConnection = async (partner: string) => {
  const accountId = localStorage.getItem("filter-account-id") || 0;
  loading.value = partner;
  const res = await manageAdsConnection({
    action: "authorize",
    userId: props.accountID || +accountId,
    partner,
    websiteIds: [+getThis("idSite")],
    redirectType: "dashboard",
  });
  localStorage.setItem("ads-partner-name", partner);
  localStorage.setItem("twitterCodeVerifier", JSON.stringify(res));
  if (res.url) window.location.href = res.url;

  // loading.value = "";
};

onMounted(() => {
  const cleanup = detectUrlChange();
  onUnmounted(cleanup);
});

// Watch for dropdown open state and scroll it into view when opened
watch(isDropdownOpen, async (newValue) => {
  if (newValue) {
    await nextTick(); // Ensure the DOM is updated
    if (dropdownListRef.value) {
      dropdownListRef.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    if (mainDropdownListRef.value) {
      mainDropdownListRef.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    if (dropdownListSecondRef.value) {
      dropdownListSecondRef.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
});

const closeModal = () => {
  showModal.value = false;
  modalUrl.value = "";
};

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
  const isAOV = nameIs("Average Order Value") || props.asInput;
  const isSec = props.definition === "value";
  let validInput = false;
  if (typeof newQuery === "number") validInput = true;
  else validInput = Boolean(newQuery);

  if ((nameIs("Total Pages Visited") || (isAOV && isSec)) && validInput) {
    emit("on-selected", { item: newQuery, kind: props.definition });
  }
});
</script>

<template>
  <div class="dropdown-container">
    <AdsIntegrationModal
      :show="showModal"
      :url="modalUrl"
      @close="closeModal"
    />
    <div class="dropdown">
      <label
        :for="`this_dropdown_${inputLabel} ${filterIndex}`"
        class="medium_text"
        >{{ inputLabel || "Select Platform" }}</label
      >
      <input
        :id="`this_dropdown_${inputLabel} ${filterIndex}`"
        class="dropdown-input"
        autocomplete="off"
        v-model="searchQuery"
        :type="inputType"
        :placeholder="inputPlaceholder || 'Select items...'"
        :class="{
          no_padding: inputType === 'number',
          align_me_right: nameIs('Average Order Value') && !position,
          input_error: errorMsg,
        }"
        :disabled="disabled"
        @focus="onfocus"
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
      v-show="nameIs('Average Order Value') && !position"
      class="position_me_absolute medium_text"
    >
      $
    </div>
    <transition name="fade">
      <div v-show="errorMsg" class="flex_sb error_sb">
        <p class="input_selection_error medium_text">{{ errorMsg }}</p>
      </div>
    </transition>
    <div
      v-show="
        (!nameIs('Ads Platform') || position !== 'up') &&
        isDropdownOpen &&
        !asInput &&
        !forCustom
      "
      class="dropdown-list"
      ref="mainDropdownListRef"
    >
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        class="dropdown-item"
        :class="{
          selected: searchQuery === item || disabledItem?.includes(item),
          disabled_item: disabledItems(item),
        }"
        @click.stop="itemSelectWithDisabled(item, item)"
      >
        <p class="medium_text">{{ item }}</p>
      </div>
    </div>
    <div
      v-show="
        nameIs('Ads Platform') &&
        position === 'up' &&
        isDropdownOpen &&
        !asInput &&
        !forCustom
      "
      class="dropdown-list_ads"
      ref="dropdownListSecondRef"
    >
      <div class="new_ads_title">
        <p class="medium_text">AD PLATFORM</p>
      </div>
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        class="dropdown-item_ads"
        :class="{
          selected: searchQuery === item || disabledItem?.includes(item),
          disabled_item: disabledItems(item),
        }"
        @click.stop="itemSelectWithDisabled(item, item)"
      >
        <div class="new_ads_left">
          <img class="button_icon" :src="returnImg(item)" alt="add icon" />
          <p class="medium_text">{{ item }}</p>
        </div>
        <div
          v-show="!hasTokens?.includes(item)"
          class="new_ads_right"
          @click.stop="manageConnection(item)"
        >
          <p
            class="medium_text"
            :class="{
              change_color:
                searchQuery === item || disabledItem?.includes(item),
            }"
          >
            {{ loading === item ? "Connecting..." : "Connect" }}
          </p>
          <img
            class="button_icon"
            src="../../assets/images/link.svg"
            alt="add icon"
          />
        </div>
      </div>
    </div>
    <div
      v-show="forCustom && isDropdownOpen"
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
          <li
            v-for="(itemsToLoop, category) in filteredActionItems"
            :key="category"
          >
            <label
              :for="String(category) + filterIndex"
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
              :id="String(category) + filterIndex"
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
                @click.stop="itemSelectWithDisabled(innerItem, innerItem.name)"
              >
                <p>
                  {{ innerItem.name }}
                </p>
                <div
                  class="help_icon_inner"
                  v-show="true"
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
  position: relative !important;
  width: 100% !important;

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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.error_sb {
  &.flex_sb {
    margin-top: 2px;
  }
}

.input_selection_error {
  &.medium_text {
    color: var(--Error-04-Dark, #b71e2d) !important;
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

.arrow_down {
  position: absolute !important;
  right: 12px !important;
  top: 36px !important;
  cursor: pointer !important;
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
  margin: 0 !important;

  &.no_padding {
    padding-right: 12px !important;
  }

  &.input_error {
    border-color: #b71e2d !important;
  }

  &.align_me_right {
    text-align: right;
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

.position_me_absolute {
  position: absolute;
  top: 36px;
  left: 12px;

  &.medium_text {
    width: min-content !important;
  }
}

.change_color {
  color: #00936f !important;
}

.dropdown-list,
.dropdown-list_ads {
  position: absolute !important;
  top: 106% !important;
  left: 0 !important;
  width: 100% !important;
  display: flex;
  max-height: min(27vh, 303px) !important;
  padding: var(--corner-med, 8px) 0px !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  z-index: 1 !important;
  border-radius: var(--corner-med, 8px) !important;
  border: 1px solid var(--Grey-200, #e6e7e8) !important;
  background: var(--Grey-White, #fff) !important;
  overflow-y: auto !important;
}

.dropdown-item,
.dropdown-item_ads {
  display: flex !important;
  padding: var(--corner-med, 8px) !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  align-self: stretch !important;
  border-bottom: 1px solid var(--Grey-200, #e6e7e8) !important;
  transition: background-color 0.3s ease-in-out !important;
  cursor: pointer !important;

  &:hover {
    background-color: var(--Grey-100, #e3e5e8) !important;

    /* .medium_text {
      color: var(--Grey-White, #fff) !important;
    } */
  }
  &.selected {
    background-color: var(--Primary-500-base, #08916f) !important;

    .medium_text {
      color: var(--Grey-White, #fff) !important;
    }
  }
}

.new_ads_left {
  display: flex !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
}

.new_ads_right {
  display: flex;
  min-width: 94px !important;
  height: 30px !important;
  padding: 0px var(--corner-med, 8px) !important;
  justify-content: center !important;
  align-items: center !important;
  gap: var(--corner-med, 8px) !important;
  border-radius: var(--corner-med, 8px) !important;
  background: var(--Grey-50, #f1f2f3) !important;
}

.dropdown-item_ads {
  padding: 16px var(--horizontal-padding-lg, 12px) !important;
  justify-content: space-between !important;
}

/* Rotation of the SVG */
.arrow_icon {
  transition: transform 0.3s ease-in-out !important;
}

.arrow_icon.rotate {
  transform: rotate(180deg) !important;
}

.new_ads_title {
  display: flex !important;
  padding: 5px var(--horizontal-padding-lg, 12px) !important;
  align-items: center !important;
  align-self: stretch !important;
  border-bottom: 1px solid var(--Grey-200, #e6e7e8) !important;
}

.disabled_item {
  cursor: not-allowed !important;
}

input:disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

input {
  background-color: #ffffff !important;
  opacity: 1 !important;

  transition: all 0.3s ease-in-out !important;
}

.dropdown_menu_wrapper {
  position: absolute !important;
  width: 100% !important;
  max-height: min(34vh, 248px);
  border-radius: var(--corner-med, 10px) !important;
  background: var(--Grey-White, #fff) !important;
  border: 1px solid var(--Grey-200, #e6e7e8) !important;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09) !important;
  list-style: none !important;
  margin-top: 4px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  z-index: 1 !important;

  &.align_center {
    top: 50% !important;
    transform: translate(0px, -28%) !important;
  }

  .dropdown_menu_item {
    display: flex !important;
    padding: var(--corner-med, 8px) var(--horizontal-padding-lg, 12px) !important;
    align-items: flex-start !important;
    align-self: stretch !important;
    cursor: pointer !important;
    white-space: pre-wrap !important ;

    &.action {
      display: flex !important;
      padding: 10px 14px 10px var(--horizontal-padding-lg, 12px) !important;
      justify-content: space-between !important;
      align-items: center !important;
      align-self: stretch !important;
      background: var(--Grey-100, #f6f6f6) !important;
    }

    color: var(--Grey-800, #34404b) !important;
    font-size: 14px !important;
    font-style: normal !important;
    font-weight: 400 !important;
    line-height: 20px !important; /* 142.857% */
    &:not(:last-child) {
      border-bottom: 1px solid var(--Grey-200, #e6e7e8) !important;
    }
    &.activeClass {
      color: var(--Grey-800, #fff) !important ;
      /* background: #03c191 !important !important; */
    }

    &.inner_items {
      display: flex !important;
      padding: var(--horizontal-padding-lg, 12px)
        var(--vertical-padding-lg, 24px) !important;
      align-items: center !important;
      justify-content: space-between !important;
      align-self: stretch !important;
      font-weight: 600 !important;
      line-height: 18px !important; /* 138.462% */
      transition: all 0.3s ease-in-out !important;
      &.activeClass {
        background: #03c191 !important;
        color: #fff !important;

        p {
          color: #fff !important ;
        }

        .help_icon_inner {
          img {
            filter: invert(100%) !important;
          }
        }
      }

      .help_icon_inner {
        display: flex;
        justify-content: center !important;
        align-items: center !important;
        height: 20px !important;
        transition: all 0.3s ease-in-out !important;

        img {
          height: 16px !important;
          transition: all 0.3s ease-in-out !important;
        }
      }
    }
  }

  .dropdown_menu_item:hover {
    background: #e6e7e8 !important;
  }
}

#accordion {
  display: flex !important;
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
</style>

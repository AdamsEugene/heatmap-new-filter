<script setup lang="ts">
const props = defineProps<{ onProceed: () => void; itemsInPending: boolean }>();

const onClick = () => {
  props.itemsInPending && props.onProceed();
};
</script>

<template>
  <div class="flex_sb">
    <div
      class="btn primary"
      :class="{ with_opacity: !itemsInPending }"
      @click="onClick"
    >
      <p class="btn_text">Add</p>
    </div>
  </div>
</template>

<style>
.flex_sb {
  display: flex;
  justify-content: space-between !important;
  gap: var(--corner-med, 8px) !important;
  align-items: center !important;

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
</style>

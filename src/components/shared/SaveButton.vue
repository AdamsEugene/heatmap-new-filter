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
  justify-content: space-between;
  gap: var(--corner-med, 8px);
  align-items: center;

  * {
    box-sizing: border-box;
  }
  font-family: "IBM Plex Sans";
  p,
  ul,
  li,
  h3 {
    margin: 0;
    padding: 0;
  }
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--Padding-Horizontal-padding, 6px)
    var(--Padding-Vertical-padding, 16px);
  align-items: flex-start;
  gap: 10px;
  width: max-content;
  border-radius: var(--Padding-Corner, 6px);
  background: var(--Grey-100, #f6f6f6);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  cursor: pointer;
}

.btn.border {
  border: 1.5px solid var(--Primary-03-Main, #00936f);
  background: var(--Grey-100, #ffffff);

  .btn_text {
    color: var(--Primary-600, #08916f);
  }
}

.btn.primary {
  background: var(--Primary-03-Main, #00936f);
  transition: all 0.3s ease-in-out;

  .btn_text {
    color: var(--Grey-White, #fff);
  }
}

.btn_text {
  color: var(--Grey-800, #2e3338);
  text-align: center;
  font-family: "Source Sans 3";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  text-transform: capitalize;
}

.right_btns {
  display: flex;
  align-items: center;
  gap: var(--horizontal-padding-lg, 12px);
}
</style>

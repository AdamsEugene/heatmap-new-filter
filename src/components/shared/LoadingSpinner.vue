<script setup lang="ts"></script>

<template>
  <div class="loader_wrapper">
    <div class="loader"></div>
  </div>
</template>

<style>
.loader_wrapper {
  position: absolute !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  top: 50% !important;
  right: 12px !important;
  transform: translate(-50%, -50%) !important;
  z-index: 999 !important;
  pointer-events: none !important;
  font-family: "IBM Plex Sans" !important;

  * {
    box-sizing: border-box !important;
  }
}

.loader {
  border: 4px solid #f3f3f3 !important;
  border-radius: 50% !important;
  border-top: 8px solid #d1fae691 !important;
  border-right: 8px solid #00946f91 !important;
  border-bottom: 8px solid #ff634791 !important;
  width: 40px !important;
  height: 40px !important;
  -webkit-animation: spin 1s linear infinite !important;
  animation: spin 1s linear infinite !important;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg) !important;
  }
  100% {
    -webkit-transform: rotate(360deg) !important;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg) !important;
  }
  100% {
    transform: rotate(360deg) !important;
  }
}
</style>

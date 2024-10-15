<script setup lang="ts"></script>

<template>
  <div class="loader_wrapper">
    <div class="loader"></div>
  </div>
</template>

<style>
.loader_wrapper {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  right: 12px;
  transform: translate(-50%, -50%);
  z-index: 999;
  pointer-events: none;
  font-family: "IBM Plex Sans";

  * {
    box-sizing: border-box;
  }
}

.loader {
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 8px solid #d1fae691;
  border-right: 8px solid #00946f91;
  border-bottom: 8px solid #ff634791;
  width: 40px;
  height: 40px;
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script setup>
import BaseMap from './components/OpenLayers/base.vue'
// import TestMap from './components/OpenLayers/test.vue'
import {data} from './mock/data.js'
</script>

<template>
  <!-- <TestMap /> -->
  <BaseMap :data="data"/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

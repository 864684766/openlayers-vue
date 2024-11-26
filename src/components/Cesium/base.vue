<script setup lang ="ts">
import { ref, defineEmits } from "vue";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["testEmit"]);

const localValue = ref("Initial Value");

const handleClick = () => {
  emit("testEmit", localValue.value);
};
</script>

<template>
  <div>
    <div>{{ props.message }}</div>
    <input type="text" v-model="localValue" placeholder="Enter some text" />
    <button @click="handleClick">Emit Value</button>
  </div>
</template>

<style scoped>
/* 样式内容 */
</style>

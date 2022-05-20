<template>
  <button :disabled="disabled" :type="type"><slot></slot></button>
</template>
<style lang="scss" scoped>
button {
  outline: none;
  border: none;
  width: 100px;
  height: 34px;

  cursor: pointer;

  background: #f4e041;
  border-radius: 80px;

  font-family: "Nunito";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 26px;
  color: black;

  &:hover {
    background: #ffe302;
  }
  &:disabled {
    background: #b4b4b4;
    color: rgba(255, 255, 255, 0.87);
    cursor: unset;
  }
}
</style>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "StyleButton",
  props: {
    disabled: String,
    type: String,
  },
});
</script>

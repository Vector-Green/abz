<template>
  <label>
    <input
      @input="emit"
      :value="modelValue"
      :required="required"
      :class="{ error: error }"
      :type="type"
      :name="name"
      placeholder=" "
    />
    <span :class="{ error: error }">{{ placeholder }}</span>
    <aside>{{ error }}</aside>
  </label>
</template>
<style lang="scss" scoped>
label {
  position: relative;

  input {
    width: 100%;
    padding: 10px;
    outline: none;
    border: 1px solid #d0cfcf;
    border-radius: 4px;
    background: inherit;
    &.error {
      border-color: #cb3d40;
    }
  }

  span {
    position: absolute;
    pointer-events: none;

    left: 10px;
    top: 50%;
    transform: translate(0, -50%);

    transition: 0.2s;

    font-family: "Nunito";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 26px;

    color: #7e7e7e;
  }

  input:focus + span,
  input:not(:placeholder-shown) + span {
    top: 0;

    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    &.error {
      color: #cb3d40;
    }
  }
  aside {
    position: absolute;
    pointer-events: none;

    left: 10px;
    top: 100%;
    font-family: "Nunito";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;

    color: #cb3d40;
  }
}
</style>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextInput",
  props: {
    placeholder: String,
    error: String,
    type: String,
    modelValue: String,
    required: Boolean,
    name: String,
  },
  methods: {
    emit(event: MouseEvent) {
      if (event?.target instanceof HTMLInputElement) {
        this.$emit("update:modelValue", event.target.value);
      }
    },
  },
});
</script>

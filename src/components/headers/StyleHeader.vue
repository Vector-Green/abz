<template>
  <h1><slot></slot></h1>
</template>
<style lang="scss" scoped>
h1 {
  font-family: "Nunito";
  font-style: normal;
  font-weight: 400;
  font-size: 40px;
  line-height: 40px;

  text-align: center;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "StyleHeader",
});
</script>

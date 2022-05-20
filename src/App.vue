<template>
  <NavBar></NavBar>
  <router-view />
</template>

<style lang="scss">
#app {
  min-width: 360px;
}
</style>
<script>
import { defineComponent } from "vue";
import NavBar from "@/components/NavBar.vue";
export default defineComponent({
  components: {
    NavBar,
  },
});
</script>

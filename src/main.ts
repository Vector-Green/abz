import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n";

import VueLazyLoad from "vue3-lazyload";

createApp(App)
  .use(i18n)
  .use(store)
  .use(router)
  .use(VueLazyLoad, {})
  .mount("#app");

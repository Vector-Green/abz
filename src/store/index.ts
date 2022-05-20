import { createStore } from "vuex";

interface worker {
  name: string;
  phone: number;
  email: string;
  position: string;
  fileName?: string;
}

export default createStore({
  state: {
    workers: <worker[]>[],
  },
  getters: {
    workers(state) {
      return state.workers;
    },
  },
  mutations: {
    updateWorkers(state, data) {
      state.workers = data;
    },
  },
  actions: {
    async fetchWorkers(ctx) {
      ctx.commit(
        "updateWorkers",
        await (await fetch("http://localhost:3000/workersList")).json()
      );
    },
  },
  modules: {},
});

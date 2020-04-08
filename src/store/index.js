import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewer:{},
    waterHeight: 0
  },
  mutations: {
    setViewr(state, viewer){
      state.viewer = viewer
    },
    addWaterHeight(state) {
      state.waterHeight+=1
    },
    subWaterHeight(state) {
      state.waterHeight-=1
    },
    addWaterHeightN(state, n) {
      state.waterHeight+=n
    },
    subWaterHeightN(state, n) {
      state.waterHeight-=n
    }
  }
});

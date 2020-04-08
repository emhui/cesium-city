import Vue from "vue";
import Vuex from "vuex";
// import Cesium from 'cesium/Cesium'
var Cesium = require("cesium/Cesium");
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewer: null,
    waterHeight: 0,
    pickPosition: null // 记录鼠标拾取的位置,这个坐标是屏幕坐标
  },
  mutations: {
    setViewer(state, viewer) {
      state.viewer = viewer
    },
    setPickPosition(state, pickPosition) {
      state.pickPosition = pickPosition
    },
    addWaterHeight(state) {
      state.waterHeight += 1
    },
    subWaterHeight(state) {
      state.waterHeight -= 1
    },
    addWaterHeightN(state, n) {
      state.waterHeight += n
    },
    subWaterHeightN(state, n) {
      state.waterHeight -= n
    }
  },
  getters: {
    showLongitude(state) {
      if (Cesium.defined(state.pickPosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(state.pickPosition);
        return Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
      }
      return 0
    },
    showLatitude(state) {
      if (Cesium.defined(state.pickPosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(state.pickPosition);
        return  Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
      }
      return 0
    }
  }
});

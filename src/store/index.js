import Vue from "vue";
import Vuex from "vuex";
// import Cesium from 'cesium/Cesium'
var Cesium = require("cesium/Cesium");
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewer: null,
    waterHeight: 0,
    pickPosition: null, // 记录鼠标拾取的位置,这个坐标是屏幕坐标
    valves: [], // 存储阀门数据
    rivers: [], // 存储河流数据
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
    },
    setValves(state, valves) {
      state.valves = valves
    },
    // 设置阀门的状态
    setValvesStatus(state, obj) {
      state.valves[obj.index].status = obj.checked
    },
    // 添加阀门
    addValves(state, valve) {
      state.valves.push(valve)
    },
    // 添加河流
    addRivers(state, river) {
      state.rivers.push(river)
    },
    // 添加河流
    setRivers(state, river) {
      state.rivers = river
    },
    // 设置河流的状态
    setRiversStatus(state, obj) {
      state.rivers[obj.index].status = obj.checked
    },
    updateRiversHeight(state, obj) {
      state.rivers[obj.index].height = obj.height
    },
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
        return Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
      }
      return 0
    },
    showValves(state) {
      /*       var result = [] // 存储结果
            for (let i = 0; i < state.valves; i++){
              result.push({title:`阀${i+1}`})
            }
            return result */
    }
  }
});

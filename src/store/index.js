import Vue from "vue";
import Vuex from "vuex";
import axios from "axios"
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
    selectedEntity: null, // 当前被选中的实体
    riverData: [], // 河流水位水速数据
    warningLevel: [0, 3, 5, 7, 10, 100],// 预警等级
    currentWarningLevel: 0 // 当前预警等级
  },
  mutations: {
    setViewer(state, viewer) {
      state.viewer = viewer
    },
    setPickPosition(state, pickPosition) {
      state.pickPosition = pickPosition
    },
    // 升高水位
    addWaterHeight(state) {
      // state.waterHeight += 1
      state.riverData.forEach(el => {
        el.speed.current += el.speed.curstep
        el.level.current += el.level.curstep
      })
    },
    // 降低水位
    downWaterHeight(state) {
      // state.waterHeight += 1
      state.riverData.forEach(el => {
        el.speed.current -= 0.01
        el.level.current -= 0.01
      })
    },
    // 更新河流高度，流速的步长
    // num 为当前打开了多少闸门
    updataRiverStep(state, num) {
      console.log(num);

      state.riverData.forEach(river => {
        river.level.curstep = river.level.step - 0.025 * num
        river.speed.curstep = river.speed.step - 0.025 * num
      })
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
    // 初始化河流水位水速等数据
    initRiverData(state, riverData) {
      state.riverData = riverData
    },
    // 每秒更新一次数据
    updateRiverData(state, riverData) {
      state.riverData = riverData
    },
    // 设置当前预警等级
    updateCurrentWarningLevel(state, num) {
      state.currentWarningLevel
        = state.warningLevel.findIndex(el => el > num) - 1
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
        return Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
      }
      return 0
    },
    // 展示海拔信息
    showElevation(state) {
      if (Cesium.defined(state.pickPosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(state.pickPosition);
        return cartographic.height.toFixed(2);
      }
      return 0
    },
    showCameraHeight(state) {
      if (Cesium.defined(state.pickPosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(state.pickPosition);
        return state.viewer.scene.globe.getHeight(cartographic).toFixed(2);
      }
      return 0
    },
    showHeading(state) {
      return Cesium.Math.toDegrees(state.viewer.scene.camera.heading
      ).toFixed(2);
    },
    showPitch(state) {
      return Cesium.Math.toDegrees(state.viewer.scene.camera.pitch).toFixed(
        2
      );
    },
    // 显示外河水位
    showOutlandWaterLevel(state) {
      return state.riverData[2].level.current.toFixed(2)
    },
    // 显示内河水位
    showInlandWaterLevel(state) {
      return state.riverData[1].level.current.toFixed(2)
    },
    // 获取当前预警等级,num为当前降水量
    getCurrentWarningLevel: (state) => (num) => {
      return state.warningLevel.findIndex(el => el > num) - 1
    }
  },
  actions: {
    getRiverData(context) {
      console.log("下载");

      axios.get("data/riverData.json").then(response => {

        context.commit("initRiverData", response.data)
      });
    }
  }
});

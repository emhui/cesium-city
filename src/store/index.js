import Vue from "vue";
import Vuex from "vuex";
import axios from "axios"
// import Cesium from 'cesium/Cesium'
var Cesium = require("cesium/Cesium");
Vue.use(Vuex);

const data =
  [
    {
      "name": "ouland-river",
      "speed": {
        "max": 100,
        "min": 20,
        "current": 20,
        "range": 0.1,
        "curstep": 0.1,
        "step": 0.1
      },
      "level": {
        "max": 100,
        "min": 1.35,
        "current": 1.0,
        "range": 0.1,
        "curstep": 0.08,
        "step": 0.1
      }
    },
    {
      "name": "inland-river",
      "speed": {
        "max": 100,
        "min": 30,
        "current": 20,
        "range": 0.1,
        "curstep": 0.1,
        "step": 0.1
      },
      "level": {
        "max": 100,
        "min": 1.34,
        "current": 1.5,
        "range": 0.1,
        "curstep": 0.1,
        "step": 0.1
      }
    },
    {
      "name": "canal",
      "speed": {
        "max": 100,
        "min": 20,
        "current": 15,
        "range": 0.1,
        "curstep": 0.1,
        "step": 0.1
      },
      "level": {
        "max": 100,
        "min": 1.23,
        "current": 1.3,
        "range": 0.1,
        "curstep": 0.1,
        "step": 0.1
      }
    }
  ]

export default new Vuex.Store({
  state: {
    viewer: null,
    waterHeight: 0,
    pickPosition: null, // 记录鼠标拾取的位置,这个坐标是屏幕坐标
    valves: [], // 存储阀门数据
    rivers: [], // 存储河流数据
    selectedEntity: null, // 当前被选中的实体
    // riverData: [], // 河流水位水速数据
    riverData: data, // 河流水位水速数据
    warningLevel: [0, 2, 3, 4, 5, 100],// 预警等级
    currentWarningLevel: 0, // 当前预警等级
    isAI: false, // 当前是否是智能模式
    isRain: false, // 当前是否在下雨
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
        el.speed.min += el.speed.curstep
        el.level.min += el.level.curstep
        el.speed.current = el.speed.min
        el.level.current = el.level.min
      })
    },
    // 降低水位
    downWaterHeight(state) {
      // state.waterHeight += 1
      // 降低水位 0.02
      // 降低水位 0.01
      state.riverData.forEach(el => {
        el.speed.min -= 0.02
        el.level.min -= 0.02
        el.speed.current = el.speed.min
        el.level.current = el.level.min
      })
    },
    // 降低给定值的水位
    downWaterHeightByNum(state, num) {
      // state.waterHeight += 1
      state.riverData.forEach(el => {
        el.speed.min -= num
        el.level.min -= num
        el.speed.current = el.speed.min
        el.level.current = el.level.min
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
    },
    // 是否将当前状态设置为智能预警模式
    updateAIStatus(state, checked) {
      state.isAI = checked
    },
    // 更新下雨状态
    updateRainStatus(state, checked) {
      state.isRain = checked
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
      return state.riverData[2].level.current.toFixed(3)
    },
    // 显示内河水位
    showInlandWaterLevel(state) {
      return state.riverData[1].level.current.toFixed(3)
    },
    // 获取当前预警等级,num为当前降水量
    getCurrentWarningLevel: (state) => (num) => {
      var index =  state.warningLevel.findIndex(el => el > num) - 1
      return index > 0 ? index : 0
    },
  },
  actions: {
    getRiverData(context) {
      console.log("下载");

      axios.get("./data/riverData.json").then(response => {
        console.log(response.data);

        context.commit("initRiverData", response.data)
      });
    }
  }
});

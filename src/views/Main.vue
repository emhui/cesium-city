<template>
  <div id="cesiumContainer">
    <bottom-info :viewer="viewer"></bottom-info>
    <bim-model :viewer="viewer"></bim-model>
    <river-model :viewer="viewer"></river-model>
    <rain-model :viewer="viewer"></rain-model>
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");
/* import BottomInfo from "../components/BottomInfo";
import BimModel from "../components/BIMModel"; */

// 黄鹤楼附近(114.304749,30.548843)
export default {
  data() {
    return {
      initPosition: {
        /*         latitude: 30.548843,
        longtitude: 114.304749, */
        longitude: 121.39143670453481,
        latitude: 29.99058677574627,
        height: 2630
      },
      initHeadingPitchRoll: {
        heading: 0, // 绕着z轴旋转，指向东南西北
        pitch: -30, // 俯视角，负值向下俯视 -30作用效果不错
        roll: 0 // 翻转效果
      },
      viewer: this.viewer
    };
  },
  mounted() {
    console.log("Hello, World");
    this.initViewer();
  },
  methods: {
    initViewer() {
      this.viewer = new Cesium.Viewer("cesiumContainer", {
        scene3DOnly: true,
        selectionIndicator: false,
        baseLayerPicker: false,
        timeline: false,
        animation: false
      });
      this.viewer.terrainProvider = this.addTerrain()
      this.setInitPosistion();
    },
    setTerrain() {
      this.viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true
      });
    },
    setInitPosistion() {
      var position = new Cesium.Cartesian3.fromDegrees(
        this.initPosition.longitude,
        this.initPosition.latitude,
        this.initPosition.height
      );
      var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
        this.initHeadingPitchRoll.heading,
        this.initHeadingPitchRoll.pitch,
        this.initHeadingPitchRoll.roll
      );
      var homeCameraView = {
        destination: position,
        orientation: {
          heading: initialOrientation.heading,
          pitch: initialOrientation.pitch,
          roll: initialOrientation.roll
        }
      };
      this.viewer.scene.camera.setView(homeCameraView);
    },
    addTerrain() {
      var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: this.$baseUrl + "terrain/"
      });
      return terrainProvider;
    }
  },
  components: {
    BottomInfo: () => import("../components/BottomInfo"),
    BimModel: () => import("../components/BIMModel"),
    RiverModel: () => import("../components/River"),
    RainModel: () => import("../components/Rain")
  }
};
</script>

<style lang="scss">
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.cesium-widget-credits,
.cesium-fullscreenButton {
  display: none !important;
}
</style>

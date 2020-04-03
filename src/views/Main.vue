<template>
  <div id="cesiumContainer">
    <div v-if="loaded">
      <bottom-info :viewer="viewer"></bottom-info>
      <river-model :data="data" :viewer="viewer"></river-model>
      <bim-model :data="data" :viewer="viewer"></bim-model>
      <rain-model :data="data" :viewer="viewer"></rain-model>
    </div>
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");

export default {
  data() {
    return {
      initPosition: {
        longitude: 121.39143670453481,
        latitude: 29.99058677574627,
        height: 2630
      },
      initHeadingPitchRoll: {
        heading: 0, // 绕着z轴旋转，指向东南西北
        pitch: -30, // 俯视角，负值向下俯视 -30作用效果不错
        roll: 0 // 翻转效果
      },
      viewer: this.viewer,
      loaded: false
    };
  },
  mounted() {
    var _this = this;
    this.$http.get("data/data.json").then(response => {
      _this.data = response.data;
      this.initViewer();
    });
    console.log("Hello, World");
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
      this.loaded = true
      this.viewer.terrainProvider = this.addTerrain();
      this.setInitPosistion();
      this.viewer.extend(Cesium.viewerCesiumInspectorMixin);
      // this.viewer.scene.globe.depthTestAgainstTerrain = false;
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
      let lon = this.longitude;
      let lat = this.latitude;
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        lon - 1,
        lat - 1,
        lon + 1,
        lat + 1
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
      console.log(this.data);
      var terrainProvider;
      this.data.forEach(element => {
        if (element.type === "terrain") {
          terrainProvider = new Cesium.CesiumTerrainProvider({
            url: element.url
          });
        }
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

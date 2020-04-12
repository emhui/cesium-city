<template>
  <div id="cesiumContainer">
    <div v-if="loaded">
      <bottom-info></bottom-info>
      <river-model :data="data"></river-model>
      <bim-model :data="data"></bim-model>
      <rain-model :data="data"></rain-model>
      <label-model></label-model>
      <water-level :data="data"></water-level>
      <pick-model></pick-model>
      <wander-model :data="data"></wander-model>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from "vuex";
var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  data() {
    return {
      initPosition: {
        longitude: 121.3938116,
        latitude: 29.9839426,
        height: 180
        // 763.2884569
      },
      initHeadingPitchRoll: {
        heading: 0, // 绕着z轴旋转，指向东南西北
        pitch: -30, // 俯视角，负值向下俯视 -30作用效果不错
        roll: 0 // 翻转效果
      },
      loaded: false
    };
  },
  mounted() {
    var _this = this;
    this.$http.get("data/data_location.json").then(response => {
      _this.data = response.data;
      _this.initViewer();
    });
    console.log("Hello, World");
  },
  methods: {
    ...mapMutations(["setViewer"]),
    initViewer() {
      viewer = new Cesium.Viewer("cesiumContainer", {
        scene3DOnly: true,
        selectionIndicator: false,
        baseLayerPicker: false,
        timeline: false,
        animation: false
      });
      this.loaded = true;
      viewer.terrainProvider = this.addTerrain();
      this.addImage();
      this.setInitPosistion();
      // viewer.extend(Cesium.viewerCesiumInspectorMixin);
      this.$store.state.viewer = viewer;
      // 关闭这个防止水和BIM模型被遮挡
      viewer.scene.globe.depthTestAgainstTerrain = false;
    },
    setTerrain() {
      viewer.terrainProvider = Cesium.createWorldTerrain({
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
      viewer.scene.camera.setView(homeCameraView);
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
    },
    addImage() {
      // 将默认影像（必应）更换为Google影像
      var google = new Cesium.UrlTemplateImageryProvider({
        url: "http://mt0.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}",
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 20
      });
      viewer.imageryLayers.addImageryProvider(google);
    }
  },
  components: {
    BottomInfo: () => import("../components/BottomInfo"),
    BimModel: () => import("../components/BIMModel"),
    RiverModel: () => import("../components/River"),
    RainModel: () => import("../components/Rain"),
    LabelModel: () => import("../components/Lable"),
    WaterLevel: () => import("../components/WaterLevel"),
    PickModel: () => import("../components/Pick"), // 高亮显示选中的实体
    WanderModel: () => import("../components/Wander") // 漫游飞行功能
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

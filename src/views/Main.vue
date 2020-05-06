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
      <!--       <control-panel></control-panel> -->
      <video-model :data="data"></video-model>
      <tree-component></tree-component>
      <update-data></update-data>
      <pump></pump>
      <photography :data="data"></photography>
      <river-data-pop></river-data-pop>
      <flood :data="data"></flood>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from "vuex";
import Bus from "../store/eventBus";
var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  data() {
    return {
      initPosition: {
        longitude: 121.3895441,
        latitude: 29.9837576,
        height: 260
        // 763.2884569
      },
      initHeadingPitchRoll: {
        heading: 50, // 绕着z轴旋转，指向东南西北
        pitch: -30, // 俯视角，负值向下俯视 -30作用效果不错
        roll: 0 // 翻转效果
      },
      loaded: false
    };
  },
  created() {
    // 加载河流数据
    // this.$store.dispatch("getRiverData");
  },
  mounted() {
    var _this = this;
    this.$http.get("data/data.json").then(response => {
      this.data = response.data;
      this.initViewer();
    });

    Bus.$on("back-home", checked => {
      checked && this.setInitPosistion();
    });
  },
  methods:
   {
    ...mapMutations(["setViewer"]),
    initViewer() {
      this.setToken()
      viewer = new Cesium.Viewer("cesiumContainer", {
        geocoder: false, // 屏蔽定位搜索框
        navigationHelpButton: false, // 屏蔽默认的导航帮助框
        scene3DOnly: true,
        selectionIndicator: false, // 取消点击显示的绿框
        baseLayerPicker: false,
        timeline: false,
        animation: false,
        infoBox: false // 屏蔽默认创建的infooxbo组件，使用自己的弹窗
      });
      this.setViewer(viewer);
      this.loaded = true;
      viewer.terrainProvider = this.addTerrain();
      this.addImage(); // 添加影像
      this.setInitPosistion();
      // 重写homebuttom事件
      this.setHomeButton();
      // viewer.extend(Cesium.viewerCesiumInspectorMixin);
      // this.$store.state.viewer = viewer;
      // 关闭这个防止水和BIM模型被遮挡
      viewer.scene.globe.depthTestAgainstTerrain = true;
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
      viewer.clock.shouldAnimate = true;
      viewer.scene.camera.setView(homeCameraView);
    },
    addTerrain() {
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
      this.data.forEach(element => {
        if (element.type === "image") {
          var google = new Cesium.UrlTemplateImageryProvider({
            url: element.url,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 20
          });
          viewer.imageryLayers.addImageryProvider(google);
        }
      });
    },
    setToken() {
      this.data.forEach(element => {
        if (element.type === "token") {
          Cesium.Ion.defaultAccessToken = element.value;
        }
      });
    },
    // 重新homebutton事件
    setHomeButton() {
      var _this = this;
      viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        function(e) {
          e.cancel = true;
          // viewer.zoomTo(tileset, default_HeadingPitchRange);
          _this.setInitPosistion();
        }
      );
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
    WanderModel: () => import("../components/Wander"), // 漫游飞行功能
    ControlPanel: () => import("../components/ControlPanel"),
    VideoModel: () => import("../components/Video"),
    TreeComponent: () => import("../components/Tree"),
    UpdateData: () => import("../components/UpdateData"), // 每秒更新一次数据
    Photography: () => import("../components/Photography"),
    Pump: () => import("../components/Pump"),
    RiverDataPop: () => import("../components/RiverDataPop"), // 河流水位的弹窗
    Flood: () => import("../components/Flood")
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
.cesium-fullscreenButton,
.cesium-home-button {
  display: none !important;
}
</style>

<template>
  <div class="water-level">
<!--     <div class="panel-tools">
      <div class="item">
        <input type="checkbox" name id @click="cbTerrain" />
        <label for>地形检测</label>
      </div>
    </div>
    <div class="item">
      <input type="checkbox" name id @click="showFlood" />
      <label for>洪水</label>
    </div>
    <div class="item">
      <input type="checkbox" name id @click="startFlood" />
      <label for>涨水</label>
    </div> -->
  </div>
</template>

<script>
import Bus from "../store/eventBus";
import { mapState, mapMutations } from "vuex";
var Cesium = require("cesium/Cesium");

let viewer = null;

export default {
  props: ["data"], // 存储了水位的信息
  data() {
    return {
      submergedArea: null, // 淹没地区实体
      waterLevelLabels: [], // 存储水位标签实体
      waterImage: require("../assets/water.jpg"), // 河流表面的流动照片
      // 预警图片
      warnImages: [
        require("../assets/warn-normal.png"),
        require("../assets/warn-blue.png"),
        require("../assets/warn-yellow.png"),
        require("../assets/warn-orange.png"),
        require("../assets/warn-red.png")
      ],
      // 预警等级,默认预警等级是0
      floodEntity: null, // 洪水实体
      floodInterval: null, // 洪水定时事件
      currentWarnLevel: 0,
      // waterHeight: 10,
      zmMinHeight: 0,
      zmMaxHeight: 1000,
      delayHeight: 1,
      height: 0
    };
  },
  mounted() {
    viewer = this.$store.state.viewer;
    var scene = viewer.scene;
    var _this = this;
    var kmlOptions = {
      camera: scene.camera,
      canvas: scene.canvas,
      clampToGround: true
    };
    this.data.forEach(element => {
      if (element.type === "water-level") {
        viewer.dataSources
          .add(Cesium.KmlDataSource.load(element.url, kmlOptions))
          .then(dataSources => {
            dataSources.entities.values.forEach(entity => {
              if (entity.label) {
                // 有效，可以防止被遮挡
                // entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY
                entity.label.text = "0mm";
                entity.billboard.image = this.warnImages[0];
                entity.billboard.width = 50;
                // entity.billboard.translucencyByDistance = new Cesium.NearFarScalar(1.5e2, 1.0, 2.0e2, 0.0);
                _this.waterLevelLabels.push(entity);
              } else if (entity.name === "Submerged area") {
                // 一开始加载出了不显示该区域
                entity.show = false;
                // 多边形没有这个属性
                // entity.polygon.disableDepthTestDistance = Number.POSITIVE_INFINITY;
                // entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
                entity.polygon.material = Cesium.Color.DEEPSKYBLUE.withAlpha(
                  0.5
                );

                this.floodEntity = entity;

                // this.createPrimitiveEntity(entity)
                // this.floodEntity.show = false
              }
            });
          });
      }
    });
  },
  methods: {
    createPrimitiveEntity(entity) {
      var River_Material = new Cesium.Material({
        fabric: {
          type: "Water",
          uniforms: {
            normalMap: this.waterImage,
            //this.$baseUrl + "data/water.jpg",
            frequency: 1000.0,
            animationSpeed: 0.01,
            amplitude: 10.0
          }
        }
      });
      var polygonHierarchy = entity.polygon.hierarchy;
      var positions = entity.polygon.hierarchy._value.positions;

      var polygon = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        height: 0,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      });

      var River = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: polygon
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          aboveGround: true
        }),
        show: true
      });

      River.appearance.material = River_Material;
      // River1.modelMatrix = Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray([0,0,10])) 可以，但是效果不是特别好. 最终还是选择平移矩阵

      this.floodEntity = viewer.scene.primitives.add(River);
    },
    updataWaterHeight() {
      this.waterLevelLabels.forEach(entity => {
        entity.label.text = this.waterHeight + "m";
      });
    },
    clearFloodInterval(){
      clearInterval(this.floodInterval)
      this.floodInterval = null
    },
    startFlood(e) {
      this.clearFloodInterval()
      if (e.target.checked) {
/*         this.floodInterval = setInterval(() => {
          if (this.height > this.zmMaxHeight){
            this.clearFloodInterval()
          }
          this.height += this.delayHeight
          this.updateHeight(this.floodEntity, this.height)
        }, 80); */
        var property = new Cesium.CallbackProperty(() => {
          this.height += this.delayHeight;
          if (this.zmMinHeight > this.height) {
            this.height = this.zmMinHeight;
          }
          return this.height;
        }, false);
        this.floodEntity.polygon.extrudedHeight = property;
      } else {
/*         this.floodInterval = setInterval(() => {
          if (this.height < this.zmMinHeight){
            this.clearFloodInterval()
          }
          this.height -= this.delayHeight
          this.updateHeight(this.floodEntity, this.height)
        }, 80); */
        // this.floodEntity.show = false;
        var property = new Cesium.CallbackProperty(() => {
          this.height -= this.delayHeight;
          if (this.zmMinHeight > this.heighti) {
            this.height = this.zmMinHeight;
          }
          return this.height;
        }, false);
        this.floodEntity.polygon.extrudedHeight = property;
      }
    },
    showFlood(e) {
      if (e.target.checked) {
        this.floodEntity.show = true;
      } else {
        this.floodEntity.show = false;
      }
    },
    cbTerrain(e) {
      if (e.target.checked) {
        viewer.scene.globe.depthTestAgainstTerrain = true;
      } else {
        viewer.scene.globe.depthTestAgainstTerrain = false;
      }
    },
    updateHeight(tileset, height) {
      var cartographic = Cesium.Cartographic.fromCartesian(
        tileset._boundingSpheres[0].center
      );
      var surface = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        0.0
      );
      var offset = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        height
      );
      var translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3()
      );
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }
  },
  computed: {
    ...mapState(["waterHeight"])
  },
  watch: {
    waterHeight() {
      this.waterLevelLabels.forEach(entity => {
        entity.label.text = this.waterHeight + "m";
      });
      var index = Math.floor(this.waterHeight / 10) - 1; // 10-20, 20
      if (
        index > -1 &&
        index < this.warnImages.length &&
        index != this.currentWarnLevel
      ) {
        this.currentWarnLevel = index;
        this.waterLevelLabels.forEach(entity => {
          entity.billboard.image = this.warnImages[index];
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.water-level {
  position: absolute;
  top: 5em;
  left: 18em;
  z-index: 1000;
  text-align: left;
  color: #fff;
}
</style>
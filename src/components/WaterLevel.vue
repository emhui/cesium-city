<template>
  <div class="water-level"></div>
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
    this.addWaterLabel();
    Bus.$on("update-river-data", () => {
      this.waterLevelLabels[0].label.text = `水位: ${this.riverData[0].level.current.toFixed(
        2
      )}m\n流速: ${this.riverData[0].speed.current.toFixed(2)} m²/s`;
      this.waterLevelLabels[1].label.text = `水位: ${this.riverData[1].level.current.toFixed(
        2
      )}m\n流速: ${this.riverData[1].speed.current.toFixed(2)} m²/s`;
      this.waterLevelLabels[2].label.text = `水位: ${this.riverData[2].level.current.toFixed(
        2
      )}m\n流速: ${this.riverData[2].speed.current.toFixed(2)} m²/s`;
    });
  },
  methods: {
    addWaterLabel() {
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
                  console.log(entity);

                  entity.label.font = "10px sans-serif";
                  entity.label.text = "水位:10.00m\n流速: 10 m/s";
                  entity.billboard.image = this.warnImages[0];
                  entity.billboard.width = 40;
                  _this.waterLevelLabels.push(entity);
                } else if (entity.name === "Submerged area") {
                  // 一开始加载出了不显示该区域
                  entity.show = false;
                  entity.polygon.material = Cesium.Color.DEEPSKYBLUE.withAlpha(
                    0.5
                  );

                  this.floodEntity = entity;
                }
              });
            });
        }
      });
    },
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
    clearFloodInterval() {
      clearInterval(this.floodInterval);
      this.floodInterval = null;
    },
    startFlood(e) {
      this.clearFloodInterval();
      if (e.target.checked) {
        var property = new Cesium.CallbackProperty(() => {
          this.height += this.delayHeight;
          if (this.zmMinHeight > this.height) {
            this.height = this.zmMinHeight;
          }
          return this.height;
        }, false);
        this.floodEntity.polygon.extrudedHeight = property;
      } else {
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
    ...mapState(["waterHeight", "riverData"])
  },
  watch: {
    waterHeight() {
      this.waterLevelLabels.forEach(entity => {
        entity.label.text =
          this.waterHeight + "m \n" + (this.waterHeight + 0.02) + "m";
        entity.label.text = `水位:${this.waterHeight}m \n流速: ${this.waterHeight}m/s`;
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

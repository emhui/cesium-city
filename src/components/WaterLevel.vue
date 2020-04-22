<template>
  <div class="water-level"></div>
</template>

<script>
import Bus from "../store/eventBus";
import { mapState, mapMutations, mapGetters } from "vuex";
var Cesium = require("cesium/Cesium");

let viewer = null;

export default {
  props: ["data"], // 存储了水位的信息
  data() {
    return {
      submergedArea: null, // 淹没地区实体
      waterLevelLabels: [], // 存储水位标签实体
      othersRiver: [], // 储存其他不相关的标签
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
    var _this = this;
    Bus.$on("hide-others-river", () => {
      _this.othersRiver.forEach(river=>{
        river.show = false
      })
    })
    Bus.$on("show-others-river", () => {
      _this.othersRiver.forEach(river=>{
        river.show = true
      })
    })
    Bus.$on("update-river-data", () => {
      // 处理预警

      // 处于智能预警状态则会自动开关门
      if (_this.isAI) {
        Bus.$emit(
          "auto-open-gate",
          _this.getCurrentWarningLevel(_this.riverData[1].level.current)
        );
      }

      // 更新标签
      _this.waterLevelLabels.forEach((entity, index, arrays) => {
        // 实时更新内外河和水渠的水位
        var data = _this.riverData[index];
        Bus.$emit(
          "update-river-height",
          index,
          parseFloat(data.level.current.toFixed(2)) / 4
        );
        // 获取各个河流的预警等级
        var warnIndex = _this.getCurrentWarningLevel(
          parseFloat(data.level.current)
        );
        entity.billboard.image = _this.warnImages[warnIndex];
        entity.label.text = `水位: ${parseFloat(data.level.current).toFixed(
          2
        )}m\n流速: ${parseFloat(data.speed.current).toFixed(2)} m³/s`;
      });

      // 更新其他不相关河流的水位信息
      _this.othersRiver.forEach((entity, index, arrays) => {
        // 实时更新内外河和水渠的水位
        // 获取各个河流的预警等级
        var data = _this.riverData[index];
        var warnIndex = _this.getCurrentWarningLevel(
          parseFloat(data.level.current)
        );
        entity.billboard.image = _this.warnImages[warnIndex];
        entity.label.text = `水位: ${parseFloat(data.level.current).toFixed(
          2
        )}m\n流速: ${parseFloat(data.speed.current).toFixed(2)} m³/s`;
      });
    });
  },
  methods: {
    ...mapMutations(["updateCurrentWarningLevel"]),
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
                  entity.label.font = "10px sans-serif";
                  entity.label.fillColor = Cesium.Color.LIGHTYELLOW;
                  entity.label.text = "水位:1.35m\n流速: 10 m³/s";
                  entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY
                  entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY
/*                   entity.label.heightReference = */
/*                     Cesium.HeightReference.CLAMP_TO_GROUND;
                  entity.billboard.heightReference =
                    Cesium.HeightReference.CLAMP_TO_GROUND; */
                  entity.billboard.image = this.warnImages[0];
                  entity.billboard.width = 40;
                  // 存储非主要河流
                  if (entity.name.startsWith("other")) {
                    entity.show = false
                    _this.othersRiver.push(entity);
                  } else {
                    _this.waterLevelLabels.push(entity);
                  }
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
    ...mapState(["waterHeight", "riverData", "isAI"]),
    ...mapGetters(["getCurrentWarningLevel"])
  },
  watch: {
    waterHeight() {
      this.waterLevelLabels.forEach(entity => {
        entity.label.text =
          this.waterHeight + "m \n" + (this.waterHeight + 0.02) + "m";
        entity.label.text = `水位:${this.waterHeight}m \n流速: ${this.waterHeight}m³/s`;
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

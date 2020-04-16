<template>
  <div id="river-model">
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Bus from "../store/eventBus";

var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  props: ["data"],
  data() {
    return {
      defaultHeight: 0,
      minHeight: 0,
      maxHeight: 5,
      delayHeight: 0.5,
      rivers: [
        // 存储上流和下流水流区域
        {
          name: "下游",
          mark: "ID_00002", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          status: false, // 河流的状态，false为正常状态，true为涨水状态
          interval: null, // 计时事件，记录水面升高和降低
          enableControl: true // 是否控制这条河流的变化
        },
        /*         {
          mark: "ID_00003", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          interval: null, // 计时事件，记录水面升高和降低
          enableControl : false // 是否控制这条河流的变化
        }, */
        {
          name: "上游",
          mark: "ID_00004", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          status: false, // 河流的状态，false为正常状态，true为涨水状态
          interval: null, // 计时事件，记录水面升高和降低
          enableControl: true // 是否控制这条河流的变化
        }
        /*         {
          mark: "ID_00005", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          interval: null, // 计时事件，记录水面升高和降低
          enableControl : false // 是否控制这条河流的变化
        },
        {
          mark: "ID_00006", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          interval: null, // 计时事件，记录水面升高和降低
          enableControl : false // 是否控制这条河流的变化
        },
        {
          mark: "ID_00007", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          interval: null, // 计时事件，记录水面升高和降低
          enableControl : false // 是否控制这条河流的变化
        },
        {
          mark: "ID_00008", // 由于不知道河流的具体名称，因此使用mark进行匹配
          entity: null,
          height: 0, // 当前水的高度
          interval: null, // 计时事件，记录水面升高和降低
          enableControl : false // 是否控制这条河流的变化
        } */
      ],
      waterImage: require("../assets/water.jpg")
    };
  },
  mounted() {
    this.addRiver();

    // 监听上升下降事件
    Bus.$on("update-river-height", (index, height) => {
      this.updateHeight(this.rivers[index].entity, height);
    });
    Bus.$on("rise-river", (checked, index) => {
      if (checked) {
        this.up(index);
      } else {
        this.down(index);
      }
    });
    Bus.$on("show-hide-cijiang", checked => {
      this.rivers.forEach(el => {
        el.entity.show = checked
      })
    })
  },
  methods: {
    addRiver() {
      viewer = this.$store.state.viewer;
      var scene = viewer.scene;

      var kmlOptions = {
        camera: scene.camera,
        canvas: scene.canvas,
        clampToGround: true
      };
      // 河流表面材质，绘制流动效果关键
      var River_Material = new Cesium.Material({
        fabric: {
          type: "Water",
          uniforms: {
            normalMap: this.waterImage,
            //this.$baseUrl + "data/water.jpg",
            frequency: 1000.0,
            animationSpeed: 0.02,
            amplitude: 10.0
          }
        }
      });

      this.data.forEach(element => {
        if (element.type === "river") {
          this.addPrimitiveRiver(element.url, kmlOptions, River_Material);
/*           viewer.dataSources.add(
            Cesium.KmlDataSource.load(element.url, kmlOptions)
          ); */
        }
      });
    },
    // 使用primitive绘制河流。这种河流有动画效果
    addPrimitiveRiver(url, kmlOptions, material) {
      var _this = this;
      // 加载数据
      var geocachePromise = Cesium.KmlDataSource.load(url, kmlOptions);

      geocachePromise.then(dataSource => {
        // 加载成功后，开始渲染水面
        dataSource.entities.values.forEach(entity => {
          if (entity.polygon) {
            var polygonHierarchy = entity.polygon.hierarchy;
            var positions = entity.polygon.hierarchy._value.positions;

            var polygon = new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(positions),
              /*               extrudedHeight: 10, */
              height: 0,
              vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
              //  heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND,
            });

            var River = new Cesium.Primitive({
              geometryInstances: new Cesium.GeometryInstance({
                geometry: polygon
              }),
              appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: true,
                flat: true
              }),
              show: true
            });

            River.appearance.material = material;
            // River1.modelMatrix = Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray([0,0,10])) 可以，但是效果不是特别好. 最终还是选择平移矩阵

            viewer.scene.primitives.add(River);

            _this.rivers.forEach(river => {
              if (entity.id.startsWith(river.mark)) {
                river.entity = River;
                _this.setRivers(_this.rivers);
              }
            });
          }
        });
      });
    },
    showRiver(e, index) {
      if (e.target.checked) {
        this.rivers[index].entity.show = true;
      } else {
        this.rivers[index].entity.show = false;
      }
    },
    clearRiverInterval(river) {
      clearInterval(river.interval);
      river.interval = null;
    },
    // 水位上升
    up(index) {
      var river = this.rivers[index];
      // console.log(river);
      this.clearRiverInterval(river);
      river.interval = setInterval(() => {
        if (river.height >= this.maxHeight) {
          this.clearRiverInterval(river);
          return;
        }
        river.height += this.delayHeight;
        this.updateHeight(river.entity, river.height);
      }, 80);
    },
    // 水位下降
    down(index) {
      var river = this.rivers[index];
      this.clearRiverInterval(river);
      river.interval = setInterval(() => {
        if (river.height <= this.minHeight) {
          this.clearRiverInterval(river);
          return;
        }
        river.height -= this.delayHeight;
        this.updateHeight(river.entity, river.height);
      }, 80);
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
    },
    ...mapMutations(["addRivers", "setRivers", "updateRiversHeight"])
  },
  computed: {
    ...mapState(["waterHeight"])
  },
  watch: {
    waterHeight() {
      this.rivers.forEach(river => {
        this.updateHeight(river.entity, this.waterHeight / 10);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
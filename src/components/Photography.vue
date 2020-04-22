<template>
  <div>
  </div>
</template>

<script>
import Bus from "../store/eventBus";

var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  props: ["data"],
  data() {
    return {
      tilesets: [] // 添加倾斜摄影
    };
  },
  mounted() {
    var _this = this
    viewer = this.$store.state.viewer;
    this.addPhotography();
    Bus.$on("show-hide-photography", checked => {
      viewer.flyTo(_this.tilesets[0],{
          offset: {
            heading: Cesium.Math.toRadians(28.0),
            pitch: Cesium.Math.toRadians(-25),
            range: 0
          }
        })
      _this.tilesets.forEach(tileset => {
        tileset.show = checked;
      });
    });
  },
  methods: {
    fly() {
      viewer.zoomTo(this.photo);
    },
    addPhotography() {
      var _this = this;
      this.data.forEach(element => {
        if (element.type === "photography") {
          var photo = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
              url: element.url,
              show: false
            })
          );
          _this.tilesets.push(photo);
        }
      });
    },
/*     modifyHeight() {
      var boundingSphere = this.tileset.boundingSphere; // 获取模型的边界范围
      var cartographic = Cesium.Cartographic.fromCartesian(
        boundingSphere.center
      );

      var surface = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        0.0
      ); // 模型的经纬度+0高度坐标转乘笛卡尔坐标
      var offset = Cesium.Cartesian3.fromDegrees(
        cartographic.longitude,
        cartographic.latitude,
        this.defaultHeight
      );

      var translation = Cesium.Cartesian3.subtract(
        offset,
        surface,
        new Cesium.Cartesian3()
      ); // 计算两个笛卡尔坐标之间的差值

      this.tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation); // 从一个笛卡尔坐标创建一个matrix4的实例
    } */
  }
};
</script>

<style>
</style>
<template>
  <div>
    <button @click="fly" style="z-index:1000">飞行</button>
  </div>
</template>

<script>
import Bus from "../store/eventBus";

var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  props: ["data"],
  mounted() {
    viewer = this.$store.state.viewer;
    this.addPhotography();
  },
  methods: {
    fly() {
        console.log("飞行");
        console.log(this.photo);
        
      viewer.zoomTo(this.photo);
    },
    addPhotography() {
      this.data.forEach(element => {
        if (element.type === "photography") {
          this.photo = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
              url: element.url
            })
          );
        }
      });
    },
    modifyHeight() {
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
    }
  }
};
</script>

<style>
</style>
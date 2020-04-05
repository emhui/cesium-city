<template>
  <div class="bim-model">
    <div class="backdrop" id="menu">
      <h2>闸站</h2>
      <div class="nowrap">
        <input type="button" value="开闸门" @click="openZM()" />
        <input type="button" value="关闸门" @click="closeZM()" />
      </div>
      <br />
      <div class="nowrap">
        <input type="button" value="飞行至" @click="flyZM()" />
      </div>
      <br />
    </div>
    <div id="loadingIndicator" class="cover">
      <div id="loadingIcon" class="loadingIndicator"></div>
    </div>
  </div>
</template>

<script>
// import Cesium from "cesium/Cesium";
import {ZMPositions} from "../utils/zmPosition"

var Cesium = require("cesium/Cesium");

let viewer = null
export default {
  props: ["data"],
  data() {
    return {
      modelPosition: {
        longitude: 121.3939949,
        latitude: 29.986037,
        height: 10
      },
      defaultHeight: 0,
      zmMinHeight: 6,
      zmMaxHeight: 11,
      delayHeight: 1,
      currentHeight: 16,
      // 改用json文件加载进来
      zmPositions: [
        121.39856755800847,
        29.98381214286895,

        121.39875261565491,
        29.983796556526247,

        121.39875171918382,
        29.983886677955606,

        121.39857453012864,
        29.983886707049102
      ]
    };
  },
  mounted() {
    this.addBIM();
    this.tileset.readyPromise.then(tileset => {
      // this.modifyHeight();
      this.createZM();
      // this.addColor()
    });
  },
  methods: {
    addBIM() {
      viewer = this.$store.state.viewer
      this.data.forEach(element => {
        if (element.type === "3dtileset") {
          this.tileset = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
              url: element.url
            })
          );
        }
      })
    },
    addColor() {
      var defaultStyle = new Cesium.Cesium3DTileStyle({
        color: "color('white')",
        show: true
      });
      this.tileset.style = defaultStyle;
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
    },
    createZM() {
      viewer = this.$store.state.viewer
      this.zm = viewer.entities.add({
        polygon: {
          // hierarchy 定义多边形的结构
          hierarchy: Cesium.Cartesian3.fromDegreesArray(this.zmPositions),
          height: this.zmMinHeight,
          extrudedHeight: this.zmMaxHeight,
          material: Cesium.Color.fromBytes(203, 203, 203),
          outline: false,
          outlineColor: Cesium.Color.BLACK
        }
      });
    },
    openZM() {
      var property = new Cesium.CallbackProperty(() => {
        this.currentHeight += this.delayHeight;
        if (this.currentHeight > this.zmMaxHeight) {
          this.currentHeight = this.zmMaxHeight;
        }
        return this.currentHeight;
      }, false);
      this.zm.polygon.height = property;
    },
    closeZM() {
      var property = new Cesium.CallbackProperty(() => {
        this.currentHeight -= this.delayHeight;
        if (this.zmMinHeight > this.currentHeight) {
          this.currentHeight = this.zmMinHeight;
        }
        return this.currentHeight;
      }, false);
      this.zm.polygon.height = property;
    },
    flyZM() {
      viewer = this.$store.state.viewer
      viewer.flyTo(this.tileset);
      /*       this.viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(121.3939949, 29.986037,2000)
      }) */
    }
  }
};
</script>

<style lang="scss" scoped>
.backdrop {
  display: inline-block;
  background: rgba(42, 42, 42, 0.7);
  border-radius: 5px;
  border: 1px solid #444;
  padding: 5px 10px;
  color: #fff;
  line-height: 150%;
  font-size: small;
  z-index: 1000;
}

#heightSliderLabel,
#heightValue {
  vertical-align: top;
}

.backdrop a:link,
.backdrop a:visited,
.backdrop a:hover {
  color: #fff;
}

.loadingIndicator {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -33px;
  margin-left: -33px;
  width: 66px;
  height: 66px;
  background: url(../assets/ajax-loader.gif) center no-repeat;
}

.cover {
  display: none;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.75);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

#menu {
  position: absolute;
  left: 10px;
  top: 10px;
}

.nowrap {
  margin-top: 1em;
  white-space: nowrap;
}

/* html, body, #cesiumContainer {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: sans-serif;
    background: #000;
}

button.cesium-infoBox-camera {
    display: none;
}

#3DTiles {
    padding-top: 10px;
}
 */
</style>
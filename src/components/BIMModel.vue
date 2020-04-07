<template>
  <div class="bim-model">
    <div class="backdrop" id="menu" v-show="valveList.length">
      <h2>闸站</h2>
      <div class="nowrap" v-for="(item, index) in valveList">
        <label for>{{item.entity.name}}</label>
        <input type="button" value="开闸门" @click="openZM(index)" />
        <input type="button" value="关闸门" @click="closeZM(index)" />
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
import { ZMPositions } from "../utils/zmPosition";
import { mapState, mapMutations } from "vuex";

var Cesium = require("cesium/Cesium");

let viewer = null;
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
      zmMinHeight: 0,
      zmMaxHeight: 16,
      delayHeight: 1,
      valveList: []
    };
  },
  mounted() {
    this.addBIM();
    this.tileset.readyPromise.then(tileset => {
      this.createZM();
    });
  },
  methods: {
    addBIM() {
      viewer = this.$store.state.viewer;
      this.data.forEach(element => {
        if (element.type === "3dtileset") {
          this.tileset = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
              url: element.url
            })
          );
        }
      });
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
      viewer = this.$store.state.viewer;
      var scene = viewer.scene;
      var _this = this;
      var kmlOptions = {
        camera: scene.camera,
        canvas: scene.canvas,
        clampToGround: true
      };
      this.data.forEach(element => {
        if (element.type === "valve") {
          viewer.dataSources
            .add(Cesium.KmlDataSource.load(element.url, kmlOptions))
            .then(dataSources => {
              dataSources.entities.values.forEach(entity => {
                if (entity.polygon) {
                  console.log(entity);
                  let obj = {
                    entity: entity, // 阀门实体对象
                    status: false, // 阀门状态，默认是关闭
                    currentHeight: 0 // 阀门当前升起高度，默认是0
                  };
                  _this.valveList.push(obj);
                  // _this.currentHeight.push(0);
                  entity.polygon.extrudedHeight = _this.zmMaxHeight;
                }
              });
            });
        }
      });
    },
    openZM(index) {
      var valve = this.valveList[index];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight += this.delayHeight;
        if (valve.currentHeight > this.zmMaxHeight) {
          valve.currentHeight = this.zmMaxHeight;
        }
        return valve.currentHeight;
      }, false);
      valve.status = true;
      valve.entity.polygon.height = property;
    },
    closeZM(index) {
      var valve = this.valveList[index];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight -= this.delayHeight;
        if (this.zmMinHeight > valve.currentHeight) {
          valve.currentHeight = this.zmMinHeight;
        }
        valve.status = false;
        return valve.currentHeight;
      }, false);
      valve.entity.polygon.height = property;
    },
    flyZM() {
      viewer = this.$store.state.viewer;
      viewer.flyTo(this.tileset);
    }
  },
  computed: {
    ...mapState(["waterHeight"])
  },
  watch: {
    waterHeight(){
      var index = Math.floor(this.waterHeight/10) - 1
      if( index < this.valveList.length && index > 0){
        if (!this.valveList[index].status){
          this.openZM(index)
        }
      }
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
  left: 2em;
  top: 10px;
}

.nowrap {
  margin-top: 1em;
  white-space: nowrap;
}

button.cesium-infoBox-camera {
  display: none;
}

#3DTiles {
  padding-top: 10px;
}
</style>
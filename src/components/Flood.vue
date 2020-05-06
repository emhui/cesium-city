<template>
  <div class="flood">
    <a-card
      ref="card"
      class="card"
      v-show="showDashBorard"
      :style="{left: toolsDiv.left, top: toolsDiv.top, width: toolsDiv.width}"
      size="small"
    >
      <a slot="extra" @click="close">x</a>
      <h2 slot="title" @mousedown="mousedown">#内涝分析</h2>

      <template class="ant-card-actions" slot="actions">
        <a-checkbox @change="onStartFlood">开启洪涝</a-checkbox>
        <a-button size="small" @click="btnReset">重置</a-button>
      </template>
      <template class="ant-card-actions" >
          <p>当前水高：{{currentHeight}}m</p>
      </template>
    </a-card>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Bus from "../store/eventBus";
var Cesium = require("cesium/Cesium");

let viewer;

export default {
  props: ["data"],
  data() {
    return {
      showDashBorard: false,
      toolsDiv: {
        left: "200px",
        top: "4em",
        width: "220px"
      },
      maxHeight: 1000,
      minHeight: 0,
      currentHeight: 0,
      delayHeight: 1
    };
  },
  mounted() {
    this.addFloodEntity();
    // 展示控制面板
    Bus.$on("show-flood-dashborard", checked => {
      console.log("sss");
      this.showDashBorard = checked;
    });
  },
  methods: {
    addFloodEntity() {
      viewer = this.$store.state.viewer;
      var scene = viewer.scene;

      var kmlOptions = {
        camera: scene.camera,
        canvas: scene.canvas,
        clampToGround: false
      };

      var _this = this;
      this.data.forEach(element => {
        if (element.type === "flood") {
          // this.addPrimitiveRiver(element.url, kmlOptions, River_Material);
          viewer.dataSources
            .add(Cesium.KmlDataSource.load(element.url, kmlOptions))
            .then(dataSources => {
              dataSources.entities.values.forEach(entity => {
                // entity.show = false;
                if (entity.name === "flood") {
                  // 设置实体颜色
                  entity.polygon.outline = false; // 取消显示边框
                  entity.polygon.material = Cesium.Color.fromBytes(
                    26,
                    102,
                    134,
                    200
                  ); // 设置河水的颜色
                  entity.polygon.height = this.minHeight;
                  entity.polygon.extrudedHeight = this.minHeight;
                  this.floodEntity = entity;
                }
              });
            });
        }
      });
    },
    addHeight() {
      var property = new Cesium.CallbackProperty(() => {
        this.currentHeight += this.delayHeight;
        if (this.currentHeight > this.maxHeight) {
          this.currentHeight = this.maxHeight;
        }
        return this.currentHeight;
      }, false);

      this.floodEntity.polygon.extrudedHeight = property;
    },
    onStartFlood(e) {
      var checked = e.target.checked;
      console.log(checked);

      checked && this.addHeight();
    },
    btnReset() {
      this.currentHeight = this.minHeight;
      this.floodEntity.polygon.extrudedHeight = this.minHeight;
    },
    close() {
      this.showDashBorard = false;
    },
    mousedown(event) {
      this.selectElement = this.$refs.card.$el;
      var div1 = this.selectElement;
      this.selectElement.style.cursor = "move";
      this.isDowm = true;
      var distanceX = event.clientX - this.selectElement.offsetLeft; // 鼠标相对于
      var distanceY = event.clientY - this.selectElement.offsetTop;
      document.onmousemove = function(ev) {
        var oevent = ev || event;
        div1.style.left = oevent.clientX - distanceX + "px";
        div1.style.top = oevent.clientY - distanceY + "px";
      };
      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
        div1.style.cursor = "default";
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  position: absolute;
  z-index: 1000;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  text-align: left;
}
</style>>
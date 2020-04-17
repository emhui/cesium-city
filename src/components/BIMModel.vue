<template>
  <div class="layout">
    <a-card
      ref="card"
      class="card"
      v-show="show"
      :style="{left: toolsDiv.left, top: toolsDiv.top, width: toolsDiv.width}"
      size="small"
    >
      <a slot="extra" @click="hide">x</a>
      <h2 slot="title" @mousedown="mousedown">{{selectedIndex + 1}}#闸门</h2>

      <p>实际闸高： {{ showHeight }}m</p>
      <p>外河水位： {{ showWaterLevel}}m</p>
      <p>闸门状态： {{showStatus}}</p>
      <p>控制模式： 自动</p>
      <template class="ant-card-actions" slot="actions">
        <a-button @click="openGate">提升</a-button>
        <a-button @click="closeGate">降落</a-button>
        <a-button @click="stopGate">停止</a-button>
      </template>
    </a-card>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from "vuex";
import Bus from "../store/eventBus";

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
      zmMaxHeight: 8,
      delayHeight: 0.1,
      valveList: [],
      selectedIndex: 0, // 当前被选中的闸门编号
      // selectedStatue: -1, // 当前被选闸门状态
      // selectedHeight: 0, // 当前被选中闸门高度
      title: "标题",
      selectElement: "",
      show: false,
      toolsDiv: {
        left: "200px",
        top: "40px",
        width: "220px"
      }
    };
  },
  mounted() {
    viewer = this.$store.state.viewer;
    this.addBIM();
    this.tileset.readyPromise.then(tileset => {
      this.createZM();
    });
    // 监听控制面板发送过来的点击事件
    Bus.$on("update-valve", (checked, index) => {
      if (checked) {
        this.openZM(index);
      } else {
        this.closeZM(index);
      }
    });
    Bus.$on("move-to-gate", checked => {
      
      checked &&
        viewer.flyTo(this.valveList[1].entity, {
          offset: {
            heading: Cesium.Math.toRadians(90.0),
            pitch: Cesium.Math.toRadians(-25),
            range: 100
          }
        });
    });
    // 选中实体事件
    Bus.$on("selected-entity", () => {
      var index = this.valveList.findIndex(
        valve => valve.entity.name === viewer.selectedEntity.name
      );

      this.selectedIndex = index;
      this.selectedStatue = this.valveList[index].status;
      this.selectedHeight = this.valveList[index].currentHeight;
      console.log(this.selectedHeight, this.valveList[index]);

      this.show = true;
    });

    Bus.$on("show-hide-model", checked => {
      this.tileset.show = checked;
    });
  },
  methods: {
    addBIM() {
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
                  entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
                  let obj = {
                    entity: entity, // 阀门实体对象
                    status: -1, // 阀门状态，-1是关闭，0是暂停，1是开启
                    currentHeight: 0 // 阀门当前升起高度，默认是0
                  };
                  _this.valveList.push(obj);
                  _this.addValves(obj);
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
      valve.entity.polygon.height = property;
    },
    closeZM(index) {
      var valve = this.valveList[index];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight -= this.delayHeight;
        if (this.zmMinHeight > valve.currentHeight) {
          valve.currentHeight = this.zmMinHeight;
        }
        return valve.currentHeight;
      }, false);
      valve.entity.polygon.height = property;
    },
    openGate() {
      var valve = this.valveList[this.selectedIndex];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight += this.delayHeight;
        if (valve.currentHeight > this.zmMaxHeight) {
          valve.currentHeight = this.zmMaxHeight;
        }
        return valve.currentHeight;
      }, false);
      // this.selectedStatue = 1;
      valve.status = 1;
      this.selectedHeight = this.zmMaxHeight; // 这里如果直接设置为valve.currentHight则会出现问题。因为该值在property中一直变化，所以无法记录他的值。只能将它设置为最大值
      valve.entity.polygon.height = property;
    },
    closeGate() {
      var valve = this.valveList[this.selectedIndex];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight -= this.delayHeight;
        if (this.zmMinHeight > valve.currentHeight) {
          valve.currentHeight = this.zmMinHeight;
        }
        return valve.currentHeight;
      }, false);
      // this.selectedStatue = -1;
      valve.status = -1;
      this.selectedHeight = this.zmMinHeight;
      valve.entity.polygon.height = property;
    },
    stopGate() {
      var valve = this.valveList[this.selectedIndex];
      var property = new Cesium.CallbackProperty(() => {
        return valve.currentHeight;
      }, false);
      // this.selectedStatue = 0;
      valve.status = 0;
      valve.entity.polygon.height = property;
    },
    flyZM() {
      viewer = this.$store.state.viewer;
      viewer.flyTo(this.tileset);
    },
    hide() {
      this.show = false;
    },
    mousedown(event) {
      // this.selectElement = document.getElementById("card");
      this.selectElement = this.$refs.card.$el;
      var div1 = this.selectElement;
      this.selectElement.style.cursor = "move";
      this.isDowm = true;
      var distanceX = event.clientX - this.selectElement.offsetLeft; // 鼠标相对于
      var distanceY = event.clientY - this.selectElement.offsetTop;
      // alert(distanceX)
      // alert(distanceY)
      console.log(distanceX);
      console.log(distanceY);
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
    },
    ...mapMutations(["addValves", "setValvesStatus"])
  },
  computed: {
    ...mapState(["waterHeight", "valves"]),
    ...mapGetters(["showWaterLevel"]),
    showHeight() {
      try {
        return this.valveList[this.selectedIndex].currentHeight.toFixed(2);
      } catch (error) {
        return 0;
      }
    },
    showStatus() {
      try {
        var value = this.valveList[this.selectedIndex].status;
        if (value === -1) {
          return "关闭";
        } else if (value === 0) {
          return "暂停";
        } else {
          return "开启";
        }
      } catch (error) {
        return "关闭";
      }
    }
  },
  /*   filters: {
    showStatus(value) {
      if (value === -1) {
        return "关闭";
      } else if (value === 0) {
        return "暂停";
      } else {
        return "开启";
      }
    }
  }, */
  watch: {
    waterHeight() {
      var index = Math.floor(this.waterHeight / 10) - 1;
      if (index < this.valveList.length && index > -1) {
        if (this.valveList[index].status === -1) {
          this.openZM(index);
          this.setValvesStatus({ index: index, checked: true });
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.layout {
  position: absolute;
  width: 220px;
  z-index: 1000;
}

.card {
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  text-align: left;
}
</style>
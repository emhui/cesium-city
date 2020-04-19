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
      <p>外河水位： {{ showOutlandWaterLevel}}m</p>
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
      zmMaxHeight: 6.5,
      delayHeight: 0.2,
      valveList: [],
      bims: [], // 存储bim模型
      selectedIndex: 0, // 当前被选中的闸门编号
      // selectedStatue: -1, // 当前被选闸门状态
      // selectedHeight: 0, // 当前被选中闸门高度
      title: "标题",
      selectElement: "",
      show: false,
      toolsDiv: {
        left: "200px",
        top: "4em",
        width: "220px"
      }
    };
  },
  mounted() {
    viewer = this.$store.state.viewer;
    var _this = this;
    this.addBIM();
    /*     this.tileset.readyPromise.then(tileset => { */
    this.createZM();
    /*     }); */
    // 监听控制面板发送过来的点击事件
    Bus.$on("update-valve", (checked, index) => {
      if (checked) {
        _this.openZM(index);
      } else {
        _this.closeZM(index);
      }
    });
    Bus.$on("move-to-gate", checked => {
      checked &&
        viewer.flyTo(_this.valveList[1].entity, {
          offset: {
            heading: Cesium.Math.toRadians(90.0),
            pitch: Cesium.Math.toRadians(-25),
            range: 100
          }
        });
    });
    Bus.$on("move-to-support-gate", checked => {
      checked &&
        viewer.flyTo(_this.bims[2], {
          offset: {
            heading: Cesium.Math.toRadians(28.0),
            pitch: Cesium.Math.toRadians(-15),
            range: 80
          }
        });
    });
    Bus.$on("move-to-pump", checked => {
      if (checked) {
        viewer.flyTo(_this.bims[1], {
          offset: {
            heading: Cesium.Math.toRadians(100.0),
            pitch: Cesium.Math.toRadians(-10),
            range: 0
          }
        });
      }
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
      this.bims.forEach(bim => {
        bim.show = checked;
      });
    });

    Bus.$on("auto-open-gate", index => {
      index--;
      try {
        if (this.valveList[index].status === -1 && index !== -1) {
          this.$message.warning(
            `达到${index + 1}预警,正在开启${index + 1}号闸门`
          );
          this.autoOpenGate(index);
          this.setValvesStatus({ index: index, checked: true });
        }
      } catch (error) {}
    });
    // 由目录树打开闸门的控制面板
    Bus.$on("show-gate-panel", (checked, index) => {
      this.show = checked;
      checked && (this.selectedIndex = index);
    });
  },
  methods: {
    addBIM() {
      this.data.forEach(element => {
        if (element.type === "3dtileset") {
          var bim = viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
              url: element.url
            })
          );
        }
        this.bims.push(bim);
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
        canvas: scene.canvas
      };
      this.data.forEach(element => {
        if (element.type === "valve") {
          viewer.dataSources
            .add(Cesium.KmlDataSource.load(element.url, kmlOptions))
            .then(dataSources => {
              dataSources.entities.values.forEach(entity => {
                console.log(entity);
                if (entity.polygon) {
                  // entity.polygon.heightReference =
                  // Cesium.HeightReference.CLAMP_TO_GROUND;
                  // entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
                  var name = entity.name;
                  var maxHeight = _this.zmMaxHeight;
                  var minHeight = _this.zmMinHeight;
                  // 处理支援阀，567对应的是支援阀，支援阀高度比水站的闸门要低
                  if (name === "阀5" || name === "阀6" || name === "阀7") {
                    entity.polygon.extrudedHeight = 3.2;
                    maxHeight = 3.2;
                  } else {
                    entity.polygon.extrudedHeight = _this.zmMaxHeight;
                  }
                  /*                     entity.polygon.extrudedHeight = _this.zmMaxHeight; */
                  entity.polygon.outline = false;
                  entity.polygon.material = Cesium.Color.fromCssColorString(
                    "#8B999D"
                  );
                  let obj = {
                    entity: entity, // 阀门实体对象
                    status: -1, // 阀门状态，-1是关闭，0是暂停，1是开启
                    currentHeight: 0, // 阀门当前升起高度，默认是0
                    maxHeight: maxHeight,
                    minHeight: minHeight
                  };
                  _this.valveList.push(obj);
                  _this.addValves(obj);
                }
              });
            });
        }
      });
    },
    autoOpenGate(index) {
      var _this = this;
      Bus.$emit("hide-rain");
      viewer
        .flyTo(this.valveList[index].entity, {
          offset: {
            heading: Cesium.Math.toRadians(90.0),
            pitch: Cesium.Math.toRadians(-15),
            range: 60
          }
        })
        .then(() => {
          _this.openZM(index)
          // 改变步长，根据当前打开闸门的数量，让下雨时候的河流增速变慢
          _this.updataRiverStep(_this.computeOpenNum());
          setTimeout(() => {
            Bus.$emit("show-rain");
          }, 5000);
        });
    },
    openZM(index) {
      var valve = this.valveList[index];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight += this.delayHeight;
        if (valve.currentHeight > valve.maxHeight) {
          valve.currentHeight = valve.maxHeight;
        }
        return valve.currentHeight;
      }, false);
      valve.entity.polygon.height = property;
      valve.status = 1;
      this.AI(index);
    },
    AI(index) {
      var _this = this;
      Bus.$emit("hide-rain");
      viewer
        .flyTo(this.valveList[index].entity, {
          offset: {
            heading: Cesium.Math.toRadians(90.0),
            pitch: Cesium.Math.toRadians(-15),
            range: 60
          }
        })
        .then(() => {
          // 问题： 如何平衡左右两边的河流变化，一边多一边少
          // 自动预警的时候执行下面的步骤。但是非智能预警情况下打开闸门删除下雨的事件即可。
          // 停止下雨，但是不停止更新数据，此时数据改成每秒更新一次
          // 这里更新步数，使用的是index的计算方法或者重新定义一个变量，来储存目前打开多少个阀门了。 openNum. 还是使用每次访问状态进行更新。
          _this.updataRiverStep(_this.computeOpenNum());
          // 关闭每3秒更新一次数据(避免随机数导致数据显示不明显)，~~打开每秒更新一次数据(这个每秒的更新取代了下雨的那个每秒更新)~~,~~打开下雨的每秒更新事件(这个更新事件是用来更新高度的)~~
          // Bus.$emit("close-update-data-3")
          // Bus.$emit("open-update-data-1")
          setTimeout(() => {
            // 打开每3秒更新一次数据，关闭每秒更新一次数据
            // Bus.$emit("open-update-data-3")
            // Bus.$emit("close-update-data-1")
            // 开始下雨
            Bus.$emit("show-rain");
          }, 5000);
        });
    },
    closeZM(index) {
      var valve = this.valveList[index];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight -= this.delayHeight;
        if (valve.minHeight > valve.currentHeight) {
          valve.currentHeight = valve.minHeight;
        }
        return valve.currentHeight;
      }, false);
      valve.entity.polygon.height = property;
      valve.status = -1;
      // this.AI();
    },
    openGate() {
      var valve = this.valveList[this.selectedIndex];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight += this.delayHeight;
        if (valve.currentHeight > valve.maxHeight) {
          valve.currentHeight = valve.maxHeight;
          return valve.currentHeight;
        }
        // 发送到
        Bus.$emit("update-river-data");
        this.downWaterHeight();
        return valve.currentHeight;
      }, false);
      // this.selectedStatue = 1;
      valve.status = 1;
      this.selectedHeight = valve.maxHeight; // 这里如果直接设置为valve.currentHight则会出现问题。因为该值在property中一直变化，所以无法记录他的值。只能将它设置为最大值
      valve.entity.polygon.height = property;
    },
    closeGate() {
      var valve = this.valveList[this.selectedIndex];
      var property = new Cesium.CallbackProperty(() => {
        valve.currentHeight -= this.delayHeight;
        if (valve.minHeight > valve.currentHeight) {
          valve.currentHeight = valve.minHeight;
        }
        return valve.currentHeight;
      }, false);
      // this.selectedStatue = -1;
      valve.status = -1;
      this.selectedHeight = valve.minHeight;
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
    },
    // 计算现在有多少闸门被打开
    computeOpenNum() {
      var num = 0;
      this.valveList.forEach(valve => {
        valve.status !== -1 && num++;
      });
      return num;
    },
    ...mapMutations([
      "addValves",
      "setValvesStatus",
      "updataRiverStep",
      "downWaterHeight"
    ])
  },
  computed: {
    ...mapState(["waterHeight", "valves"]),
    ...mapGetters(["showOutlandWaterLevel"]),
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
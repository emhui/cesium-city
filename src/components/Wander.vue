<template>
  <a-card
    ref="card"
    class="card"
    v-show="showCard"
    :style="{left: toolsDiv.left, top: toolsDiv.top, width: toolsDiv.width}"
    size="small"
  >
    <a slot="extra" @click="close">x</a>
    <h2 slot="title" @mousedown="mousedown">#沿线巡检</h2>

    <template class="ant-card-actions" slot="actions">
      <!--       <a-button size="small" @click="startWander">开始</a-button> -->
      <a-dropdown>
        <a-menu slot="overlay" @click="startWander">
          <a-menu-item key="0">内河</a-menu-item>
          <a-menu-item key="1">外河</a-menu-item>
          <a-menu-item key="2">水渠</a-menu-item>
        </a-menu>
        <a-button size="small">
          开始
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button size="small" @click="pauseWander">{{wanderStatus}}</a-button>
      <a-button size="small" @click="clearWander">停止</a-button>
    </template>
  </a-card>
</template>

<script>
import Bus from "../store/eventBus";
var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  props: ["data"],
  mounted() {
    viewer = this.$store.state.viewer;
    this.parseData();

    Bus.$on("start-wander", () => {
      this.startWander();
    });
    Bus.$on("clear-wander", () => {
      this.clearWander();
    });
    Bus.$on("change-wander", checked => {
      if (checked) {
        viewer.clock.shouldAnimate = false;
      } else {
        viewer.clock.shouldAnimate = true;
      }
    });
    Bus.$on("open-inspection", checked => {
      this.showCard = checked;
      // this.flyToInitPoint()
    });
  },
  data() {
    return {
      marksIndex: 1, // 当前飞行轨迹下标
      pitchValue: -15, // 俯视角度
      marks: [], // 储存多条飞行路径
      num: 0, // 当前正在漫游路径编号
      status: "pasue", // 暂停
      Exection1: null, // 飞行事件
      Exection2: null, // 转向事件
      showCard: false,
      toolsDiv: {
        left: "200px",
        top: "40px",
        width: "220px"
      },
      wanderStatus: "暂停",
      routers: ["内河", "外河", "水渠"]
    };
  },
  methods: {
    close() {
      this.showCard = false;
    },
    mousedown(event) {
      console.log(event);

      // this.selectElement = document.getElementById("card1");

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
    flyToInitPoint() {
      this.clearWander();
      viewer.clock.shouldAnimate = true;
      // 飞行
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          this.marks[this.num][0].lng,
          this.marks[this.num][0].lat,
          this.marks[this.num][0].height
        ), //定位坐标点，建议使用谷歌地球坐标位置无偏差
        duration: 7 //定位的时间间隔
      });
    },
    startWander(e) {
      this.$message.success(`开始巡检${this.routers[e.key]}`);
      this.flyToInitPoint();
      var _this = this;
      setTimeout(function() {
        _this.flyExtent();
      }, 7000);
    },
    pauseWander() {
      viewer.clock.shouldAnimate = !viewer.clock.shouldAnimate;
      if (viewer.clock.shouldAnimate) {
        this.wanderStatus = "暂停";
      } else {
        this.wanderStatus = "继续";
      }
    },
    clearWander() {
      if (this.Exection1) {
        viewer.clock.onTick.removeEventListener(this.Exection1);
        this.Exection1 = null;
      }
      if (this.Exection2) {
        viewer.clock.onTick.removeEventListener(this.Exection2);
        this.Exection2 = null;
      }
      this.marksIndex = 1;
    },
    flyExtent() {
      // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
      var _this = this;
      var marks = this.marks[this.num];
      var marksIndex = this.marksIndex;
      var pitch = Cesium.Math.toRadians(this.pitchValue);
      // 时间间隔2秒钟
      this.setExtentTime(marks[marksIndex].flytime);
      this.Exection1 = function TimeExecution() {
        var preIndex = marksIndex - 1;
        // 重复的进行漫游
        if (marksIndex == 0) {
          preIndex = marks.length - 1;
        }
        var heading = _this.bearing(
          marks[preIndex].lat,
          marks[preIndex].lng,
          marks[marksIndex].lat,
          marks[marksIndex].lng
        );
        heading = Cesium.Math.toRadians(heading);
        // 当前已经过去的时间，单位s
        var delTime = Cesium.JulianDate.secondsDifference(
          viewer.clock.currentTime,
          viewer.clock.startTime
        );
        var originLat =
          marksIndex == 0
            ? marks[marks.length - 1].lat
            : marks[marksIndex - 1].lat;
        var originLng =
          marksIndex == 0
            ? marks[marks.length - 1].lng
            : marks[marksIndex - 1].lng;
        var endPosition = Cesium.Cartesian3.fromDegrees(
          originLng +
            ((marks[marksIndex].lng - originLng) / marks[marksIndex].flytime) *
              delTime,
          originLat +
            ((marks[marksIndex].lat - originLat) / marks[marksIndex].flytime) *
              delTime,
          marks[marksIndex].height
        );
        viewer.scene.camera.setView({
          destination: endPosition,
          orientation: {
            heading: heading,
            pitch: pitch
          }
        });
        if (
          Cesium.JulianDate.compare(
            viewer.clock.currentTime,
            viewer.clock.stopTime
          ) >= 0
        ) {
          viewer.clock.onTick.removeEventListener(_this.Exection1);
          _this.changeCameraHeading();
        }
      };
      viewer.clock.onTick.addEventListener(this.Exection1);
    },
    // 相机原地定点转向
    changeCameraHeading() {
      var _this = this;
      var marks = this.marks[this.num];
      var marksIndex = this.marksIndex;
      var nextIndex = marksIndex + 1;
      if (marksIndex == marks.length - 1) {
        nextIndex = 0;
      }
      // 计算两点之间的方向
      var heading = this.bearing(
        marks[marksIndex].lat,
        marks[marksIndex].lng,
        marks[nextIndex].lat,
        marks[nextIndex].lng
      );
      // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
      var pitch = Cesium.Math.toRadians(this.pitchValue);
      // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
      var angle = (heading - Cesium.Math.toDegrees(viewer.camera.heading)) / 2;
      // 时间间隔2秒钟
      this.setExtentTime(2);
      // 相机的当前heading
      var initialHeading = viewer.camera.heading;
      this.Exection2 = function TimeExecution() {
        // 当前已经过去的时间，单位s
        var delTime = Cesium.JulianDate.secondsDifference(
          viewer.clock.currentTime,
          viewer.clock.startTime
        );
        var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
        viewer.scene.camera.setView({
          orientation: {
            heading: heading,
            pitch: pitch
          }
        });
        if (
          Cesium.JulianDate.compare(
            viewer.clock.currentTime,
            viewer.clock.stopTime
          ) >= 0
        ) {
          viewer.clock.onTick.removeEventListener(_this.Exection2);
          marksIndex = ++marksIndex >= marks.length ? 0 : marksIndex;
          _this.marksIndex = marksIndex;
          _this.flyExtent();
        }
      };
      viewer.clock.onTick.addEventListener(this.Exection2);
    },
    // 设置飞行的时间到viewer的时钟里
    setExtentTime(time) {
      var startTime = Cesium.JulianDate.fromDate(new Date());
      var stopTime = Cesium.JulianDate.addSeconds(
        startTime,
        time,
        new Cesium.JulianDate()
      );
      viewer.clock.startTime = startTime.clone(); // 开始时间
      viewer.clock.stopTime = stopTime.clone(); // 结速时间
      viewer.clock.currentTime = startTime.clone(); // 当前时间
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
      viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
    },
    // 获取方向角度
    bearing(startLat, startLng, destLat, destLng) {
      startLat = this.toRadians(startLat);
      startLng = this.toRadians(startLng);
      destLat = this.toRadians(destLat);
      destLng = this.toRadians(destLng);

      let y = Math.sin(destLng - startLng) * Math.cos(destLat);
      let x =
        Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
      let brng = Math.atan2(y, x);
      let brngDgr = this.toDegrees(brng);
      return (brngDgr + 360) % 360;
    },
    toRadians(degrees) {
      return (degrees * Math.PI) / 180;
    },
    toDegrees(radians) {
      return (radians * 180) / Math.PI;
    },
    parseData() {
      var _this = this;
      var scene = viewer.scene;

      this.data.forEach(data => {
        if (data.type === "wander") {
          console.log(data);
          var options = {
            camera: scene.camera,
            canvas: scene.canvas,
            clampToGround: true
          };
          viewer.dataSources
            .add(Cesium.KmlDataSource.load(data.url, options))
            .then(dataSources => {
              dataSources.entities.values.forEach(entity => {
                entity.polyline.heightReference =
                  Cesium.HeightReference.CLAMP_TO_GROUND;
                // 设置一下路径贴地
                // entity.polyline.clampToGround = new ConstantProperty(true);
                var positions = entity.polyline.positions._value;
                var mark = positions.map(element => {
                  var cartographic = Cesium.Cartographic.fromCartesian(element);
                  var lng = Cesium.Math.toDegrees(cartographic.longitude);
                  var lat = Cesium.Math.toDegrees(cartographic.latitude);
                  var height = Cesium.Math.toDegrees(cartographic.height);
                  return { lng: lng, lat: lat, height: 100, flytime: 15 };
                });

                _this.marks.push(mark);
              });
            });
        }
      });
    }
  },
  computed: {
    showStatus() {
      try {
        console.log(viewer.clock.shouldAnimate);
        if (viewer.clock.shouldAnimate) {
          return "暂停";
        } else {
          return "继续";
        }
      } catch (error) {
        return "暂停";
      }
    }
  }
};
</script>

<style scoped>
.card {
  position: absolute;
  z-index: 1000;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  text-align: left;
}
</style>>
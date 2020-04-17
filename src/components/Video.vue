<template>
  <div>
    <a-card
      ref="card"
      class="card"
      v-show="showCard"
      :style="{left: toolsDiv.left, top: toolsDiv.top, width: toolsDiv.width}"
      size="small"
    >
      <a slot="extra" @click="close">x</a>
      <h2 slot="title" @mousedown="mousedown">#实时监控</h2>

      <template class="ant-card-actions" slot="actions">
        <a-checkbox @change="changeShow" :checked="showVideo">显示</a-checkbox>
        <a-button size="small" @click="clickPlay">{{showVideoStatus}}</a-button>
      </template>
    </a-card>
    <video
      ref="video"
      id="trailer"
      width="250"
      muted
      autoplay
      loop
      crossorigin
      controls
      style="display:none"
    >
      <!--         <source src="http://127.0.0.1:9090/public/video/demo.webm" type="video/webm" /> -->
      <source :src="videoUrl" type="video/mp4" />
      <source
        src="https://sandcastle.cesium.com/SampleData/videos/big-buck-bunny_trailer.mov"
        type="video/quicktime"
      />Your browser does not support the
      <code>video</code> element.
    </video>
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
      videoEntity: null, //
      showCard: false,
      toolsDiv: {
        left: "200px",
        top: "40px",
        width: "220px"
      },
      videoStatus: 0, // 视频状态，0 是暂停 1 是播放
      videoUrl: ""
    };
  },
  mounted() {
    viewer = this.$store.state.viewer;
    var scene = viewer.scene;

    var kmlOptions = {
      camera: scene.camera,
      canvas: scene.canvas,
      clampToGround: true
    };

    var _this = this;
    this.data.forEach(element => {
      if (element.type === "video") {
        // this.addPrimitiveRiver(element.url, kmlOptions, River_Material);
        viewer.dataSources
          .add(Cesium.KmlDataSource.load(element.url, kmlOptions))
          .then(dataSources => {
            dataSources.entities.values.forEach(entity => {
              console.log(entity);
              entity.show = false
              if (entity.name === "video-point") {
                var position = entity.position;
                var heading = Cesium.Math.toRadians(30);
                var pitch = 0;
                var roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                  position._value,
                  hpr
                );
                console.log(orientation);

                this.videoEntity = viewer.entities.add({
                  name: "Red box with black outline",
                  position: position,
                  show: false,
                  box: {
                    dimensions: new Cesium.Cartesian3(160.0, 1.0, 90.0),
                    material: _this.$refs.video,
                    outline: true,
                    outlineColor: Cesium.Color.BLACK,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                  },
                  orientation: orientation
                }); 
              }
              /*               entity.polygon.extrudedHeight = 10
              this.videoEntity = entity;
              this.videoEntity.show = false;
              entity.polygon && (entity.polygon.material = _this.$refs.video);
              entity.polygon.material.repeat = new Cartesian2(8.0, 8.0)
              this.pause() */
            });
          });
      } else if (element.type === "video-url") {
        this.videoUrl = element.url;
      }
    });

    Bus.$on("play-video", () => {
      this.play();
    });
    Bus.$on("pause-video", () => {
      this.pause();
    });

    Bus.$on("update-video", checked => {
      (checked && this.show()) || this.hide();
    });

    Bus.$on("open-video", checked => {
      if (checked) {
        this.videoEntity.show = true;
        this.showCard = true;
        viewer.flyTo(this.videoEntity, {
          offset: {
            heading: Cesium.Math.toRadians(28.0),
            pitch: Cesium.Math.toRadians(-1),
            range: 300
          }
        });
      } else {
        this.videoEntity.show = false;
        this.showCard = false;
      }
    });
  },
  methods: {
    // 是否显示video,默认不显示
    changeShow(e) {
      console.log(e.target.checked);
      if (e.target.checked) this.show();
      else this.hide();
      /*       e.target.checked && this.show() || this.hide() */
    },
    clickPlay() {
      // this.videoStatus && this.pause() || this.play()
      this.videoStatus = !this.videoStatus;
    },
    play() {
      this.$refs.video.play();
    },
    pause() {
      this.$refs.video.pause();
    },
    show() {
      this.videoEntity.show = true;
    },
    hide() {
      this.videoEntity.show = false;
    },
    close() {
      this.showCard = false;
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
  },
  computed: {
    showVideoStatus() {
      return (!this.videoStatus && "播放") || "暂停";
    },
    showVideo() {
      try {
        return this.videoEntity.show;
      } catch (error) {
        return false;
      }
    }
  },
  watch: {
    videoStatus() {
      if (this.videoStatus) this.play();
      else this.pause();
    }
  }
};
</script>

<style lang="scss" scoped>
.trailer {
  display: none;
}

.card {
  position: absolute;
  z-index: 1000;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  text-align: left;
}
</style>
<template>
  <div class="video-model">
    <video ref="video" id="trailer" width="250"  loop crossorigin controls style="display:none">
      <source
        src="http://127.0.0.1:9090/public/video/demo.webm"
        type="video/webm"
      />
      <source src="http://127.0.0.1:9090/public/video/hope.mp4" type="video/mp4" />
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
      videoEntity: null //
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
            console.log(dataSources);
            dataSources.entities.values.forEach(entity => {
              this.videoEntity = entity;
              entity.polygon && (entity.polygon.material = _this.$refs.video);
            });
          });
      }
    });

    Bus.$on("play-video", () => {
      this.play();
    });
    Bus.$on("pause-video", () => {
      this.pause();
    });

    Bus.$on("update-video", checked => {
      if (checked) {
        this.show();
      } else {
        this.hide();
      }
    });
  },
  methods: {
    play() {
      console.log("play");
      
      this.$refs.video.play();
    },
    pause() {
      console.log("pause");
      this.$refs.video.pause();
    },
    show() {
      console.log("show");
      
      this.videoEntity.show = true;
    },
    hide() {
      console.log("hide");
      
      this.videoEntity.show = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.video-model {
  position: absolute;
  right: 2em;
  bottom: 2em;
  z-index: 1000;
}
</style>
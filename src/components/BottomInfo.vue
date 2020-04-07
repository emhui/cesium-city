<template>
  <div id="bottom-info-box">
    <span class="info__item info__lon">纬度:{{longitude}}</span>
    <span class="info__item info__lat">经度:{{latitude}}</span>
    <span class="info__item info__elevation">海拔:{{elevation}}</span>
    <span class="info__item info__height">高度:{{height}}</span>
    <span class="info__item info__heading">方向:{{heading}}</span>
    <span class="info__item info__pitch">俯视角:{{pitch}}</span>
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");

let viewer = null
export default {
  data() {
    return {
      longitude: 0,
      latitude: 0,
      elevation: 0,
      height: 0,
      heading: 0,
      pitch: 0
    };
  },
  mounted() {
    viewer = this.$store.state.viewer
    var scene = viewer.scene;
    var _this = this;

    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {
      if (scene.mode !== Cesium.SceneMode.MORPHING) {
        try {
          var pickedObject = scene.pick(movement.endPosition);
          var cartesian = viewer.scene.pickPosition(movement.endPosition);

          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
          var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
          var elevationString = cartographic.height.toFixed(2);
          var pitchString = Cesium.Math.toDegrees(scene.camera.pitch).toFixed(
            2
          );
          var headingString = Cesium.Math.toDegrees(
            scene.camera.heading
          ).toFixed(2);
          var heightString = scene.globe.getHeight(cartographic).toFixed(2);
          // console.log('direct get:', heightString, '\n globe get: ', scene.globe.getHeight(cartesian));

          /*         var headingString = Cesium.Math.toDegrees(scene.camera.heading).toFixed(2)
        var pitchString = Cesium.Math.toDegrees(scene.camera.ptich).toFixed(2) */
          _this.longitude = longitudeString;
          _this.latitude = latitudeString;
          _this.elevation = elevationString;
          _this.height = heightString;
          _this.heading = headingString;
          _this.pitch = pitchString;
        } catch (error) {}
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
};
</script>

<style lang="scss" scoped>
#bottom-info-box {
  position: absolute;
  width: 100%;
  height: 2em;
  left: 0;
  bottom: 0;
  background-color: rgba($color: #000000, $alpha: 0.5);
  border-radius: 2px;
  z-index: 1000;
  color: white;
  text-align: right;
/*   display: flex; */
  justify-content: flex-end;
}

.info {
  &__item {
    padding: 0 2em;
    font-weight: 700;
    font-size: 1.4em;
    letter-spacing: 2px;
  }
}
</style>
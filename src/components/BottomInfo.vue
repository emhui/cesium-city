<template>
  <div id="bottom-info-box">
    <span class="info__item info__lon">纬度:{{showLongitude}}</span>
    <span class="info__item info__lat">经度:{{showLatitude}}</span>
    <span class="info__item info__elevation">海拔:{{showElevation}}</span>
    <!--     <span class="info__item info__height">高度:{{showCameraHeight}}</span> -->
    <span class="info__item info__heading">方向:{{showHeading}}</span>
    <span class="info__item info__pitch">俯视角:{{showPitch}}</span>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from "vuex";

export default {
  mounted() {
    /*           var pickedObject = scene.pick(movement.endPosition);
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
 */
  },
  computed: {
    ...mapGetters([
      "showLongitude",
      "showLatitude",
      "showElevation",
      "showCameraHeight",
      "showHeading",
      "showPitch"
    ])
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
  justify-content: flex-end;
}

.info {
  &__item {
    padding: 0 2em;
    font-weight: 700;
    font-size: 1em;
    letter-spacing: 2px;
  }
}
</style>
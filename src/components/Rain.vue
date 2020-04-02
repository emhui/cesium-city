<template>
  <div id="rain-model">
    <div class="control-panel">
      <div class="rain-box">
        <div class="rain__item">
          <input type="checkbox" name="is-rain" id="is-rain" v-model="status" @click="onClick($event)">
          <label for="is-rain">下雨</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");

export default {
  props: ["viewer"],
  data() {
    return {
      status: false
    };
  },
  mounted() {},
  methods: {
    onClick(event){
      console.log(event.target.checked)
      if (event.target.checked){
        this.startRain()
      }else{
        this.startRain()
      }
    },
    initPartileSystem() {
      var scene = this.viewer.scene;
      var rainParticleSize = 15.0
      var rainRadius = 100000.0
      var rainGravityScratch = new Cesium.Cartesian3();
      var rainImageSize = new Cesium.Cartesian2(
        rainParticleSize,
        rainParticleSize * 2.0
      );
      var rainUpdate = function(particle, dt) {
        // 模拟重力效果
        rainGravityScratch = Cesium.Cartesian3.normalize(
          particle.position,
          rainGravityScratch
        );
        rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(
          rainGravityScratch,
          -1050.0,
          rainGravityScratch
        );

        particle.position = Cesium.Cartesian3.add(
          particle.position,
          rainGravityScratch,
          particle.position
        );

        // 当camera拉远后让雨滴消失
        var distance = Cesium.Cartesian3.distance(
          scene.camera.position,
          particle.position
        );
        if (distance > rainRadius) {
          particle.endColor.alpha = 0.0;
        } else {
          particle.endColor.alpha =
            this.rainSystem.endColor.alpha / (distance / rainRadius + 0.1);
        }
      };
      this.rainSystem = new Cesium.ParticleSystem({
        modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position),
        speed: -1.0,
        lifetime: 15.0,
        emitter: new Cesium.SphereEmitter(rainRadius),
        startScale: 1.0,
        endScale: 0.0,
        image: this.$baseUrl + "data/circular_particle.png",
        emissionRate: 9000.0,
        startColor: new Cesium.Color(0.27, 0.5, 0.7, 0.0),
        endColor: new Cesium.Color(0.27, 0.5, 0.7, 0.98),
        imageSize: rainImageSize,
        updateCallback: rainUpdate
      });
    },
    startRain() {
      // rain
      // 粒子更新函数
      this.initPartileSystem();
      this.viewer.scene.primitives.add(this.rainSystem);
    },
    stopRain() {
      this.viewer.scene.primitives.remove(this.rainSystem);
      this.rainSystem = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.control-panel{
  z-index: 1000;
  position: absolute;
  top: 15em;
  left: 2em;
}
</style>
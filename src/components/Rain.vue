<template>
  <div id="rain-model">
    <!--     <div class="control-panel">
      <div class="rain-box">
        <div class="rain__item">
          <input
            type="checkbox"
            name="is-rain"
            id="is-rain"
            v-model="status"
            @click="onClick($event)"
          />
          <label for="is-rain">下雨</label>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
import Bus from "../store/eventBus";
import { mapState, mapMutations } from "vuex";

var Cesium = require("cesium/Cesium");
let viewer = null;

export default {
  data() {
    return {
      status: false, // 是否下雨的状态
      rainInterval: null // 设置一个下雨定时器
    };
  },
  mounted() {
    Bus.$on("update-rain", checked => {
      if (checked) {
        // 下雨就通知水位在上升
        this.startRainInterval();
        this.showRain();
      } else {
        this.clearRainInterval();
        this.removeStage();
      }
    });
  },
  methods: {
    onClick(event) {
      if (event.target.checked) {
        // 下雨就通知水位在上升
        this.startRainInterval();
        this.showRain();
      } else {
        this.clearRainInterval();
        this.removeStage();
      }
    },
    startRainInterval() {
      this.rainInterval = setInterval(() => {
        this.addWaterHeight();
        // Bus.$emit("water-height-up");
      }, 1000);
    },
    clearRainInterval() {
      clearInterval(this.rainInterval);
      this.rainInterval = null;
    },
    initPartileSystem() {
      viewer = this.$store.state.viewer;
      var scene = viewer.scene;
      var rainParticleSize = 15.0;
      var rainRadius = 100000.0;
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
      /*       this.initPartileSystem();
      this.viewer.scene.primitives.add(this.rainSystem); */
      this.showRain();
      this.rainCircumstance();
    },
    stopRain() {
      /*       this.viewer.scene.primitives.remove(this.rainSystem);
      this.rainSystem = null; */
      this.removeStage();
      this.normalCircumstance();
    },
    getRainShader() {
      return "uniform sampler2D colorTexture;\n\
				varying vec2 v_textureCoordinates;\n\
			\n\
				float hash(float x){\n\
					return fract(sin(x*133.3)*13.13);\n\
			}\n\
			\n\
			void main(void){\n\
			\n\
				float time = czm_frameNumber / 60.0;\n\
			vec2 resolution = czm_viewport.zw;\n\
			\n\
			vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
			vec3 c=vec3(.6,.7,.8);\n\
			\n\
			float a=-.4;\n\
			float si=sin(a),co=cos(a);\n\
			uv*=mat2(co,-si,si,co);\n\
			uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
			\n\
			float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
			float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
			c*=v*b; \n\
			\n\
			gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
			}\n\
";
    },
    showRain() {
      viewer = this.$store.state.viewer;
      this.removeStage();
      var e = new Cesium.PostProcessStage({
        name: "czm_rain",
        fragmentShader: this.getRainShader()
      });
      viewer.scene.postProcessStages.add(e), (this.lastStage = e);
    },
    removeStage() {
      viewer = this.$store.state.viewer;
      this.lastStage && viewer.scene.postProcessStages.remove(this.lastStage),
        (this.lastStage = null);
    },
    rainCircumstance() {
      viewer = this.$store.state.viewer;
      viewer.scene.skyAtmosphere.hueShift = -0.8;
      viewer.scene.skyAtmosphere.saturationShift = -0.7;
      viewer.scene.skyAtmosphere.brightnessShift = -0.33;
      viewer.scene.fog.density = 0.001;
      viewer.scene.fog.minimumBrightness = 0.8;
    },
    normalCircumstance() {
      viewer = this.$store.state.viewer;
      viewer.scene.skyAtmosphere.hueShift = 0;
      viewer.scene.skyAtmosphere.saturationShift = 0;
      viewer.scene.skyAtmosphere.brightnessShift = 0;
      viewer.scene.fog.density = 2e-4;
      viewer.scene.fog.minimumBrightness = 0.03;
    },
    ...mapMutations(["addWaterHeight", "subWaterHeight"])
  },
  computed: {}
};
</script>

<style lang="scss" scoped>
.control-panel {
  z-index: 1000;
  position: absolute;
  top: 2em;
  left: 18em;
}
</style>
<template>
  <div id="river-model"></div>
</template>

<script>
var Cesium = require("cesium/Cesium");

let viewer = null
export default {
  props: ["data"],
  data() {
    return {
      rivers: []
    };
  },
  mounted() {
    console.log(this.data);
    this.addRiver();
  },
  methods: {
    addRiver() {
      viewer = this.$store.state.viewer
      var scene = viewer.scene;

      var kmlOptions = {
        camera: scene.camera,
        canvas: scene.canvas,
        clampToGround: true
      };

      this.data.forEach(element => {
        if (element.type === "river") {
          viewer.dataSources
            .add(Cesium.KmlDataSource.load(element.url, kmlOptions))
            .then(dataSource => {
              dataSource.entities.values.forEach(entity => {
                if (entity.polygon) {
                  console.log(entity);
                  entity.polygon.material = Cesium.Color.DEEPSKYBLUE.withAlpha(
                    0.5
                  );
                }
              });
            });
        }
      });
      /*       var geocachePromise = Cesium.KmlDataSource.load(
        "http://localhost:8080/public/river/ningbo_river_2.kml",
        // this.$baseUrl + "data/river4.kml",
        // "http://localhost:8080/public/river/ningbo_river_2_LayerToKML.kmz",
        kmlOptions
      );

      var River1_Material = new Cesium.Material({
        fabric: {
          type: "Water",
          uniforms: {
            normalMap: this.$baseUrl + "data/water.jpg",
            frequency: 100.0,
            animationSpeed: 0.01,
            amplitude: 10.0
          }
        }
      });
      this.viewer.dataSources.add(geocachePromise).then(dataSource => {
        console.log(dataSource);
        dataSource.entities.values.forEach(entity => {
          if (entity.polygon) {
            console.log(entity);
            entity.polygon.material = Cesium.Color.DEEPSKYBLUE.withAlpha(0.5);
            // "http://localhost:8080/public/water.jpg"
            //Cesium.Color.fromBytes(0,191,255,100)
            // Cesium.Color.RED.withAlpha(0.5)
            // Cesium.Color.fromBytes(102, 255,230,0.5)
          }
        });
      }); */
      /*       geocachePromise.then(dataSource => {
        // this.dataSource.add(dataSource);
        console.log(dataSource);
        
        dataSource.entities.values.forEach(entity => {
          console.log(entity);
          if (entity.polygon) {
            var polygonHierarchy = entity.polygon.hierarchy;
            var positions = entity.polygon.hierarchy._value.positions;

            var polygon1 = new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(positions),
              extrudedHeight: 0,
              height: 0,
              vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
            });

            this.River1 = new Cesium.Primitive({
              geometryInstances: new Cesium.GeometryInstance({
                geometry: polygon1
              }),
              appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: true
              }),
              show: true
            });

            this.River1.appearance.material = River1_Material;

            // River1.modelMatrix = Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.fromArray([0,0,10])) 可以，但是效果不是特别好. 最终还是选择平移矩阵

            scene.primitives.add(this.River1);
          }
        });
      }); */
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
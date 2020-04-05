<template>
  <div id="label-model">
    <div class="label-tools">
      <input type="button" value="书签" @click="add" />
    </div>
    <ul class="lable-list">
      <li class="label-item" v-for="label in labelList">{{label.name}}</li>
    </ul>
    <div class="input-box" v-show="showInput">
      <input type="text" name id v-model="content" />
      <input type="button" value="确认" @click="update" />
    </div>
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");

export default {
  props: ["viewer"],
  data() {
    return {
      content: "",
      addMode: false,
      showInput: false,
      cartesian: null,
      labelList: [],
      currentLabel: null
    };
  },
  mounted() {
    var scene = this.viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(movement => {
      var pickObject = scene.pick(movement.position);
      var cartesian = scene.pickPosition(movement.position);
      if (Cesium.defined(pickObject) && Cesium.defined(cartesian)) {
        if (this.addMode) {
          // 弹出输入框
          this.showInput = true;
          this.cartesian = cartesian;
        } else if (
          pickObject.id instanceof Cesium.Entity &&
          pickObject.id.label
        ) {
          this.showInput = true;
          this.currentLabel = pickObject.id;
          this.content = pickObject.id.name;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  methods: {
    add() {
      console.log("add");
      this.addMode = true;
      document.body.style.cursor = "crosshair";
    },
    update() {
      if (this.currentLabel) {
        this.currentLabel.name = this.content;
        this.currentLabel.label.text = this.content;
      } else {
        this.createLabel();
      }
      this.showInput = false;
      this.addMode = false;
      document.body.style.cursor = "default";
      this.currentLabel = null;
      this.content = "";
    },
    createLabel() {
      var text = this.content ? this.content : "city";
      var entity = this.viewer.entities.add({
        name: text,
        position: this.cartesian,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: text,
          font: "14pt monospace",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9)
        }
      });
      this.labelList.push(entity);
    }
  }
};
</script>

<style lang="scss" scoped>
#label-model {
  position: absolute;
  top: 18em;
  left: 2em;
  z-index: 1000;
}
</style>
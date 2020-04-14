<template>
  <div></div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
var Cesium = require("cesium/Cesium");

let viewer = null;
export default {
  data() {
    return {};
  },
  mounted() {
    viewer = this.$store.state.viewer;
    // 新建一个DOM元素，当移动到实体，显示实体到名字
    var nameOverlay = document.createElement("div");
    viewer.container.appendChild(nameOverlay);
    // nameOverlay.className = "backdrop";
    nameOverlay.style.display = "none";
    nameOverlay.style.position = "absolute";
    nameOverlay.style.bottom = "0";
    nameOverlay.style.left = "0";
    nameOverlay.style.background = "rgba(42,42,42,0.7)";
    nameOverlay.style["pointer-events"] = "none";
    nameOverlay.style.padding = "4px";
    nameOverlay.style.borderRadius = "2px";
    nameOverlay.style.color = "#fff";
    nameOverlay.style.fontSize = "small";
    nameOverlay.style.backgroundColor = "black";

    // 当前选中的实体对象
    var selected = {
      entity: undefined,
      originalColor: new Cesium.Color()
    };

    // 获取当前选中的实体，但是把实体信息复制到这个实体上面。再使用 viewer.selected = selectedEntity
    var selectedEntity = new Cesium.Entity();

    // Get default left click handler for when a feature is not picked on left click
    var clickHandler = viewer.screenSpaceEventHandler.getInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    // 存储当前高亮实体的信息
    var highlighted = {
      entity: undefined,
      originalColor: new Cesium.Color()
    };
    var _this = this;
    // 鼠标移动事件，悬浮到实体并高亮
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
      // 设置屏幕全局坐标
      _this.setPickPosition(viewer.scene.pickPosition(movement.endPosition));
      // 如果之前存在高亮显示，则取消高亮显示
      if (Cesium.defined(highlighted.entity)) {
        highlighted.entity.polygon.outlineColor = highlighted.originalColor;
        highlighted.entity = undefined;
      }
      // 选择一个新的实体
      var pickedEntity = viewer.scene.pick(movement.endPosition);
      if (!Cesium.defined(pickedEntity)) {
        nameOverlay.style.display = "none";
        return;
      }
      if (pickedEntity.id) {
        var pickedEntity = pickedEntity.id;
        if (pickedEntity.polygon && pickedEntity.name.startsWith("阀")) {
          // 实体选中后展示它的数据
          nameOverlay.style.display = "block";
          nameOverlay.style.bottom =
            viewer.canvas.clientHeight - movement.endPosition.y + "px";
          nameOverlay.style.left = movement.endPosition.x + "px";
          var name = pickedEntity.name;
          if (!Cesium.defined(name)) {
            name = pickedFeature.getProperty("id");
          }
          nameOverlay.textContent = name;
          // Highlight the feature if it's not already selected.
          if (pickedEntity !== selected.entity) {
            highlighted.entity = pickedEntity;
            Cesium.Color.clone(
              pickedEntity.polygon.outlineColor,
              highlighted.originalColor
            );
            pickedEntity.polygon.outlineColor = Cesium.Color.BLUE;
          }
        }
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 鼠标点击事件，选中实体，高亮，并且显示数据
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
      movement
    ) {
      // 如果实体之前被选中，则取消高亮
      if (Cesium.defined(selected.entity)) {
        selected.entity.polygon.outlineColor = selected.originalColor;
        selected.entity = undefined;
      }
      // 选择新的实体对象
      var pickedEntity = viewer.scene.pick(movement.position);
      if (!Cesium.defined(pickedEntity)) {
        clickHandler(movement); // 这一步的作用是什么
        return;
      }
      if (pickedEntity.id) {
        pickedEntity = pickedEntity.id;
        if (pickedEntity.polygon) {
          // Select the feature if it's not already selected
          if (selected.entity === pickedEntity) {
            return;
          }
          selected.entity = pickedEntity;
          // 保存当前实体的颜色
          if (pickedEntity === highlighted.entity) {
            Cesium.Color.clone(
              highlighted.originalColor,
              selected.originalColor
            );
            highlighted.feature = undefined;
          } else {
            Cesium.Color.clone(
              pickedEntity.polygon.outlineColor,
              selected.originalColor
            );
          }
          // 高亮新选中实体的颜色
          pickedEntity.polygon.outlineColor = Cesium.Color.LIME;
          // 设置实体信息的相关描述
          var featureName = pickedEntity.name;
          selectedEntity.name = featureName;
          selectedEntity.description =
            'Loading <div class="cesium-infoBox-loading"></div>';
          // 将当前的实体设置为系统选中的实体
          viewer.selectedEntity = selectedEntity;
          selectedEntity.description =
            '<table class="cesium-infoBox-defaultTable"><tbody>' +
            "<tr><th>BIN</th><td>" +
            pickedEntity.name +
            "</td></tr>" +
            "<tr><th>DOITT ID</th><td>" +
            pickedEntity.id +
            "</td></tr>" +
            "<tr><th>SOURCE ID</th><td>" +
            pickedEntity.name +
            "</td></tr>" +
            "<tr><th>Longitude</th><td>" +
            pickedEntity.name +
            "</td></tr>" +
            "<tr><th>Latitude</th><td>" +
            pickedEntity.name +
            "</td></tr>" +
            "<tr><th>Height</th><td>" +
            pickedEntity.name +
            "</td></tr>" +
            "<tr><th>Terrain Height (Ellipsoid)</th><td>" +
            pickedEntity.name +
            "</td></tr>" +
            "</tbody></table>";
        }
      }
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  methods: {
    ...mapMutations(["addWaterHeight", "setPickPosition"]),
    add() {
      this.addWaterHeight();
      // this.setPickPosition(1)
      console.log("+");
    }
  }
};
</script>

<style lang="scss" scoped>
#label-model {
  position: absolute;
  top: 2em;
  left: 28em;
  z-index: 1000;
}
</style>
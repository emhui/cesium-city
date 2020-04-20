<template>
  <a-tree
    v-if="show"
    class="tree"
    checkable
    checkStrictly
    :showLine="true"
    @expand="onExpand"
    :expandedKeys="expandedKeys"
    :autoExpandParent="autoExpandParent"
    v-model="checkedKeys"
    @select="onSelect"
    :selectedKeys="selectedKeys"
    :treeData="treeData"
    @check="onChecked"
  />
</template>
<script>
import { mapState, mapMutations, mapGetters } from "vuex";
import Bus from "../store/eventBus";

var Cesium = require("cesium/Cesium");
let viewer = null;

export default {
  data() {
    return {
      expandedKeys: [],
      autoExpandParent: false,
      checkedKeys: [],
      selectedKeys: [],
      treeData: null,
      show: false
    };
  },
  mounted() {
    viewer = this.$store.state.viewer;
    var _this = this;
    this.$http.get("data/treeData.json").then(response => {
      console.log(response.data);
      _this.treeData = response.data;
      _this.setInitSelected(_this.treeData);
      _this.show = true;
    });
  },
  methods: {
    ...mapMutations(["updateAIStatus", "updateRainStatus"]),
    onExpand(expandedKeys) {
      // console.log("onExpand", expandedKeys);
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onSelect(selectedKeys, info) {
      console.log("onSelect", info);
      this.selectedKeys = selectedKeys;
    },
    onChecked(checkedKey, e) {
      var key = e.node.value;
      var checked = e.checked;
      switch (key) {
        case "weather":
          Bus.$emit("update-rain", checked);
          Bus.$emit("show-river-data-pop", checked);
          this.updateRainStatus(checked)
          break;
        case "warning":
          this.updateAIStatus(checked)
          break;
        case "video":
          Bus.$emit("open-video", checked);
          break;
        case "inspection":
          Bus.$emit("open-inspection", checked);
          break;
        case "home":
          Bus.$emit("back-home", checked);
          break;
        case "pump":
          Bus.$emit("open-pump", checked);
          Bus.$emit("move-to-pump", checked);
          break;
        case "gate":
          Bus.$emit("move-to-gate", checked);
          break;
        case "gate00":
          Bus.$emit("show-gate-panel", checked, 0);
          break;
        case "gate01":
          Bus.$emit("show-gate-panel", checked, 1);
          break;
        case "gate02":
          Bus.$emit("show-gate-panel", checked, 2);
          break;
        case "gate03":
          Bus.$emit("show-gate-panel", checked, 3);
          break;
        case "gate04":
          Bus.$emit("show-gate-panel", checked, 4);
          break;
        case "gate05":
          Bus.$emit("show-gate-panel", checked, 5);
          break;
        case "gate06":
          Bus.$emit("show-gate-panel", checked, 6);
          break;
        case "support-gate":
          Bus.$emit("move-to-support-gate", checked);
          break;
        case "bim":
          Bus.$emit("show-hide-model", checked);
          break;
        case "shuizhan":
          Bus.$emit("show-hide-shuizhan", checked)
          break;
        case "bengfang":
          Bus.$emit("show-hide-bengfang", checked)
          break;
        case "zhiyuanfa":
          Bus.$emit("show-hide-zhiyuanfa", checked)
          break;
        case "terrain":
          viewer.scene.globe.depthTestAgainstTerrain = checked;
          break;
        case "photography":
          this.$message.warning("开发中...");
          break;
        case "yaojiang":
          Bus.$emit("show-hide-yuyaojiang", checked)
          break;
        case "cijiang":
          Bus.$emit("show-hide-cijiang", checked)
          break;
        case "canal":
          Bus.$emit("show-hide-canal", checked)
          break;
        default:
          break;
      }
    },
    // 根据json中的数据，默认选择部分节点
    setInitSelected(treeData) {
      treeData.forEach(data => {
        if (data.checked) {
          this.checkedKeys.push(data.key);
        }
        if (data.children) {
          this.setInitSelected(data.children);
        }
      });
    }
  }
};
</script>

<style scoped>
.tree {
  position: absolute;
  top: 4em;
  left: 2em;
  min-width: 150px;
  text-align: left;
  background: rgba(42, 42, 42, 0.7);
  border-radius: 2px;
  z-index: 1000;
}
</style>
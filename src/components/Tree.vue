<template>
  <a-tree
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
const treeData = [
  {
    title: "实时数据",
    key: "0-0",
    checked: false,
    children: [
      {
        title: "实时天气",
        key: "0-0-0",
        value: "weather",
        checked: true
      },
      {
        title: "智能预警",
        key: "0-0-1",
        value: "warning",
        checked: true
      },
      {
        title: "实时视频",
        key: "0-0-2",
        value: "video",
        checked: true
      },
      {
        title: "沿线巡检",
        key: "0-0-3",
        value: "inspection",
        checked: true
      }
    ]
  },
  {
    title: "运行控制",
    key: "0-1",
    checked: true,
    children: [
      {
        title: "泵房控制",
        key: "0-1-0",
        value: "pump",
        checked: true
      },
      {
        title: "水闸控制",
        key: "0-1-1",
        value: "gate",
        checked: true
      },
      {
        title: "支援阀控制",
        key: "0-1-2",
        value: "support-gate",
        checked: true
      },
      {
        title: "开启地形",
        key: "0-1-3",
        value: "terrain",
        checked: true
      }
    ]
  },
  {
    title: "地理数据",
    key: "0-2",
    checked: true,
    children: [
      {
        title: "BIM模型",
        key: "0-2-0",
        value: "bim",
        checked: true
      },
      {
        title: "倾斜摄影",
        key: "0-2-1",
        value: "photography",
        checked: true
      },
      {
        title: "姚江",
        key: "0-2-2",
        value: "yaojiang",
        checked: true
      },
      {
        title: "慈江",
        key: "0-2-3",
        value: "cijiang",
        checked: true
      },
      {
        title: "水渠",
        key: "0-2-4",
        value: "canal",
        checked: false
      }
    ]
  }
];

export default {
  data() {
    return {
      expandedKeys: [],
      autoExpandParent: false,
      checkedKeys: ["0-0-0"],
      selectedKeys: [],
      treeData,
      show: false
    };
  },
  mounted(){
    this.setInitSelected(treeData)
  },
  watch: {
    /* checkedKeys(val) {
      console.log("onCheck", val);
    } */
  },
  methods: {
    onExpand(expandedKeys) {
      console.log("onExpand", expandedKeys);
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onCheck(checkedKeys) {
      console.log("onCheck", checkedKeys);
      this.checkedKeys = checkedKeys;
    },
    onSelect(selectedKeys, info) {
      console.log("onSelect", info);
      this.selectedKeys = selectedKeys;
    },
    onChecked(checkedKey, e){
      console.log(e.node.value);
      console.log(e.checked);
      
    },
    setInitSelected(treeData){
      treeData.forEach( data => {
        if (data.checked) {
          this.checkedKeys.push(data.key)
        }
        if (data.children){
          this.setInitSelected(data.children)
        }
      })
    }
  }
};
</script>

<style scoped>
.tree {
  width: 200px;
  border: 1px solid #1890ff;
  text-align: left;
  margin: 10px 0 0 10px;
  border-radius: 2px;
}
</style>
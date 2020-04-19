<template></template>

<script>
import { mapState, mapMutations } from "vuex";
import Bus from "../store/eventBus";

export default {
  mounted() {
    // 更新河流的水位，水速等数据
    /*     setInterval(() => {
      this.riverData.forEach(element => {
        element.speed.current = element.speed.min + Math.random()*element.speed.range
        element.level.current = element.level.min + Math.random()*element.level.range
      });
      Bus.$emit("update-river-data")
    }, 5000); */
    /*     setInterval(() => {
      this.riverData.forEach(element => {
        element.speed.current = element.speed.min
        element.level.current = element.level.min
      });
      Bus.$emit("update-river-data")
    }, 1000); */
/*     Bus.$on("update-river-data", () => {
      this.riverData.forEach(element => {
        element.speed.current = element.speed.min;
        element.level.current = element.level.min;
      });
    }); */
  },
  computed: {
    ...mapState(["riverData"])
  }
};
</script>

<style>
</style>

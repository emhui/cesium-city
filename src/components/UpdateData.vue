<template></template>

<script>
import { mapState, mapMutations } from "vuex";
import Bus from "../store/eventBus";

export default {
  data() {
    return {
      interval: null // 一个定时器，每5s更新一次数据
    };
  },
  mounted() {
    var _this = this;
    _this.startUpdateData();
    Bus.$on("start-update-data-in-normal", () => {
      _this.startUpdateData();
    });
    Bus.$on("clear-update-data-in-normal", () => {
      _this.clearUpdatdaData();
    });
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
  methods: {
    startUpdateData() {
      this.clearUpdatdaData();
      // 更新河流的水位，水速等数据
      this.interval = setInterval(() => {
        this.riverData.forEach(element => {
          element.speed.current =
            element.speed.min + Math.random() * element.speed.range;
          element.level.current =
            element.level.min + Math.random() * element.level.range;
        });
        Bus.$emit("update-river-data");
      }, 3000);
    },
    clearUpdatdaData() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  },
  computed: {
    ...mapState(["riverData"])
  }
};
</script>

<style>
</style>

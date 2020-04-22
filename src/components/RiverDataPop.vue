<template>
  <div>
    <a-card
      class="card"
      ref="card"
      v-show="show"
      :style="{left: toolsDiv.left, top: toolsDiv.top, width: toolsDiv.width}"
      size="small"
      :headStyle="headStyle"
      :bodyStyle="bodyStyle"
    >
      <a slot="extra" @click="hide">x</a>
      <h2 slot="title" @mousedown="mousedown">#实时水位</h2>

      <template class="ant-card-actions">
        <a-row :gutter="[24,8]" style="text-align: center">
          <a-col :span="12">
            <a-card title="内河" size="small">
              <h4>{{showInlandWaterLevel}}m</h4>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="外河" size="small">
              <h4>{{showOutlandWaterLevel}}m</h4>
            </a-card>
          </a-col>
        </a-row>
      </template>
      <div v-show="getCurrentWarningLevel(showInlandWaterLevel)">
        <a-divider type="horizontal" />
        <p class="warning">汛期：未来三天强降雨期</p>
           <p>预警：{{getCurrentWarningLevel(showInlandWaterLevel)}}级</p>
      </div>
    </a-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Bus from "../store/eventBus";
export default {
  name: "Window",
  props: {
    titlex: String,
    id: [String, Number]
  },
  data() {
    return {
      title: "标题",
      selectElement: "",
      show: false,
      toolsDiv: {
        left: "200px",
        top: "4em",
        width: "220px"
      },
      headStyle: {},
      bodyStyle: {
        textAlgin: "center"
      }
    };
  },
  mounted() {
    Bus.$on("show-river-data-pop", checked => {
      this.show = checked;
    });
  },
  computed: {
    ...mapGetters([
      "showOutlandWaterLevel",
      "showInlandWaterLevel",
      "getCurrentWarningLevel"
    ])
  },
  methods: {
    hide() {
      this.show = false;
    },
    mousedown(event) {
      this.selectElement = this.$refs.card.$el;
      var div1 = this.selectElement;
      this.selectElement.style.cursor = "move";
      this.isDowm = true;
      var distanceX = event.clientX - this.selectElement.offsetLeft; // 鼠标相对于
      var distanceY = event.clientY - this.selectElement.offsetTop;
      document.onmousemove = function(ev) {
        var oevent = ev || event;
        div1.style.left = oevent.clientX - distanceX + "px";
        div1.style.top = oevent.clientY - distanceY + "px";
      };
      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
        div1.style.cursor = "default";
      };
    }
  }
};
</script>

<style scoped>
.card {
  position: absolute;
  z-index: 1000;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  text-align: left;
}

p {
  line-height: 1;
}
</style>
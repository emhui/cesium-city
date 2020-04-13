<template>
  <div>
    <a-collapse class="collapse" v-model="activeKey" expandIconPosition="right" accordion>
      <a-collapse-panel header="阀门" key="1">
        <a-list :grid="{ gutter: 16,  column: 4}" :dataSource="valves" size="small">
          <a-list-item slot="renderItem" slot-scope="item, index">
            <a-card :title="item.entity.name" size="small">
              <a-switch
                checkedChildren="开"
                unCheckedChildren="关"
                :checked="item.status"
                size="small"
                @change="changeValves($event,index)"
              />
            </a-card>
          </a-list-item>
        </a-list>
      </a-collapse-panel>

      <a-collapse-panel header="河流" key="2" :disabled="false">
        <a-list itemLayout="horizontal" :dataSource="rivers">
          <a-list-item slot="renderItem" slot-scope="item, index">
            <a-list-item-meta>
              <a slot="title">{{ item.name }}</a>
              <!--               <a-avatar slot="avatar" src="http://127.0.0.1:9090/public/image/river.png" /> -->
              <a-avatar slot="avatar" :src="riverIcon" />
            </a-list-item-meta>
            <a-switch
              slot="actions"
              checkedChildren="升"
              unCheckedChildren="降"
              :checked="item.height !== 0"
              size="small"
              @change="changeRivers($event, index)"
            />
            <a-input-number
              slot="actions"
              id="inputNumber"
              :min="0"
              :max="10"
              :value="item.height | showHeight"
              size="small"
              @change="changeHeight($event, index)"
            />
          </a-list-item>
        </a-list>
      </a-collapse-panel>

      <a-collapse-panel header="其他" key="3">
        <a-list itemLayout="horizontal">
          <a-list-item>
            <a-checkbox slot="actions" @change="changeRain">下雨</a-checkbox>
          </a-list-item>
          <a-list-item>
            <a-dropdown slot="actions">
              <a-menu slot="overlay" @click="clickWander">
                <a-menu-item key="1">路线1</a-menu-item>
                <a-menu-item key="2">路线2</a-menu-item>
                <a-menu-item key="3">路线3</a-menu-item>
              </a-menu>
              <a-button>
                开始漫游
                <a-icon type="down" />
              </a-button>
            </a-dropdown>
            <a-switch
              checkedChildren="继续"
              unCheckedChildren="暂停"
              slot="actions"
              @change="changeWander"
            />
          </a-list-item>
        </a-list>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from "vuex";
import Bus from "../store/eventBus";

export default {
  data() {
    return {
      activeKey: ["2"], // 默认激活第几个页面
      riverIcon: require("../assets/river.png") // 河流的图标
    };
  },
  methods: {
    // 阀门变化事件
    changeValves(checked, index) {
      this.setValvesStatus({ index: index, checked: checked });
      Bus.$emit("update-valve", checked, index);
    },
    // 河流事件
    changeRivers(checked, index) {
      // 涨水降水
      Bus.$emit("rise-river", checked, index);
    },
    // 高度改变事件
    changeHeight(height, index) {
      // 改变河流高度
      this.updateRiversHeight({ index: index, height: height });
      Bus.$emit("update-river-height", index, height);
    },
    // 下雨事件
    changeRain(e) {
      Bus.$emit("update-rain", e.target.checked);
    },
    // 开始漫游事件
    clickWander(e) {
      Bus.$emit("start-wander");
    },
    changeWander(e) {
      Bus.$emit("change-wander", e);
    },
    ...mapMutations([
      "setValvesStatus",
      "setRiversStatus",
      "updateRiversHeight"
    ])
  },
  computed: {
    ...mapState(["valves", "rivers"]),
    ...mapGetters(["showValves"])
  },
  watch: {
    activeKey(key) {
      console.log(key);
    }
  },
  filters: {
    showHeight(value) {
      return Math.ceil(value);
    }
  }
};
</script>

<style lang="scss" scoped>
.collapse {
  position: absolute;
  top: 2em;
  left: 2em;
  width: 300px;
  /* top | right | bottom | left */
  margin: 10px 0px 0px 10px;
  z-index: 1000;
}
</style>
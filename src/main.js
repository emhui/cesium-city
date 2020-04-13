import Vue from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import router from './router'
import Cesium from 'cesium/Cesium'
import widget from 'cesium/Widgets/widgets.css'
import axios from 'axios'
import store from '@/store/index'
import 'ant-design-vue/dist/antd.less'

window.Cesium = Cesium

// 访问public下的文件
Vue.prototype.$baseUrl = process.env.BASE_URL
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(Antd) // 一个UI组件库

new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>',
  store:store,
})

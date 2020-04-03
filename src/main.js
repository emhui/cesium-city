import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Cesium from 'cesium/Cesium'
import widget from 'cesium/Widgets/widgets.css'
import axios from 'axios'

window.Cesium = Cesium

// 访问public下的文件
Vue.prototype.$baseUrl = process.env.BASE_URL
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

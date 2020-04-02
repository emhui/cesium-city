import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Cesium from 'cesium/Cesium'
import widget from 'cesium/Widgets/widgets.css'

window.Cesium = Cesium

Vue.prototype.$baseUrl = process.env.BASE_URL

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

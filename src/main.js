import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './quasar'
import VueAMap from 'vue-amap';
// import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';
// Vue.use(Antd);
Vue.config.productionTip = false

VueAMap.initAMapApiLoader({
    key: 'ee1c92b84f6183e95149bff5139072b3',
    // key: '1b4d55465f98f3302bf7ac47d8edc721',
    plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.Geocoder', "AMap.Geolocation","AMap.TruckDriving"],
    // v: '1.4.15',
    v: '1.4.15',
    uiVersion: '1.1',// 版本号
    //   uiVersion: '1.0',// 版本号
});
Vue.use(VueAMap);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

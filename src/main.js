import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './quasar'
import VueAMap from 'vue-amap';
Vue.config.productionTip = false

VueAMap.initAMapApiLoader({
    key: '676423a4566870e46fc99bce762bfd48',
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

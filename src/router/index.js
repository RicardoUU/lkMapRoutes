import Vue from 'vue'
import VueRouter from 'vue-router'
import RouteMap from '../views/RouteMap.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'RouteMap',
    component: RouteMap
  },
]

const router = new VueRouter({
  routes
})

export default router

<template>
    <div class>
        <q-layout view="hHh LpR fFf" style="height: 90vh" class="shadow-2 rounded-borders">
            <q-header bordered class="bg-white text-primary">
                <q-toolbar>
                <q-toolbar-title class="text-center">
                    <q-avatar>
                    <img src="../assets/logo1.png">
                    </q-avatar>
                        智能路线规划
                </q-toolbar-title>
                </q-toolbar>
            </q-header>
            <q-footer elevated class="bg-white text-primary">
                <q-toolbar>
                    <q-btn flat @click="drawer = !drawer" round dense icon="search" />

                    <q-toolbar-title class="cursor-pointer" @click="drawer = !drawer">路线规划</q-toolbar-title>
                    <q-btn flat @click="drawerRight = !drawerRight" round dense icon="directions" />
                </q-toolbar>
            </q-footer>

            <q-drawer v-model="drawer" overlay :breakpoint="500" :width="300">
                <q-scroll-area
                    style="height: calc(100% - 150px);border-right: 1px solid #ddd"
                >
                    <q-list padding>
                        <q-item>
                            <q-select
                                
                                clearable
                                emit-value
                                map-options
                                v-model="startPoint"
                                :options="startPointOptions"
                                label="起点"
                                class="fit"
                            />
                        </q-item>

                        <q-item>
                            <q-select
                                clearable
                                multiple
                                emit-value
                                map-options
                                use-chips
                                max-values='100'
                                input-debounce="200"
                                option-value="posData"
                                option-label="shop_name"
                                v-model="destination"
                                :options="destinationOptions"
                                label="目的地"
                                class="fit"
                                @filter="desFilter"
                                transition-show="scale"
                                transition-hide="scale"
                                ref="destRef"
                            >
                                <template v-slot:no-option>
                                    <q-item>
                                        <!-- <q-input debounce="1000" autofocus label="门店名称" v-model="filterValue" class="fit"/>  -->
                                        <q-input  autofocus label="门店名称" v-model="filterValue" class="fit">
                                            <template v-slot:append>
                                                <!-- <q-icon name="search" /> -->
                                                <q-btn flat round color="primary" icon="search" @click="shopsFilter"/>
                                            </template>
                                        </q-input>
                                    </q-item>
                                    <q-item>
                                        <q-item-section class="text-grey">
                                        无结果
                                        </q-item-section>
                                    </q-item>
                                </template>
                                <template v-slot:before-options>
                                    <q-item>
                                        <q-input label="门店名称" v-model="filterValue" class="fit">
                                            <template v-slot:append>
                                                <!-- <q-icon name="search" /> -->
                                                <q-btn round flat size="small" color="primary" icon="search" @click="shopsFilter"/>
                                            </template>
                                        </q-input>
                                    </q-item>
                                </template>
                            </q-select>
                        </q-item>
                        <q-item class="justify-center">
                            <q-btn color="white" text-color="black" label="查询路线" @click="search">
                                <q-inner-loading :showing="loading">
                                    <q-spinner-facebook size="20px" color="primary" />
                                </q-inner-loading>
                            </q-btn>
                            
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                                规划结果：
                                {{routesRes}}
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                                总距离：
                                {{distance}}
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-ripple>
                            <q-item-section>
                                全程时间：
                                {{time}}
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-scroll-area>
            </q-drawer>

            <q-drawer
                side="right"
                v-model="drawerRight"
                bordered
                :width="300"
                content-class="bg-grey-3"
                overlay
                :breakpoint="500"
            >
                <q-scroll-area class="fit">
                    <div id="routeResult"></div>
                </q-scroll-area>
            </q-drawer>

            <q-page-container>
                <q-page class="row">
                    <transition
                        appear
                        enter-active-class="animated fadeIn"
                        leave-active-class="animated fadeOut"
                    >
                        <el-amap
                            ref="map"
                            vid="amapDemo"
                            :amap-manager="amapManager"
                            :center="center"
                            :zoom="zoom"
                            :plugin="plugin"
                            :events="events"
                            class="amap-demo col-12"
                            v-show="!loading"
                        >
                            <el-amap-marker vid="component-marker" :position="center"></el-amap-marker>
                        </el-amap>
                    </transition>
                    <q-inner-loading :showing="loading">
                        <q-spinner-facebook size="50px" color="primary" />
                    </q-inner-loading>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
import { getDistance_SD, getDesList } from '@/api/index'
import { Permutation, combo } from '@/common/index'
let amapManager = new AMapManager();
let drivingObj = '';

/**
 * @description 这是个NPC问题  无终点最短路径问题，可转化为最短哈密顿路径问题
 * 
 * 核心为：对路径求出最短路径再使用高德渲染
 * 最短路径：对途径点排列 求两两间距离，对途径点全排序求出最短路径
 * 可使用最短路径算法
 * 
 * @param <get url> url参数 route=1,2,3   门店 shop_num  逗号隔开
 */
export default {
    data() {
        let self = this;
        return {
            amapManager: amapManager,
            zoom: 13,
            center: [117.209189, 31.718411],
            events: {
                init: o => {
                    (this.$refs.map.$$getInstance());
                    localStorage.removeItem("_AMap_raster");
                    o.getCity(result => {
                        console.log(result);
                    });
                    lazyAMapApiLoaderInstance.load().then(() => {
                        self.createMap();
                    });
                },
                moveend: () => {},
                zoomchange: () => {}
                // click: e => {
                //     alert("map clicked");
                //     console.log(e)
                // }
            },
            plugin: [
                "ToolBar",
                {
                    pName: "MapType",
                    defaultType: 0,
                    events: {
                        init(o) {
                            console.log(o);
                        }
                    }
                }
            ],
            drawer: true,
            drawerRight: false,
            filterValue:'',
            startPoint: {longitude:117.209189, latitude:31.718411, key:'origin'},
            destination: [],
            routes: [],
            routesRes: '',
            distance: 0,
            time: "",
            destinationOptions:[],
            comboDistance: {},
            minRoutesObj:{
                distance:0,
                routes:[],
            },
            oriToFirstDestDist:{},
            drivingObj: '',
            loading:false,
            count:1
        };
    },

    computed: {
        startPointOptions() {
            return [
                {
                    label: "招商局",
                    value: {longitude:117.209189, latitude:31.718411, key:'origin'},
                   
                }
            ];
        },

    },
    async mounted() {
        await this.getDesList();
        if(this.$route.query.route) {
            let shops = this.$route.query.route.split(',');
            this.destination = await this.initShops(shops);
            this.search();
        }
    },

    methods: {
        // 初始化url参数门店
        async initShops(shops) {
            let dest = [];
            await shops.forEach(sitem=>{
                for (let dindex = 0; dindex < this.destinationOptions.length; dindex++) {
                    const element = this.destinationOptions[dindex];
                    if(sitem===element.shop_num){
                        console.log(element)
                        dest.push({
                            ...element
                        })
                    }
                    if(dest.length === shops.length) {
                        break;
                    }
                }
            })
            return dest;
            
        },
        async search() {
            this.loading = true;
            this.comboDistance = {}
            this.resetModel();
            if(!this.destination  || this.destination.length<1) {
                this.loading = false;
                return;
            }
            let comboList = combo(this.destination,2);
            try{
                /**
                 * 可优化为异步请求 除去await 
                 * ps：弄不明白 0v0
                 */
                for(let cindex = 0;cindex<comboList.length;cindex++) {
                    await this.getDistance_SD(comboList[cindex][0],comboList[cindex][1]);
                    continue;
                }
                console.log(this.comboDistance)
                await this.getMinDistanceRoutes();
                // await this.getMiniRoutes_greedy();
            }catch(err){
                this.loading = false;
            }

        },

        async getDesList(filter) { // 获取门店列表
            /**
             * quasar列表是虚拟dom 动态渲染  100w条也不会卡 直接请求全部的数据就行
             */
            let params = {
                page_size:100000,
                page_num:1,
                keyword:filter||''
            }
            await getDesList(params).then(res => {
                // console.log(res)
                if(res.data.success) {
                    let data = [];
                    if(res.data.data && res.data.data.length>0){
                        res.data.data.forEach(element => {
                            element.posData = {
                                longitude: element.longitude, 
                                latitude: element.latitude,
                                shop_num: element.shop_num,
                                shop_name: element.shop_name,
                            };
                            data.push(element);
                        });
                        this.destinationOptions = Object.freeze(data);
                    }else{
                        this.destinationOptions=null;
                    }
                    
                }
            })
        },
        desFilter(val, update) {
            // let selt = this;
            let data = val;
            if(!data) {
                this.getDesList();
            }else{
                this.getDesList(data);

            }
            setTimeout(() => {
                update(() => {
                    this.getDesList(data);
                },
                )
            }, 1000)   
        },
        shopsFilter() {
            this.$refs.destRef.filter(this.filterValue)
        },
        createMap() {

        },

        // 计算两点距离
        async getDistance_SD(ori, dis) {
            let res = await getDistance_SD(ori, dis);
            this.comboDistance[`${ori.shop_num}-${dis.shop_num}`] = parseInt(res.data.route.paths[0].distance);
            this.comboDistance[`${dis.shop_num}-${ori.shop_num}`] = parseInt(res.data.route.paths[0].distance);
            res = null;
        },
        // 获取最短路径 -- 全排序
        async getMinDistanceRoutes() {
            await this.getOriToFirstItemDis();
            let permts = new Permutation(this.destination);                                             //对路径进行全排序
            await permts.run(0);
            let result = permts.result;
            console.log(result);
            let firstItem = result[0]; // 第一条路径
            let minDis = 0;            // 最小距离
            minDis += this.oriToFirstDestDist[`${this.startPoint.key}-${firstItem[0].shop_num}`];        //加上起点距离
            for(let findex = 0;findex < firstItem.length-1;findex++) {       
                let nextDis = this.comboDistance[`${firstItem[findex].shop_num}-${firstItem[findex+1].shop_num}`]; // 第一条路径距离
                minDis += nextDis;
            }

            this.minRoutesObj.routes = firstItem;

            for(let rindex=1; rindex < result.length; rindex++) {                                      // 求全排序路径距离
                let pitem = result[rindex];
                let dis=0;
                dis += this.oriToFirstDestDist[`${this.startPoint.key}-${pitem[0].shop_num}`];          //加上起点距离
                /**
                 * 可优化剪纸路径
                 */
                for(let pindex=0; pindex < pitem.length-1; pindex++) {
                    let nextDis = this.comboDistance[`${pitem[pindex].shop_num}-${pitem[pindex+1].shop_num}`];
                    dis += nextDis;
                    if(dis >= minDis){ // 剪枝
                        break;
                    }
                }
                // console.log(dis)
                if(dis < minDis) {
                    minDis = dis;
                    this.minRoutesObj.routes = result[rindex];
                    // console.log(this.minRoutesObj)
                }
            }
            

            this.minRoutesObj.distance = minDis;
            this.paintMap(this.minRoutesObj.routes);
            this.formaterRes();
            this.loading = false;
            result = null;
            
        },

        // 贪心策略
        async getMiniRoutes_greedy() {
            this.loading = false;
            await this.getOriToFirstItemDis();

            const initDistanceMap = {...this.oriToFirstDestDist,...this.comboDistance};
            const minRoutes = [...this.initMinRoutes()];

            for(let dindex = 1; dindex < this.destination.length; dindex++) {
                const lastMinRoute = minRoutes[minRoutes.length-1];                                               // 获取选择点的最后一个
                const tampDestination = [...this.destination].filter(dItem=> {                                    // 获取未选中最小路径内的点
                    return !minRoutes.some(minRouteItem=>minRouteItem.shop_num === dItem.shop_num);
                });

                let tampDis = initDistanceMap[`${lastMinRoute.shop_num}-${tampDestination[0].shop_num}`]; 
                let tampRoute = tampDestination[0];

                // 获取下一次前往最近的点
                for(let tampIndex = 1; tampIndex < tampDestination.length; tampIndex++) {
                    const elementDis = initDistanceMap[`${lastMinRoute.shop_num}-${tampDestination[tampIndex].shop_num}`];
                    if(elementDis < tampDis) {
                        tampDis = elementDis;
                        tampRoute = tampDestination[tampIndex];
                    }
                }
                minRoutes.push(tampRoute);
                // console.log(initDistanceMap)
                // console.log(tampDestination)
                // console.log(tampDis)
                console.log(minRoutes)
                

            }
            this.sliceRoutesPaint(minRoutes);
            

        },

        initMinRoutes() { // 初始化最小路径数组-- 起点-第一个点
            let minDis = this.oriToFirstDestDist[`${this.startPoint.key}-${this.destination[0].shop_num}`];
            let routes = [this.destination[0]];
            
            for(let dindex=1; dindex < this.destination.length; dindex++) {
                const tampDis = this.oriToFirstDestDist[`${this.startPoint.key}-${this.destination[dindex].shop_num}`];
                if(tampDis < minDis) {
                    minDis = tampDis;
                    routes[0] = this.destination[dindex];
                }
            }
            return [this.startPoint,...routes];
        },
        // 格式化输出结果
        formaterRes() {
            this.routesRes = '招商局→'
            this.minRoutesObj.routes.forEach((ritem,rindex)=>{
                if(rindex < this.minRoutesObj.routes.length-1) {
                    this.routesRes += ritem.shop_name + '→'
                }else{
                    this.routesRes += ritem.shop_name;
                }
            })
        },
        // 获取起点-路径首个点的距离 
        async getOriToFirstItemDis() {
            this.oriToFirstDestDist = {}
            for(let cindex = 0;cindex<this.destination.length;cindex++) {
                let res =  await getDistance_SD(this.startPoint,this.destination[cindex])
                this.oriToFirstDestDist[`${this.startPoint.key}-${this.destination[cindex].shop_num}`] = parseInt(res.data.route.paths[0].distance);
                res = null;
                continue;
            }
        },
        // 规划结果路径转化为path
        parseRouteToPath(route) {
            var path = []
            for (var i = 0, l = route.steps.length; i < l; i++) {
                var step = route.steps[i]

                for (var j = 0, n = step.path.length; j < n; j++) {
                    path.push(step.path[j])
                }
            }
            return path
        },
        // 自定义绘制
        drawRoute (result,map) {
            let path = this.parseRouteToPath(result.routes[0])
            let startMarker = new AMap.Marker({
                position: result.start.location,
                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
                map: map
            })

            let endMarker = new AMap.Marker({
                position: result.end.location,
                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
                map: map
            })
            let routeLine = new AMap.Polyline({
                path: path,
                isOutline: true,
                outlineColor: '#ffeeee',
                borderWeight: 2,
                strokeWeight: 5,
                strokeColor: '#0091ff',
                lineJoin: 'round'
            })
            routeLine.setMap(map)
            // 调整视野达到最佳显示区域
            map.setFitView([ startMarker, endMarker ,routeLine]);
            (new AMap.DrivingRender()).autoRender({
                data: result,
                map: map,
                panel: "routeResult",
                hideMarkers:true,
            });
        },
        // 途径大于16个点分段绘制
        async sliceRoutesPaint(routes) {
            if(drivingObj) {
                drivingObj.clear();
            }
            console.log(routes)
            const sliceNum = Math.ceil(routes.length/16);
            let resultList = [];
            for(let index=0; index < sliceNum; index++) {
                // this.paintMap
                let route = [];
                if(index !== sliceNum-1 ){
                    route = routes.slice(index*16,index*16 + 16);
                }else{
                    route = routes.slice(index*16,routes.length);
                }
                const result = await this.drivingForCallback(route);
                resultList.push(result);
            }

            console.log(resultList);

            // this.formaterRes();
            // this.loading = false;

            // const 
        },
        // 绘制地图路径--- 全排序
        paintMap(routes) {
            let origin = new AMap.LngLat(this.startPoint.longitude, this.startPoint.latitude);
            let destination = new AMap.LngLat(routes[routes.length-1].longitude, routes[routes.length-1].latitude);
            let opts ={};
            let waypoints = routes.slice(0,routes.length-1);
            opts.waypoints = waypoints.map(item=>{
                return new AMap.LngLat(item.longitude, item.latitude);
            })
            let _this = this;
            AMap.plugin(["AMap.Driving"], async function() {
                let drivingOption = {
                    // policy:AMap.DrivingPolicy.LEAST_TIME,
                    // policy:AMap.DrivingPolicy.LEAST_DISTANCE,
                    policy:10,
                    map:amapManager.getMap(),
                    panel: "routeResult",
                    // hideMarkers: true
                };
                if(drivingObj) {
                    drivingObj.clear();
                }
                drivingObj = new AMap.Driving(drivingOption); //构造驾车导航类
                //根据起终点坐标规划驾车路线
                drivingObj.search(origin,destination,opts,function(status,result){
                    console.log(status,result)
                    if (status === 'complete') {
                        if (result.routes && result.routes.length) {
                            // 绘制第一条路线，也可以按需求绘制其它几条路线
                            _this.distance = (parseInt(result.routes[0].distance)/1000).toFixed(2) + '公里';
                            _this.time = (parseInt(result.routes[0].time)/60).toFixed(2)+ '分钟';
                            // 自定义渲染路线结果
                        }
                    } else {
                        console.error('获取驾车数据失败：' + result)
                    }
                    
                });
            });
        },
        // 跟据routes 返回规划结果
        async drivingForCallback(routes) {
            let origin = new AMap.LngLat(routes[0].longitude, routes[0].latitude);
            let destination = new AMap.LngLat(routes[routes.length-1].longitude, routes[routes.length-1].latitude);
            let opts ={};
            let waypoints = routes.slice(1,routes.length-1);
            opts.waypoints = waypoints.map(item=>{
                return new AMap.LngLat(item.longitude, item.latitude);
            })
            // let _this = this;
            return new Promise(function(resolve, reject) {
                // 异步处理
                // 处理结束后、调用resolve 或 reject
                AMap.plugin(["AMap.Driving"], function() {
                    let drivingOption = {
                        // policy:AMap.DrivingPolicy.LEAST_TIME,
                        // policy:AMap.DrivingPolicy.LEAST_DISTANCE,
                        policy:10,
                        map:amapManager.getMap(),
                        // hideMarkers: true
                    };
                    if(drivingObj) {
                        // drivingObj.clear();
                    }
                    drivingObj = new AMap.Driving(drivingOption); //构造驾车导航类
                    //根据起终点坐标规划驾车路线
                    drivingObj.search(origin, destination, opts, (status,result)=>{
                        if (status === 'complete') {
                            resolve(result)
                        } else {
                            reject(result);
                            console.error('获取驾车数据失败：' + result)
                        }
                    });
                });
            });
        },

        handleResults() {
            
        },
        resetModel() {
            // this.routesRes = '';
            // this.distance = 0;
            // this.time = 0;
        }
    }
};
</script>
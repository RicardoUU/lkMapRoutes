<template>
    <div class>
        <q-layout view="hHh LpR fFf" style="height: 90vh" class="shadow-2 rounded-borders">
            <q-footer elevated class="bg-white text-primary">
                <q-toolbar>
                    <q-btn flat @click="drawer = !drawer" round dense icon="search" />

                    <q-toolbar-title class="cursor-pointer" @click="drawer = !drawer">路线规划</q-toolbar-title>
                    <q-btn flat @click="drawerRight = !drawerRight" round dense icon="directions" />
                </q-toolbar>
            </q-footer>

            <q-drawer v-model="drawer" overlay :breakpoint="500" :width="300">
                <q-scroll-area
                    style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
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
                                max-values='16'
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

                <q-img
                    class="absolute-top"
                    :src="require('../assets/material.png')"
                    style="height: 150px"
                >
                    <div class="absolute-bottom bg-transparent">
                        <q-avatar size="56px" class="q-mb-sm">
                            <img src="../assets/logo.jpg" />
                        </q-avatar>
                        <div class="text-weight-bold">智能路径规划</div>
                        <div>ASA DATA LTD</div>
                    </div>
                </q-img>
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
                    <!-- <el-amap class="amap-box col-12" :amap-manager="amapManager" :vid="'amap-vue'"></el-amap> -->
                    <el-amap
                        ref="map"
                        vid="amapDemo"
                        :amap-manager="amapManager"
                        :center="center"
                        :zoom="zoom"
                        :plugin="plugin"
                        :events="events"
                        class="amap-demo col-12"
                    >
                        <el-amap-marker vid="component-marker" :position="center"></el-amap-marker>
                    </el-amap>
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
// import AMap from 'vue-amap';
import { getDistance_SD, getDesList } from '@/api/index'
// import { getDesList } from './api/index'
// import { getDesList } from './common/index'
import { Permutation, combo } from '@/common/index'
let amapManager = new AMapManager();
let drivingObj = '';

/**
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
                    // console.log(o.getCenter());
                    // console.log
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
            loading:false
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
            // console.log(this.$route.query.shops)
            let shops = this.$route.query.route.split(',');
            this.destination = this.initShops(shops);
            this.search();
        }
    },

    methods: {
        initShops(shops) {
            let dest = [];
            shops.forEach(sitem=>{
                for (let dindex = 0; dindex < this.destinationOptions.length; dindex++) {
                    const element = this.destinationOptions[dindex];
                    if(sitem===element.shop_num){
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
            if(!this.destination  || this.destination.length<1) {
                this.loading = false;
                return;
            }
            let comboList = combo(this.destination,2);
            try{
                for(let cindex = 0;cindex<comboList.length;cindex++) {
                    await this.getDistance_SD(comboList[cindex][0],comboList[cindex][1]);
                    continue;
                }
            // console.log(this.comboDistance);
                await this.getMinDistanceRoutes();
                this.loading = false;
            }catch(err){
                this.loading = false;
            }
            

            // console.log(res);
        },

        async getDesList(filter) { // 获取门店列表
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
                        // console.log('sdasda')
                        // Array.length
                    }
                    
                }
            })
        },
        desFilter(val, update) {
            // let selt = this;
            
            let data = val;
            if(!data) {
                this.getDesList();
                // this.$refs.destRef.moveOptionSelection(1, true)
                // this.$refs.destRef.toggleOption(this.$refs.destRef.options[this.$refs.destRef.optionIndex], true)
            }else{
                this.getDesList(data);

            }
            setTimeout(() => {
                update(() => {
                    this.getDesList(data);
                },
                // ref => {
                //     if (val !== '' && ref.options.length > 0 && ref.optionIndex === -1) {
                //         // ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
                //         // ref.toggleOption(ref.options[ref.optionIndex], true) // toggle the focused option
                //     }
                // }
                )
            }, 1000)   
        },
        shopsFilter() {
            // let selt = this;

            this.$refs.destRef.filter(this.filterValue)

            // let data = val;
            // console.log(data)
            // if(!data) {
            //     this.getDesList();
            // }else{
            //     // const needle = data.toLowerCase()
            //     // let res = this.destinationOptions.filter(v => v.shop_name.toLowerCase().indexOf(needle) > -1);
            //     // this.destinationOptions = Object.freeze(res);
            //     console.log(this.$refs.destRef.filter)
            // }
        },
        createMap() {

        },

        // 计算两点距离
        async getDistance_SD(ori, dis) {
            await getDistance_SD(ori, dis).then((res) => {
                // 存储距离对象
                this.comboDistance[`${ori.shop_num}-${dis.shop_num}`] =parseInt(res.data.route.paths[0].distance);
                this.comboDistance[`${dis.shop_num}-${ori.shop_num}`] = parseInt(res.data.route.paths[0].distance);
            }).catch(ex => {
                console.log(ex)
            })
        },
        // 获取最短路径
        async getMinDistanceRoutes() {
            await this.getOriToFirstItemDis();
            let permts = new Permutation(this.destination);                                             //对路径进行全排序
            const result = permts.result;
            let firstItem = result[0]; // 第一条路径
            let minDis = 0;
            minDis+= this.oriToFirstDestDist[`${this.startPoint.key}-${firstItem[0].shop_num}`];        //加上起点距离

            for(let findex = 0;findex<firstItem.length-1;findex++) {                                     // 第一条路径距离
                minDis += this.comboDistance[`${firstItem[findex].shop_num}-${firstItem[findex+1].shop_num}`];
            }

            this.minRoutesObj.routes = firstItem;

            for(let rindex=1; rindex < result.length; rindex++) {                                      // 求全排序路径距离
                let pitem = result[rindex];
                let dis=0;
                dis+= this.oriToFirstDestDist[`${this.startPoint.key}-${pitem[0].shop_num}`];          //加上起点距离
                for(let pindex=0; pindex < pitem.length-1; pindex++) {
                    dis+= this.comboDistance[`${pitem[pindex].shop_num}-${pitem[pindex+1].shop_num}`];
                    if(dis >= minDis){ // 剪枝
                        break;
                    }
                }
                if(dis <= minDis) {
                    minDis = dis;
                    this.minRoutesObj.routes = result[rindex];
                }
            }
            

            this.minRoutesObj.distance = minDis;
            this.paintMap(this.minRoutesObj.routes);
            this.formaterRes()
            // console.log(this.minRoutesObj)
            
        },

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
        // 获取起点-全排序路径首个点的距离 
        async getOriToFirstItemDis() {
            this.oriToFirstDestDist = {}
            for(let cindex = 0;cindex<this.destination.length;cindex++) {
                await getDistance_SD(this.startPoint,this.destination[cindex]).then((res) => {
                    // console.log(res.data)
                    // 存储距离对象
                    this.oriToFirstDestDist[`${this.startPoint.key}-${this.destination[cindex].shop_num}`] =parseInt(res.data.route.paths[0].distance);
                }).catch(ex => {
                    console.log(ex)
                })
                continue;
            }
        },
        // 绘制地图路径
        paintMap(routes) {
            let origin = new AMap.LngLat(this.startPoint.longitude, this.startPoint.latitude);
            let destination = new AMap.LngLat(routes[routes.length-1].longitude, routes[routes.length-1].latitude);
            let opts ={};
            opts.waypoints = routes.map(item=>{
                return new AMap.LngLat(item.longitude, item.latitude);
            })
            let _this = this;
            AMap.plugin(["AMap.Driving"], function() {
                let drivingOption = {
                    // policy:AMap.DrivingPolicy.LEAST_TIME,
                    // policy:AMap.DrivingPolicy.LEAST_DISTANCE,
                    policy:10,
                    map:amapManager.getMap(),
                    panel: "routeResult"
                };
                if(drivingObj) {
                    drivingObj.clear();
                }
                drivingObj = new AMap.Driving(drivingOption); //构造驾车导航类
                //根据起终点坐标规划驾车路线
                drivingObj.search(origin,destination,opts,function(status,result){
                    console.log(status,result)
                    _this.distance = (parseInt(result.routes[0].distance)/1000).toFixed(2) + '公里';
                    _this.time = (parseInt(result.routes[0].time)/3600).toFixed(2)+ '小时';
                });
            });
        }
    }
};
</script>
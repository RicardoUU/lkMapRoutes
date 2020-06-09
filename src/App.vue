<template>
    <div class>
        <q-layout view="hHh LpR fFf" style="height: 90vh" class="shadow-2 rounded-borders">
            <q-footer bordered class="bg-white text-primary">
                <q-toolbar>
                    <q-btn flat @click="drawer = !drawer" round dense icon="search" />

                    <q-toolbar-title class="cursor-pointer" @click="drawer = !drawer">路线规划</q-toolbar-title>
                    <q-btn flat @click="drawerRight = !drawerRight" round dense icon="directions" />
                </q-toolbar>
            </q-footer>

            <q-drawer v-model="drawer" show-if-above :width="250" :breakpoint="400">
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
                                use-input
                                input-debounce="200"
                                option-value="posData"
                                option-label="shop_name"
                                v-model="destination"
                                :options="destinationOptions"
                                label="目的地"
                                class="fit"
                                @filter = "desFilter"
                            >
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                    无结果
                                    </q-item-section>
                                </q-item>
                            </template> 
                            </q-select>
                        </q-item>

                        <q-item class="justify-center">
                            <q-btn color="white" text-color="black" label="查询路线" @click="search" />
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
                    src="https://cdn.quasar.dev/img/material.png"
                    style="height: 150px"
                >
                    <div class="absolute-bottom bg-transparent">
                        <q-avatar size="56px" class="q-mb-sm">
                            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                        </q-avatar>
                        <div class="text-weight-bold">Ricardo</div>
                        <div>@acecamel.com</div>
                    </div>
                </q-img>
            </q-drawer>

            <q-drawer
                side="right"
                v-model="drawerRight"
                show-if-above
                bordered
                :width="250"
                :breakpoint="500"
                content-class="bg-grey-3"
            >
                <q-scroll-area class="fit">
                    <div class id="routeResult"></div>
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
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
// import AMap from 'vue-amap';
import { getDistance_SD, getDesList } from './api/index'
// import { getDesList } from './common/index'
// import { getDesList, Permutation, combo } from './common/index'
let amapManager = new AMapManager();


/**
 * 核心为：对路径求出最短路径再使用高德渲染
 * 最短路径：对途径点排列 求两两间距离，对途径点全排序求出最短路径
 * 可使用最短路径算法
 */
export default {
    data() {
        let self = this;
        return {
            amapManager: amapManager,
            zoom: 13,
            center: [116.303843, 39.983412],
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

            startPoint: [117.209189, 31.718411],
            destination: [],
            routes: [],
            routesRes: '大无畏大无畏大无畏，大无畏大无畏，大无畏大无畏大无畏大无畏，大无畏大无畏大无畏',
            distance: 0,
            time: "",
            destinationOptions:[],
        };
    },

    computed: {
        startPointOptions() {
            return [
                {
                    label: "招商局",
                    value: [117.209189, 31.718411]
                }
            ];
        },
        // destinationOptions() {
        //     return [
        //         {
        //             label: "招商局1",
        //             value: [117.209189, 31.718411]
        //         },
        //         {
        //             label: "招商局2",
        //             value: [117.20918, 31.718411]
        //         },
        //         {
        //             label: "招商局3",
        //             value: [117.20912, 31.718411]
        //         },
        //         {
        //             label: "招商局4",
        //             value: [117.203912, 31.718411]
        //         }
        //     ];
        // }
    },

    mounted() {
        // console.log(AMap())
        this.getDesList();
    },

    methods: {
        search() {
            console.log(this.startPoint);
            console.log(this.destination);
        },

        getDesList(filter) { // 获取门店列表
            let params = {
                    page_size:1000,
                    page_num:1,
                    keyword:filter||''
            }
            getDesList(params).then(res => {
                // console.log(res)
                if(res.data.success) {
                    let data = [];
                    if(res.data.data && res.data.data.length>0){
                        res.data.data.forEach(element => {
                        element.posData = [element.longitude, element.latitude];
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
            }else{
                this.getDesList(data);

            }

            setTimeout(() => {
                update(() => {
                    this.getDesList(data);
                })
            }, 1000)

            
            
            
        },
        createMap() {
            let o = amapManager.getMap();

            var truckDriving = new AMap.TruckDriving({
                map: o,
                // policy: 0, // 规划策略
                size: 1,
                panel: "routeResult"
            });

            var path = [];
            path.push({ lnglat: [116.303843, 39.983412] }); //起点
            path.push({ lnglat: [116.321354, 39.896436] }); //途径
            path.push({ lnglat: [116.407012, 39.992093] }); //终点

            truckDriving.search(path, function(status, result) {
                if (status === "complete") {
                    console.log("获取货车规划数据成功");
                } else {
                    console.log("获取货车规划数据失败：" + result);
                }
                // searchResult即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            });
            // AMap.event.addListener(marker, "click", function(e) {
            //     debugger;
            //     //得到的数据
            // });
            // AMap.event.addListener(marker2, "click", function(e) {
            //     debugger;
            //     //得到的数据
            // });
        },

        // 计算两点距离
        getDistance_SD(ori, dis) {
            getDistance_SD(ori, dis).then(res => {
                console.log(res)
            }).catch(ex => {
                console.log(ex)
            })
        }
    }
};
</script>
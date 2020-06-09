import $ajax from './ajax.js';


 // 获取两点规划距离
export function getDesList(params) {
    let url = 'http://mythoi.cn:9001/api/web/tables/shop/list'
    return $ajax.post(url, params);
}

 // 获取两点规划距离
export function getDistance_SD(originpos, destpos) {
    let url = `https://restapi.amap.com/v3/direction/driving?strategy=10&origin=${originpos[0]},${originpos[1]}&destination=${destpos[0]},${destpos[1]}&extensions=all&key=1b4d55465f98f3302bf7ac47d8edc721`;
    return $ajax.get(url);
}

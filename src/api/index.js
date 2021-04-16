import $ajax from './ajax.js';


 // 获取门店列表
export function getDesList(params) {
    let url = 'https://asa-logi.net/api/web/tables/shop/list'
    return $ajax.post(url, params);
}

 // 获取两点规划距离
export function getDistance_SD(originpos, destpos) {
    let url = `https://restapi.amap.com/v3/direction/driving?strategy=10&origin=${originpos.longitude},${originpos.latitude}&destination=${destpos.longitude},${destpos.latitude}&extensions=all&key=1b4d55465f98f3302bf7ac47d8edc721`;
    return $ajax.get(url);
}

/**
 * 路线规划接口
 * @param {obj} params
 * {
        "transOrderNum": "",
        "currentCoordinate": {
            "coordinateName": "",
            "longitude": "",
            "latitude": ""
        }
    }
 */
export function getRouteByTransId(params) {
    let url = 'https://asa-logi.net/new_api/map/road_planning'
    return $ajax.post(url, params);
}
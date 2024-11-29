<script setup lang="ts">
import BaseMap from "./components/OpenLayers/base.vue";
// import TestMap from './components/OpenLayers/test.vue'
import { data } from "./mock/data.js";
import { loadMapType, overlayType } from "@/enums";
import shiziIcon from "@/assets/imgs/shizi.svg";
import daxiangIcon from "@/assets/imgs/daxiang.svg";
import { ref } from "vue";
import { ILineStyle } from "./type";
import mapData from "@/mock/mapData.js";

const pointList = [
  {
    gps_point: [120.093996, 30.431549],
    gps_title: "开始点位",
    gps_time: "2023-07-05 14:05:06",
    gps_id: 1,
    point_type: overlayType.startPoint,
    point_icon: daxiangIcon,
  },
  {
    gps_point: [119.985883, 30.280393],
    gps_title: "结束点位",
    gps_time: "2023-07-05 14:05:06",
    gps_id: 2,
    point_type: overlayType.endPoint,
    point_icon: shiziIcon,
  },
];
// 地图上标注的移动速度，0-1之间，越大越快
const iconSpeed = 0.01;
// icon的偏移量
const offset = 105;
const baseMapRef = ref(null);

const overLayType = ref([
  { label: "全部", value: "" },
  { label: "起点", value: overlayType.startPoint },
  { label: "终点", value: overlayType.endPoint },
  { label: "路线", value: overlayType.track },
  { label: "动画轨迹", value: overlayType.animation },
]);

const mapType = ref([
  { label: "天地图卫星", value: loadMapType.tianSatelliteMap },
  { label: "天地图街道", value: loadMapType.tianStreetMap },
  { label: "原生默认", value: loadMapType.defaultMap },
  { label: "geojson矢量", value: loadMapType.geoJsonMap },
]);

const selOverLayType = ref("");

const selMapType = ref("");

const mapCenter = ref([119.985883, 30.280393]);

const addMarker = () => {
  const params = {
    pointDataList: pointList,
    anchor: [0.5, 0.5],
    scale: 0.2,
  };
  baseMapRef.value.addMarker(params);
};

const addRoute = () => {
  const routeStyle: ILineStyle = {
    strock: {
      color: "#00A4F7",
      width: 2,
      lineDash: [10, 10],
    },
  };
  const params = {
    routeLines: data,
    routeStyle,
    routeType: "track",
  };
  baseMapRef.value.addRoute(params);
};

const addAnimationMarker = () => {
  const params = {
    routeLines: data,
    speed: iconSpeed,
    offset,
  };
  baseMapRef.value.addAnimationMarker(params);
};

const setMapCenter = () => {
  mapCenter.value = [116.394495, 39.904087];
};

const removeMarkersByType = () => {
  baseMapRef.value.removeMarkersByType(selOverLayType.value);
};

// const loadMapByTypeHandle = () => {
  
// };
</script>

<template>
  <!-- <TestMap /> -->
  <BaseMap
    :routeData="data"
    :allow-mark-return="true"
    :mark-return-delay="0"
    :map-center="mapCenter"
    :load-map-type="selMapType"
    :geojson-data="mapData"
    ref="baseMapRef"
  />
  <div class="mt-2 ml-2">
    <button
      class="bg-blue-500 text-[#fff] p-2 rounded-sm mr-2"
      @click="addMarker"
    >
      添加点位标注
    </button>
    <button
      class="bg-blue-500 text-[#fff] p-2 rounded-sm mr-2"
      @click="addRoute"
    >
      添加路线
    </button>
    <button
      class="bg-blue-500 text-[#fff] p-2 rounded-sm mr-2"
      @click="addAnimationMarker"
    >
      添加动画标记
    </button>
    <button
      class="bg-blue-500 text-[#fff] p-2 rounded-sm mr-2"
      @click="setMapCenter"
    >
      设置中心点
    </button>
    <select v-model="selOverLayType" class="mr-2 p-2 rounded-sm">
      <option v-for="item in overLayType" :value="item.value">
        {{ item.label }}
      </option>
    </select>
    <button
      class="bg-blue-500 text-[#fff] p-2 rounded-sm mr-2"
      @click="removeMarkersByType"
    >
      移除指定覆盖物
    </button>

    <span class="mr-2 ">加载指定的地图类型:</span>
    <select v-model="selMapType" placeholder="选择一个地图类型" class="mr-2 p-2 rounded-sm">
      <option v-for="item in mapType" :value="item.value">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

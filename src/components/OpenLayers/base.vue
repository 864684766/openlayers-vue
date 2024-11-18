<script setup lang="ts">
import { ref, defineProps, onMounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM.js";
import {
  defaults as defaultControls,
  Control,
  Rotate,
  ScaleLine,
} from "ol/control.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import VectorLayer from 'ol/layer/Vector'
import VectorImageLayer from 'ol/layer/VectorImage'
import { Style,Icon,Text,Fill,Stroke } from "ol/style";
import shiziIcon from '@/assets/imgs/shizi.svg'
import daxiangIcon from '@/assets/imgs/daxiang.svg'

import "ol/ol.css";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
});

const mapRef = ref();

/**
 * 地图实例
 */
let mapInstance = null;

/**
 *  添加控件
 * @param map
 */
const addControl = (map) => {
  const compassElement = document.getElementById("compass");
  const compassControl = new Control({ element: compassElement });
  map.addControl(compassControl);
};


/**
 * 创建标记样式
 */
const createMarkerStyle =(iconSrc,title)=>{
  return new Style({
    image: new Icon({
      src: iconSrc,
      anchor: [0.5, 1],
      scale: 0.2,
    }),
    text: new Text({
      text: title,
      offsetY: -50,
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
}

/**
 *  添加标记
 */
const addMarker = (map,curPoint={gps_point:[120.093996, 30.431549],gps_title:'测试点位',gps_time:'2023-07-05 14:05:06',gps_id:1}) => {
  const iconFeature = new Feature({
    geometry: new Point(curPoint.gps_point),
    name: curPoint.gps_title,
    gps_time: curPoint.gps_time,
  });

  iconFeature.setStyle(createMarkerStyle(shiziIcon,curPoint.gps_title))

  const iconFeature1 = new Feature({
    geometry: new Point([119.985883, 30.280393]),
    name: '老北京',
    gps_time: curPoint.gps_time,
  });

  iconFeature1.setStyle(createMarkerStyle(daxiangIcon,'老北京'))
  
  const vectorSource = new VectorSource({features: [iconFeature,iconFeature1]})
  const vectorLayer = new VectorImageLayer({
    source: vectorSource,
  })
  map.addLayer(vectorLayer)
  // 设置为中心点
  map.getView().setCenter(curPoint.gps_point);
};

/**
 * 初始化地图
 */
const initMap = () => {
  // 创建一个自定义的 Zoom 控件
  const rotateControl = new Rotate({});

  const scaleLineControl = new ScaleLine({
    bar: true,
  });

  mapInstance = new Map({
    target: "map-app",
    controls: defaultControls({ attribution: false }).extend([
      rotateControl,
      scaleLineControl,
    ]),
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      projection: "EPSG:4326", // here is the view projection
      center: [120.024029, 30.355764],
      zoom: 14,
    }),
  });

  addControl(mapInstance);
  addMarker(mapInstance)
};

const initZoomClick = () => {
  mapInstance?.getView()?.animate({ zoom: 10 });
};

onMounted(() => {
  initMap();
});
</script>

<template>
  <div id="compass" class="compass-icon" @click="initZoomClick">初始缩放比</div>
  <div id="map-app" ref="mapRef" class="w-full h-1/2" />
</template>

<style scoped>
/* 样式内容 */
/* 在 CSS 中定义指南针图标的样式 */
.compass-icon {
  /* 添加你的样式，例如旋转、颜色等 */
  width: initial;
  position: absolute;
  color: #fff;
  background-color: #00a4f7;
  padding: 10px 5px;
  border-radius: 5px;
  bottom: 10px;
  right: 10px;
  cursor: pointer;
}
</style>

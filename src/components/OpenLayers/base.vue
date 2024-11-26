<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM, Vector as VectorSource } from "ol/source";
import {
  defaults as defaultControls,
  Control,
  Rotate,
  ScaleLine,
} from "ol/control.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorImageLayer from "ol/layer/VectorImage";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import shiziIcon from "@/assets/imgs/shizi.svg";
import daxiangIcon from "@/assets/imgs/daxiang.svg";
import waimaiqishouIcon from "@/assets/imgs/waimaiqishou.svg";

import "ol/ol.css";
import { LineString } from "ol/geom";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  /**
   * 允许动画标注返回
   */
  allowMarkReturn: {
    type: Boolean,
    default: false,
  },
  /**
   * 标注在等待几秒后返回
   */
  markReturnDelay: {
    type: Number,
    default: 5000,
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
const createMarkerStyle = (iconSrc, title) => {
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
        color: "#000",
      }),
      stroke: new Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
  });
};

/**
 * 创建带图像的标记
 * @param curPoint 点位的信息
 * @param icon 图标的路径
 */
const createIconMark = (curPoint, icon) => {
  const iconFeature = new Feature({
    ...curPoint,
    geometry: new Point(curPoint.gps_point),
    name: curPoint.gps_title,
  });
  iconFeature.setStyle(createMarkerStyle(icon, curPoint.gps_title));
  return iconFeature;
};

/**
 *  添加标记
 */
const addMarker = (map, pointData, icon) => {
  const pointMark = createIconMark(pointData, icon);
  const vectorSource = new VectorSource({
    features: [pointMark],
  });
  const vectorLayer = new VectorImageLayer({
    source: vectorSource,
  });
  map.addLayer(vectorLayer);
  return { pointMark };
};

/**
 * 添加路线
 * @param map
 */
const addRoute = (map, routeLines, routeStyle) => {
  /**
   *  创建一条线
   * @param points
   */
  const createSingleRoute = (route) => {
    const source = new VectorSource();
    const linePath = new LineString(route);
    const routeFeature = new Feature({
      geometry: linePath,
    });
    source.addFeature(routeFeature);
    const routeLayer = new VectorImageLayer({
      source: source,
      style: routeStyle,
    });

    map.addLayer(routeLayer);
  };

  routeLines.forEach((routeLines) => {
    createSingleRoute(routeLines.gps_point);
  });
};

/**
 * 添加动画标记
 * @param map
 * @param routeLines
 * @param speed
 */
const addAnimationMarker = (map, routeLines, speed) => {
  routeLines.forEach((routeLineItem) => {
    let currentPoint = routeLineItem.gps_point;
    const currentMarket = {
      ...routeLineItem,
      gps_point: currentPoint[0],
    };
    const { pointMark } = addMarker(map, currentMarket, waimaiqishouIcon);

    let currentIndex = 0; // 当前点位索引
    const totalPoints = currentPoint.length; // 使用当前线路的点位数量

    let animalFrameId = null;

    const animateMarker = async () => {
      if (totalPoints === 0) {
        // 如果没有点位，直接返回
        return;
      }
      /**
       * 标注在多久后从起止点移动
       * @param ms 延迟时间
       */
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      let progress = 0; // 动画进度
      /**
       * 开启动画使标注移动
       */
      const animationStep = async () => {
        await delay(props.markReturnDelay);
        progress += speed; // 每次增加进度
        if (progress >= 1) {
          progress = 0; // 重置进度
          currentIndex++;
        }
        if (!props.allowMarkReturn && currentIndex === totalPoints - 1) {
          cancelAnimationFrame(animalFrameId);
          return;
        }

        if (currentIndex === totalPoints - 1) {
          currentPoint = currentPoint.reverse();
          currentIndex = 0; // 循环移动到第一个点位
        }

        // 计算当前坐标
        const start = currentPoint[currentIndex];
        const end = currentPoint[(currentIndex + 1) % totalPoints];
        const currentCoordinates = [
          start[0] + (end[0] - start[0]) * progress,
          start[1] + (end[1] - start[1]) * progress,
        ];
        pointMark.getGeometry().setCoordinates(currentCoordinates); // 更新动画标记的位置

        animalFrameId = await requestAnimationFrame(animationStep); // 继续动画
      };

      await animationStep(); // 启动动画
    };

    animateMarker(); // 启动动画
  });
};

/**
 * 初始化地图
 */
const initMap = () => {
  // 创建一个自定义的 Zoom 控件
  const rotateControl = new Rotate({});
  // 比例尺
  const scaleLineControl = new ScaleLine({
    bar: true,
  });
  // 路线样式
  const routeStyle = [
    new Style({
      stroke: new Stroke({
        color: "#00A4F7",
        width: 3,
        lineDash: [10, 10],
      }),
    }),
  ];

  /**
   * 构建地图实例
   */
  const buildMap = () => {
    mapInstance = new Map({
      target: "map-app",
      controls: defaultControls({ attribution: false }).extend([
        rotateControl,
        scaleLineControl,
      ]),
      layers: [
        new TileLayer({
          source: new OSM(),
          visible: true,
          className: "map-layer",
        }),
      ],
      view: new View({
        projection: "EPSG:4326", // here is the view projection
        center: [120.024029, 30.355764],
        zoom: 10,
      }),
    });
  };

  const startPointInfo = {
    gps_point: [120.093996, 30.431549],
    gps_title: "开始点位",
    gps_time: "2023-07-05 14:05:06",
    gps_id: 1,
  };
  const endPointInfo = {
    gps_point: [119.985883, 30.280393],
    gps_title: "结束点位",
    gps_time: "2023-07-05 14:05:06",
    gps_id: 2,
  };
  // 地图上标注的移动速度，0-1之间，越大越快
  const iconSpeed = 0.01;

  buildMap();
  addRoute(mapInstance, props.data, routeStyle);
  addControl(mapInstance);
  addMarker(mapInstance, startPointInfo, shiziIcon);
  addMarker(mapInstance, endPointInfo, daxiangIcon);
  addAnimationMarker(mapInstance, props.data, iconSpeed);
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

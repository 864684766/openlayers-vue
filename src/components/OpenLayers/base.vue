<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { Map, View } from "ol";
import { OSM, Vector as VectorSource, XYZ } from "ol/source";
import {
  defaults as defaultControls,
  Control,
  Rotate,
  ScaleLine,
} from "ol/control.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { VectorImage as VectorImageLayer, Tile as TileLayer } from "ol/layer";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";

import "ol/ol.css";
import { LineString } from "ol/geom";
import { loadMapType, overlayType } from "@/enums";
import {
  IAddAnimationMarker,
  IAddRoute,
  ICreateIconMark,
  ICreateMarkerStyle,
  ICreateSingleRoute,
  IMarkPoint,
  IOverlayPool,
} from "@/type";
import { loadMapByType, setMapTheme } from "@/utils/loadMap";

const props = defineProps({
  /**
   * 点位数据集合
   * 格式：[]
   */
  pointDataList: {
    type: Array,
    required: false,
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
  /**
   * 是否显示轨迹
   */
  showTrack: {
    type: Boolean,
    default: true,
  },
  /**
   * 轨迹的模式，有历史轨迹history和实时轨迹 live 两种
   */
  trackMode: {
    type: String,
    default: "history",
  },
  /**
   * 地图中心点
   */
  mapCenter: {
    type: Array<number>,
    required: false,
    default: () => {
      return [120.024029, 30.355764];
    },
  },
  /**
   * 加载地图类型
   */
  loadMapType: {
    type: String,
    default: loadMapType.defaultMap,
  },
  /**
   * geojson数据
   */
  geojsonData: {
    type: Object,
    required: false,
  },
  /**
   * 地图主题
   */
  defaultMaptheme: {
    type: String,
    default: true,
  },
});

/**
 * 地图实例，暂时没用
 */
const mapRef = ref();

/**
 * 地图实例
 */
let mapInstance = null;

/**
 * 动画帧ID
 */
let animalFrameId = null;

// 定义支持的源类型，根据这些类型对瓦片进行渲染
const supportedSources = [OSM, XYZ];

const mapObject = computed(() => {
  return {
    mapInstance,
    type: props.loadMapType,
    geojsonData: props.geojsonData,
  };
});

/**
 * 覆盖物池子,用于存储不同类型的点位，方便后续清理的时候操作
 */
let overlayPool: IOverlayPool[] = [];

/**
 *  添加控件
 * @param map
 */
const addControl = () => {
  const compassElement = document.getElementById("compass");
  const compassControl = new Control({ element: compassElement });
  mapInstance.addControl(compassControl);
};

/**
 * 创建标记样式
 */
const createMarkerStyle = ({
  curPoint,
  anchor = [0.5, 0.5],
  scale = 0.2,
}: ICreateMarkerStyle) => {
  return new Style({
    image: new Icon({
      src: curPoint.point_icon,
      anchor,
      scale,
    }),
    text: new Text({
      text: curPoint.gps_title,
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
const createIconMark = ({
  curPoint,
  anchor = [0.5, 0.5],
  scale = 0.2,
}: ICreateIconMark) => {
  const iconFeature = new Feature({
    ...curPoint,
    geometry: new Point(curPoint.gps_point),
    name: curPoint.gps_title,
  });
  iconFeature.setStyle(createMarkerStyle({ curPoint, anchor, scale }));
  return iconFeature;
};

/**
 *  添加标记
 */
const addMarker = ({
  pointDataList,
  anchor = [0.5, 1],
  scale = 0.2,
}: IMarkPoint) => {
  pointDataList.forEach((pointDataItem) => {
    const curPoint = {
      gps_point: pointDataItem.gps_point,
      gps_title: pointDataItem.gps_title,
      gps_time: pointDataItem.gps_time,
      gps_id: pointDataItem.gps_id,
      point_type: pointDataItem.point_type,
      point_icon: pointDataItem.point_icon,
    };
    const pointMark = createIconMark({ curPoint, anchor, scale });
    const vectorSource = new VectorSource({
      features: [pointMark],
    });
    const vectorLayer = new VectorImageLayer({
      source: vectorSource,
    });
    pointMark.setId(pointDataItem.gps_id);
    mapInstance.addLayer(vectorLayer);
    const pointItem = { instance: pointMark, type: pointDataItem.point_type };
    overlayPool.push(pointItem);
  });
};

/**
 * 添加路线
 * @param map
 */
const addRoute = ({
  routeLines,
  routeStyle,
  routeType = overlayType.track,
}: IAddRoute) => {
  // 路线样式
  const buldStyle = [
    new Style({
      stroke: new Stroke({
        ...routeStyle.strock,
      }),
    }),
  ];
  /**
   *  创建一条线
   * @param points
   */
  const createSingleRoute = (route: ICreateSingleRoute) => {
    const source = new VectorSource();
    const linePath = new LineString(route);
    const routeFeature = new Feature({
      geometry: linePath,
    });
    source.addFeature(routeFeature);
    const routeLayer = new VectorImageLayer({
      source: source,
      style: buldStyle,
    });
    mapInstance.addLayer(routeLayer);
    return { routeFeature };
  };

  routeLines.forEach((routeLine) => {
    const { routeFeature } = createSingleRoute(routeLine.gps_point);
    const lineItem = { type: routeType, instance: routeFeature };
    overlayPool.push(lineItem);
  });
};

/**
 * 添加动画标记
 * @param map
 * @param routeLines
 * @param speed 标注的速度
 * @param offset 如果图像是竖着的并且头向上，就+105个角度可保证图像的正常运行，如果是横着的并且头向右，就不要加105个角度，正常写可保证图像的正常运行
 * @param scale 标记的大小
 * @param anchor 标记的锚点,这个对象通常需要提供 size（尺寸）和 offset（偏移）属性组成一个数组
 */
const addAnimationMarker = ({
  routeLines,
  speed,
  offset = 0,
  scale = 0.2,
  anchor = [0.5, 0.5],
}: IAddAnimationMarker) => {
  routeLines.forEach((routeLineItem) => {
    let point = routeLineItem.gps_point;
    const currentMarket = {
      ...routeLineItem,
      gps_point: point[0],
      point_type: overlayType.animation,
      point_icon: routeLineItem.gps_icon,
    };
    addMarker({
      pointDataList: [currentMarket],
      anchor,
      scale,
    });

    const pointMark = overlayPool.find(
      (x) => x.instance.getId() === routeLineItem.gps_id
    )?.instance;

    let currentIndex = 0; // 当前点位索引
    const totalPoints = point.length; // 使用当前线路的点位数量

    /**
     *  获取两个点之间的角度,如果图像是竖着的并且头向上，就+105个角度可保证图像的正常运行，如果是横着的并且头向右，就不要加105个角度，正常写可保证图像的正常运行
     * @param first
     * @param second
     * @param offset // 偏移量
     */
    const calculateAngle = (first, second, offset = 0) => {
      let y = second[1] - first[1];
      let x = second[0] - first[0];
      let radAngle = Math.atan(y / x) + offset;
      if (y <= 0 && x >= 0) {
        //第二象限
        radAngle = -radAngle;
      } else if (x >= 0 && y >= 0) {
        //第一象限
        radAngle = -radAngle;
      } else if (x <= 0 && y >= 0) {
        //第四象限
        radAngle = Math.PI - radAngle;
      } else if (x <= 0 && y <= 0) {
        //第三象限
        radAngle = Math.PI - radAngle;
      }
      return radAngle;
    };

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
       * 动画步骤
       */
      const animationStep = async () => {
        await delay(props.markReturnDelay);
        progress += speed; // 每次增加进度

        if (progress >= 1) {
          progress = 0; // 重置进度
          currentIndex++;
        }

        if (currentIndex === totalPoints - 1) {
          point = point.reverse(); // 反转点位
          currentIndex = 0; // 循环移动到第一个点位
        }

        // 计算当前坐标
        const start = point[currentIndex];
        const end = point[(currentIndex + 1) % totalPoints];

        // 使用线性插值计算当前坐标
        const currentCoordinates = [
          start[0] + (end[0] - start[0]) * progress,
          start[1] + (end[1] - start[1]) * progress,
        ];
        if (!pointMark) {
          return;
        }
        pointMark.getGeometry().setCoordinates(currentCoordinates); // 更新动画标记的位置
        const angle = calculateAngle(start, end, offset);
        const style = pointMark.getStyle() as Style;
        if (style && style.getImage) {
          style.getImage().setRotation(angle);
        }
        animalFrameId = await requestAnimationFrame(animationStep); // 继续动画
      };

      await animationStep(); // 启动动画
    };

    animateMarker(); // 启动动画
  });
};

/**
 * 根据类型移除地图指定的标记
 * @param type
 */
const removeMarkersByType = (type: overlayType) => {
  if (!mapInstance) {
    return;
  }
  // 找到所有与指定类型匹配的标记实例
  let markersToRemove = overlayPool;
  // 如果没有指定类型，则移除所有标记
  if (type) {
    // 找到所有与指定类型匹配的标记实例
    markersToRemove = overlayPool.filter((item) => item.type === type);
  }
  markersToRemove.forEach((item) => {
    if (item.instance) {
      const layerToRemove = mapInstance
        .getLayers()
        .getArray()
        .filter((layer) => {
          const source = layer.getSource();
          return source instanceof VectorSource; // 确保是 VectorSource
        });
      if (layerToRemove.length) {
        layerToRemove.forEach((layer) => {
          const source = layer.getSource() as VectorSource;
          source.removeFeature(item.instance); // 从源中移除所有 Feature
        });
      }
    }
  });
  if (
    animalFrameId &&
    !overlayPool.some((overlay) => overlay.type === overlayType.animation)
  ) {
    cancelAnimationFrame(animalFrameId);
  }
  if (!type) {
    overlayPool = [];
  } else {
    overlayPool = overlayPool.filter((overlay) => overlay.type !== type);
  }
};

/**
 * 添加地图的事件
 */
const addEventListener = () => {
  // 添加点击事件
  mapInstance.on("singleclick", (event) => {
    const coordinate = mapInstance.getEventCoordinate(event.originalEvent);
    // 在这里可以添加逻辑，例如弹出信息框
    alert(`您点击了坐标: ${coordinate}`);
  });
  // 添加鼠标移动事件
  mapInstance.on("pointermove", function (evt) {
    const feature = mapInstance.forEachFeatureAtPixel(evt.pixel, (feature) => {
      return feature;
    });
    console.log(feature);
    if (feature) {
    }
  });
  mapInstance.on("postrender", (event) => {
    console.log("地图加载完成");
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
        }),
      ],
      view: new View({
        projection: "EPSG:4326", // here is the view projection
        center: props.mapCenter,
        zoom: 10,
      }),
    });
  };

  // 中文注记
  buildMap();
  addControl();
  addEventListener();
  loadMapByType(mapObject.value);
};

const initZoomClick = () => {
  mapInstance?.getView()?.animate({ zoom: 10 });
};

onMounted(() => {
  initMap();
});

/**
 * 监听外部数据变化,根据变化执行副作用
 */
watch(
  () => [props.mapCenter, mapObject.value, props.defaultMaptheme],
  ([newMapCenter, newMapObject, newDefaultMaptheme]) => {
    //#region 监听地图中心点变化
    if (newMapCenter) {
      mapInstance?.getView().setCenter(newMapCenter);
    }
    //#endregion

    //#region 监听地图类型变化，根据变化加载新的地图类型
    if (newMapObject) {
      console.log("地图加载中");
      loadMapByType(mapObject.value);
    }
    //#endregion

    if (newDefaultMaptheme) {
      const imageTile = mapInstance
        .getLayers()
        .getArray()
        .find((layer) =>
          supportedSources.some(
            (sourceType) => layer.getSource() instanceof sourceType
          )
        ); // 获取当前图层
      const source = imageTile.getSource()

      setMapTheme(props.defaultMaptheme, source); // 调用 setRbg 方法
    }
  }
);

defineExpose({
  addMarker,
  addRoute,
  addAnimationMarker,
  removeMarkersByType,
});
</script>

<template>
  <div id="compass" class="compass-icon" @click="initZoomClick">初始缩放比</div>
  <div id="map-app" ref="mapRef" class="w-full h-[70%]" />
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

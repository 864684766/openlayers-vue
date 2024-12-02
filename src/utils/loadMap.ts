import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, XYZ, Vector as VectorSource } from "ol/source"; // 确保导入 OSM
import { Map } from "ol";
import { loadMapType } from "@/enums";
import { tianMapUrl } from "@/api/mapData";
import { GeoJSON } from "ol/format";
import { Stroke, Style } from "ol/style";
import {
  ICreateTianMapCva_w as ICreateTianMap,
  ILoadDefaultMap,
  ILoadTianStreetMap,
  ILoadTiaSatelliteMap,
} from "@/type";

//#region 具体加载某种类型地图的底图或者注记 的实现

/**
 *  返回三原色的对象
 */

const rgb = {
  r: 255,
  g: 255,
  b: 255
}

export const setRbg = (rgb:any)=>{
  rgb=rgb

  
}

export const tileLoadFunction=(imageTile: any, src) => {
  const img = new Image();
  img.setAttribute("crossOrigin", "anonymous");
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d");

    // 绘制原始图像到 Canvas 上
    context.drawImage(img, 0, 0, w, h);

    const imageData = context.getImageData(0, 0, w, h);
    const data = imageData.data;

    // 定义青花瓷蓝色的 RGB 值
    const R = rgb.r;
    const G = rgb.g;
    const B = rgb.b;

    // 遍历每个像素并修改颜色
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // 将所有颜色转换为青花瓷风格：主要是蓝白色调
      const average = (red + green + blue) / 3;

      // 数值越小越浅
      if (average > 100&&average<=200) {
        data[i] = 197; // Red
        data[i + 1] = 236; // Green
        data[i + 2] = 255; // Blue
      } else if (average > 200) {
        data[i] = R; // Red
        data[i + 1] = G; // Green
        data[i + 2] = B; // Blue
      } else {
        data[i] = R; // Red
        data[i + 1] = G; // Green
        data[i + 2] = B; // Blue
      }
    }
    context.putImageData(imageData, 0, 0);
    imageTile.getImage().src = canvas.toDataURL("image/png");
  };
  img.src = src;
}


// 创建标注图层
const createTianMap = ({ mapInstance, layerType }: ICreateTianMap) => {
  var source = new XYZ({
    // 使用天地图的注记图层 URL
    url: tianMapUrl(layerType)
  });

  var layer = new TileLayer({
    source,
    zIndex: 1, // 设置图层的层级，可以设置-1观察效果
    visible: true, // 默认显示
  });
  mapInstance.addLayer(layer);
};

/**
 * 加载默认地图
 */
const loadDefaultMap = ({ mapInstance }: ILoadDefaultMap) => {
  const layer = new TileLayer({
    source: new OSM(),
    visible: true, // 默认显示
    className: "map-base-layer",
  });
  mapInstance.addLayer(layer);
};

const tianMapLayerTypeMap = {
  vec: "cva",
  img: "cia",
  ter: "cta",
};

/**
 * 加载天地图卫星地图
 * @param mapInstance
 */
const loadTiaSatelliteMap = ({ mapInstance }: ILoadTiaSatelliteMap) => {
  const layrt = new TileLayer({
    source: new XYZ({
      url: tianMapUrl("img"),
    }),
    visible: true, // 默认显示
    className: "map-base-layer",
  });
  mapInstance.addLayer(layrt);
  createTianMap({ mapInstance, layerType: tianMapLayerTypeMap.img });
};

/**
 * 加载天地图街道地图
 * @param mapInstance
 */
const loadTianStreetMap = ({ mapInstance }: ILoadTianStreetMap) => {
  const layrt = new TileLayer({
    source: new XYZ({
      url: tianMapUrl("vec")
    }),
    visible: true, // 默认显示
    className: "map-base-layer",
  });
  mapInstance.addLayer(layrt);
  createTianMap({ mapInstance, layerType: tianMapLayerTypeMap.vec });
};

/**
 * 创建矢量GEOJSON的底图
 */
const loadGeoJsonLayer = ({ mapInstance, geojsonData }) => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: "EPSG:4326",
    }),
  });
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      // fill: new Fill({
      //   color: "rgba(0, 150, 0, 0.5)", // 设置填充颜色
      // }),
      stroke: new Stroke({ color: "#319FD3", width: 2 }),
    }),
  });
  mapInstance.addLayer(vectorLayer);
};
//#endregion

// 地图类型和实例匹配的策略对象
const mapObj: {
  [key: string]: (params: { mapInstance: Map; geojsonData?: any }) => void;
} = {
  [loadMapType.defaultMap]: loadDefaultMap,
  [loadMapType.tianStreetMap]: loadTianStreetMap,
  [loadMapType.tianSatelliteMap]: loadTiaSatelliteMap,
  [loadMapType.geoJsonMap]: loadGeoJsonLayer,
};

/**
 * 根据类型加载不同的地图数据
 * @param params - 包含地图实例和类型
 */
export const loadMapByType = (params: {
  mapInstance: Map;
  type: string;
  geojsonData?: any;
}) => {
  const { mapInstance, type, geojsonData } = params;
  if (!mapInstance) {
    return;
  }
  let loadMapFunction = mapObj[type];
  // 清除底图和覆盖物
  mapInstance.getLayers().clear();
  if (loadMapFunction) {
    loadMapFunction({ mapInstance, geojsonData }); // 调用对应的加载函数
  } else {
    console.error(`未找到地图类型: ${type},启用默认的地图类型`);
    loadMapFunction = mapObj[loadMapType.defaultMap];
    loadMapFunction({ mapInstance }); // 调用对应的加载函数
  }
};

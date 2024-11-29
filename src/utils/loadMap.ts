import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, XYZ, Vector as VectorSource } from "ol/source"; // 确保导入 OSM
import { Map } from "ol";
import { loadMapType } from "@/enums";
import { tianMapUrl } from "@/api/mapData";
import { GeoJSON } from "ol/format";
import { Stroke, Style } from "ol/style";
import {
  ICreateTianMapCva_w,
  ILoadDefaultMap,
  ILoadTianStreetMap,
  ILoadTiaSatelliteMap,
} from "@/type";

//#region 具体加载某种类型地图的底图或者注记 的实现

// 创建标注图层
const createTianMapCva_w = ({ mapInstance }: ICreateTianMapCva_w) => {
  var source = new XYZ({
    // 使用天地图的注记图层 URL
    url: tianMapUrl("cva"),
    // 这里可以添加其他参数，例如图层类型
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
    className: "map-layer",
  });
  mapInstance.addLayer(layer);
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
    className: "map-layer",
  });
  mapInstance.addLayer(layrt);
  createTianMapCva_w({ mapInstance });
};

/**
 * 加载天地图街道地图
 * @param mapInstance
 */
const loadTianStreetMap = ({ mapInstance }: ILoadTianStreetMap) => {
  const layrt = new TileLayer({
    source: new XYZ({
      url: tianMapUrl("vec"),
    }),
    visible: true, // 默认显示
    className: "map-layer",
  });
  mapInstance.addLayer(layrt);
  createTianMapCva_w({ mapInstance });
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
  if(!mapInstance){
    return
  }
  let loadMapFunction = mapObj[type];
  // 清除底图和覆盖物
  mapInstance.getLayers().clear();
  if (loadMapFunction) {
    loadMapFunction({ mapInstance, geojsonData }); // 调用对应的加载函数
  } else {
    console.error(`未找到地图类型: ${type},启用默认的地图类型`);
    loadMapFunction=mapObj[loadMapType.defaultMap];
    loadMapFunction({ mapInstance}); // 调用对应的加载函数
  }
};

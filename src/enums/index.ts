/**
 *  @module MarkerType 点位类型
 *  @description 枚举类型
 */
export enum overlayType {
  /**
   * 动画类型点位
   */
  animation = "animation",

  /**
   * 起点类型点位
   */
  startPoint = "startPoint",

  /**
   * 终点类型点位
   */
  endPoint = "endPoint",
  /**
   * 轨迹线
   */
  track = "track",
}

/**
 * 加载地图类型
 */
export enum loadMapType {
  
  /**
   * 天地图街道地图
   */
  tianStreetMap="tianStreetMap",

  /**
   * 天地图卫星地图
   */
  tianSatelliteMap="tianSatelliteMap",

  /**
   * 默认地图
   */
  defaultMap="defaultMap",

  /**
   * geoJson地图
   */
  geoJsonMap="geoJsonMap"
}
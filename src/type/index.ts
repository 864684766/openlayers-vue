import { overlayType } from "@/enums";
import Feature from "ol/Feature";
import { Options as StrockStyle } from "ol/style/Stroke";
import type{ Map } from "ol";

type IPointDataItem = {
  gps_point: Array<number>;
  gps_title: string;
  gps_time: string;
  gps_id: number;
  point_type: overlayType;
  point_icon: string;
};

export type IMarkPoint = {
  pointDataList: IPointDataItem[];
  anchor?: number[];
  scale?: number;
};

export type IRouteLine = {
  gps_point: Array<number[]>;
  gps_title: string;
  gps_id: number;
  gps_time: string;
  gps_icon: string;
};

export type IAddAnimationMarker = {
  routeLines: IRouteLine[];
  speed: number;
  offset?: number;
  scale?: number;
  anchor: number[];
};

export type ICreateSingleRoute = IRouteLine["gps_point"];

export type ILineStyle = {
  strock: StrockStyle;
};

export type IAddRoute = {
  routeLines: IRouteLine[];
  routeStyle: ILineStyle;
  routeType: overlayType;
};

export type IOverlayPool = {
  instance: Feature<any>;
  type: overlayType;
};



export type ICreateIconMark = {
  curPoint: IPointDataItem;
  anchor: number[];
  scale: number;
};

export type ICreateMarkerStyle = {
  curPoint: Pick<IPointDataItem, "point_icon" | "gps_title">;
  anchor: number[];
  scale: number;
};


export class ICreateMap{
  mapInstance: Map;
};

export class ICreateTianMapCva_w extends ICreateMap {
  layerType: string;
}

export class ILoadDefaultMap extends ICreateMap {
}

export class ILoadTiaSatelliteMap extends ICreateMap {
}

export class ILoadTianStreetMap extends ICreateMap {
}

export class ILoadGeoJsonLayer extends ICreateMap {
  geoJsonUrl: string;
}
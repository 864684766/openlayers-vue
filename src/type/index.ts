import { overlayType } from "@/enums";
import Feature from "ol/Feature";
import { Options as StrockStyle } from "ol/style/Stroke";

type IpointDataItem = {
  gps_point: Array<number>;
  gps_title: string;
  gps_time: string;
  gps_id: number;
  point_type: overlayType;
  point_icon: string;
};

export type IMarkPoint = {
  pointDataList: IpointDataItem[];
  anchor?: number[];
  scale?: number;
};

export type IrouteLine = {
  gps_point: Array<number[]>;
  gps_title: string;
  gps_id: number;
  gps_time: string;
  gps_icon: string;
};

export type IaddAnimationMarker = {
  routeLines: IrouteLine[];
  speed: number;
  offset?: number;
  scale?: number;
  anchor: number[];
};

export type IcreateSingleRoute = IrouteLine["gps_point"];

export type ILineStyle = {
  strock: StrockStyle;
};

export type IaddRoute = {
  routeLines: IrouteLine[];
  routeStyle: ILineStyle;
  routeType: overlayType;
};

export type IoverlayPool = {
  instance: Feature<any>;
  type: overlayType;
};



export type IcreateIconMark = {
  curPoint: IpointDataItem;
  anchor: number[];
  scale: number;
};

export type IcreateMarkerStyle = {
  curPoint: Pick<IpointDataItem, "point_icon" | "gps_title">;
  anchor: number[];
  scale: number;
};

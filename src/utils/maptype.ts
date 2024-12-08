import { defaulMapTheme } from "@/enums";

/**
 * 地图默认样式
 */
export const defaultMapStyle = {
  [defaulMapTheme.OKR]: {
    r: 100,
    g: 200,
    b: 50,
  },
  [defaulMapTheme.blueAndWhitePorcelain]: {
    r: 197,
    g: 236,
    b: 255,
  },
  [defaulMapTheme.theWizardOfOz]: {
    r: 34,
    g: 139,
    b: 34,
  },
  [defaulMapTheme.midnight]: {
    r: 25,
    g: 25,
    b: 112,
  },
  [defaulMapTheme.teaGarden]: {
    r: 85,
    g: 107,
    b: 47,
  },
  [defaulMapTheme.halloween]: {
    r: 255,
    g: 140,
    b: 0,
  },
  [defaulMapTheme.eye]: {
    r: 70,
    g: 130,
    b: 180,
  },
};

/**
 * 地图默认样式滤镜
 */
export const defaultMapFilter = {
  [defaulMapTheme.default]: {
    filter: `brightness(1.0) contrast(1.0) saturate(1.0) hue-rotate(0deg)`,
  },
  [defaulMapTheme.blueAndWhitePorcelain]: {
    filter: `sepia(120%) saturate(140%) hue-rotate(165deg) brightness(101%)`,
  },
  [defaulMapTheme.midnight]: {
    filter: `grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)`,
  },
  [defaulMapTheme.teaGarden]: {
    filter: `brightness(1.0) contrast(1.1) saturate(1.0) hue-rotate(60deg)`,
  },
//   [defaulMapTheme.OKR]: {
//     filter: `sepia(60%) saturate(150%) hue-rotate(45deg) brightness(95%) contrast(110%)`,
//   },
  [defaulMapTheme.eye]: {
    filter: `brightness(0.88) contrast(1.22) grayscale(0) hue-rotate(380deg) opacity(1) saturate(1.1) sepia(0.94) invert(0.9)`,
  },
  [defaulMapTheme.theWizardOfOz]: {
    filter: `grayscale(0%) invert(30%) sepia(40%) hue-rotate(90deg) saturate(200%) brightness(95%) contrast(120%)`,
  },
  [defaulMapTheme.halloween]: {
    filter: `brightness(0.7) contrast(2) grayscale(5) hue-rotate(360deg) opacity(1) saturate(1.8) sepia(0.94) invert(1)`,
  },
};

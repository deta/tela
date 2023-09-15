import type { Vec2, Vec4 } from "./Utils.type.js";

export interface TBoardSettings {
  CAN_DRAW?: boolean;
  CAN_SELECT?: boolean;
  CAN_PAN?: boolean;
  CAN_ZOOM?: boolean;

  SNAP_TO_GRID?: boolean;
  GRID_SIZE?: number;

  BOUNDS?: {
    minX: number | null;
    maxX: number | null;
    minY: number | null;
    maxY: number | null;
    minZoom: number | null;
    maxZoom: number | null;
    limit: "hard" | "soft";
  };

  // mostly internal stuff
  CULL?: boolean;
  CULL_MARGIN?: number;

  // dev stuff
  DEV: {
    SHOW_POS: boolean;
    SHOW_MODE: boolean;
  };
}
export interface TBoard {
  viewOffset: Vec2;
  viewSize: Vec2;
  viewPort: Vec4; // Store viewport position in case container el is not full window
  zoom: number;
}

export type TBoardMode = "draw" | "select" | "pan" | "panning" | "zoom";
export interface TBoardState {
  mode: TBoardMode;
}
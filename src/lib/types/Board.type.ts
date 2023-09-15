import type { Vec2 } from "./Utils.type.js";

export interface TBoardSettings {
  CAN_ZOOM?: boolean;
  SNAP_TO_GRID?: boolean;
  GRID_SIZE?: number;

  BOUNDS?: {
    minX: number | null;
    maxX: number | null;
    minY: number | null;
    maxY: number | null;
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
  zoom: number;
}

export type TBoardMode = "draw" | "select" | "pan" | "panning" | "zoom";
export interface TBoardState {
  mode: TBoardMode;
}
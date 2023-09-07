import type { Vec2 } from "./Utils.type.js";

export interface TBoardSettings {
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
  DEV_CHECKERS?: boolean;
  DEV_POS?: boolean;
}
export interface TBoard {
  viewOffset: Vec2;
  zoom: number;
}

export type TBoardMode = "draw" | "select" | "pan" | "panning" | "zoom";
export interface TBoardState {
  mode: TBoardMode;
}
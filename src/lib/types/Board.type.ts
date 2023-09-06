import type { Vec2 } from "./Utils.type.js";

export interface TBoardSettings {
  SNAP_TO_GRID?: boolean;
  GRID_SIZE?: number;

  // mostly internal stuff
  CULL_MARGIN?: number;

  // dev stuff
  DEV_CHECKERS?: boolean;
  DEV_POS?: boolean;
}

export interface TBoard {
  viewOffset: Vec2;
  zoom: number;
}

export interface TChunk {}
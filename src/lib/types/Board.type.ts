import type { Tweened } from "svelte/motion";
import type { Vec2, Vec4 } from "./Utils.type.js";
import type { Writable } from "svelte/store";

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
    limit: "soft" | "hard";
  };

  // mostly internal stuff
  CULL?: boolean;
  CULL_MARGIN?: number;
  CHUNK_SIZE?: number;
  CHUNK_CULL_MARGIN?: number;

  // dev stuff
  DEV: {
    SHOW_POS: boolean;
    SHOW_MODE: boolean;
  };
}
export interface BoardState {
  viewOffset: { x: Tweened<number>, y: Tweened<number> };
  viewPort: Vec4; // Store viewport position in case container el is not full window
  zoom: Tweened<number>;
  mode: TBoardMode;
}
export interface Board {
  state: Writable<BoardState>;

  setMode: (mode: TBoardMode) => void;
  panTo: (x: number, y: number, duration?: number, delay?: number) => Promise<any>;
  zoomTo: (zoom: number, duration?: number, delay?: number) => Promise<void>;
}

export type TBoardMode =
  | "draw"
  | "select"
  | "pan"
  | "panning"
  // Used when panTo is invoked
  | "auto-panning"
  | "zoom";
export interface TBoardState {
  mode: TBoardMode;
}
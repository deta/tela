import type { Tweened } from "svelte/motion";
import type { Vec2, Vec4 } from "./Utils.type.js";
import type { Writable } from "svelte/store";

export interface IBoardSettings {
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

    // Display chunks as colored boxed
    CHUNK_DBG: boolean;
  };
}
export interface IBoardState {
  viewOffset: { x: Tweened<number>, y: Tweened<number> };
  viewPort: Vec4; // Store viewport position in case container el is not full window
  zoom: Tweened<number>;
  mode: TBoardMode;
}
export interface IBoard {
  state: Writable<IBoardState>;

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
export interface TIBoardState { // todo; kill?
  mode: TBoardMode;
}
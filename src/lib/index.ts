import Board from "./Board.svelte";
import Positionable from "./Positionable.svelte";
import Draggable from "./Draggable.svelte";
import Resizable from "./Resizable.svelte";
import Grid from "./Grid.svelte";
import type { TBoard, TBoardSettings } from "./types/Board.type.js";
import type { Vec2 } from "./types/Utils.type.js";

// Reexport your entry components here
export default {
  Board,
  Positionable,
  Draggable,
  Resizable,
  Grid
};

export type {
  TBoardSettings,
  TBoard,
  Vec2
}

import Board from "./board/Board.svelte";
import Positionable from "./board/Positionable.svelte";
import Draggable from "./board/Draggable.svelte";
import Resizable from "./board/Resizable.svelte";
import type { TBoard } from "./types/Board.type.js";
import type { TPositionable } from "./types/Positionable.type.js";

// Reexport your entry components here
export default {
  Board,
  Positionable,
  Draggable,
  Resizable
};

export type {
  TBoard,
  TPositionable
};
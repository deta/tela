<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";
  import { clamp, hasClassOrParentWithClass } from "./utils.js";
  import { createEventDispatcher, setContext } from "svelte";

  export let settings: TBoardSettings;
  export let board: Writable<TBoard>;

  const dispatch = createEventDispatcher();
  setContext("board", board);

  // Defaults
  settings = {
    SNAP_TO_GRID: false,
    GRID_SIZE: 20,

    CULL_MARGIN: 400,

    DEV_CHECKERS: false,
    ...settings
  } satisfies TBoardSettings;

  setContext("settings", writable(settings));

  let dragState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  };

  // let transformCss = `transform: scale(${$board.zoom}) translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px);`;
  $: transformCss = `transform-origin: top left; transform: scale(${
    $board.zoom
  }) translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px);`;

  // UI Handlers
  function onWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY;
      const zoom = clamp($board.zoom - delta / 500, 0.1, 1.9);
      $board.zoom = zoom;

      // todo: adjust position to zoom in on cursor
      // const centerOffset = {
      //   x: e.clientX - window.innerWidth / 2,
      //   y: window.innerHeight / 2 - e.clientY / 2
      // };

      // $board.viewOffset = {
      //   x: $board.viewOffset.x - centerOffset.x,
      //   y: $board.viewOffset.y
      // };
    } else {
      e.preventDefault();
      e.stopPropagation();
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;
      $board.viewOffset = {
        x: $board.viewOffset.x + deltaX,
        y: $board.viewOffset.y + deltaY
      };
    }
    dispatch("zoomEnd", { zoom: $board.zoom });
    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  function onMouseDown(e: MouseEvent) {
    if (hasClassOrParentWithClass(e.target as HTMLElement, "no-pan")) return;

    dragState.init = { x: e.clientX, y: e.clientY };
    dragState.curr = { x: e.clientX, y: e.clientY };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    dragState.offset = {
      x: Math.floor(e.clientX - dragState.curr.x),
      y: Math.floor(e.clientY - dragState.curr.y)
    };

    dragState.curr = { x: e.clientX, y: e.clientY };

    $board.viewOffset = {
      x: $board.viewOffset.x - dragState.offset.x,
      y: $board.viewOffset.y - dragState.offset.y
    };

    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  function onMouseUp(e: MouseEvent) {
    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
    document.removeEventListener("mousemove", onMouseMove);
    dispatch("panEnd", { offset: $board.viewOffset });
  }
</script>

<div class="container" on:mousedown={onMouseDown} on:wheel|nonpassive={onWheel}>
  <div class="board" style={transformCss}>
    <slot />
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;

    overflow: hidden;
    overscroll-behavior: contain;

    cursor: grab;
  }
  .board {
    position: relative;
    height: 100%;
    overflow: visible;

    will-change: transform;
    isolation: isolate;
  }
</style>

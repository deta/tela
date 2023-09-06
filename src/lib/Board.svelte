<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";
  import { clamp, debounce, hasClassOrParentWithClass } from "./utils.js";
  import { createEventDispatcher, setContext } from "svelte";

  export let settings: TBoardSettings;
  export let board: Writable<TBoard>;

  const dispatch = createEventDispatcher();
  setContext("board", board);

  // Defaults
  settings = {
    SNAP_TO_GRID: false,
    GRID_SIZE: 20,

    BOUNDS: {
      minX: null,
      maxX: null,
      minY: null,
      maxY: null
    },

    CULL: true,
    CULL_MARGIN: 400,

    DEV_CHECKERS: false,
    ...settings
  } satisfies TBoardSettings;

  setContext("settings", writable(settings));

  let panState = {
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

      // todo: fix relative to bounding element box not screen pos
      const absoluteMouseXOld = $board.viewOffset.x + e.clientX / $board.zoom;
      const absoluteMouseYOld = $board.viewOffset.y + e.clientY / $board.zoom;

      const delta = e.deltaY;
      const zoom = clamp($board.zoom - delta / 500, 0.1, 1.9);
      $board.zoom = zoom;

      const absoluteMouseXNew = $board.viewOffset.x + e.clientX / zoom;
      const absoluteMouseYNew = $board.viewOffset.y + e.clientY / zoom;

      const offsetX = absoluteMouseXOld - absoluteMouseXNew;
      const offsetY = absoluteMouseYOld - absoluteMouseYNew;

      $board.viewOffset = {
        x: $board.viewOffset.x + offsetX,
        y: $board.viewOffset.y + offsetY
      };
    } else {
      e.preventDefault();
      e.stopPropagation();
      document.body.classList.add("panning");
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      const boundX = clamp(
        $board.viewOffset.x + deltaX,
        settings.BOUNDS!.minX !== null ? settings.BOUNDS!.minX : -Infinity,
        settings.BOUNDS!.maxX !== null ? settings.BOUNDS!.maxX - window.innerWidth : Infinity // todo: use bounding rect
      );
      const boundY = clamp(
        $board.viewOffset.y + deltaY,
        settings.BOUNDS!.minY !== null ? settings.BOUNDS!.minY : -Infinity,
        settings.BOUNDS!.maxY !== null ? settings.BOUNDS!.maxY - window.innerHeight : Infinity
      );

      $board.viewOffset = {
        x: boundX,
        y: boundY
      };
      debounce("remove_trackpad_panning", 100, () => document.body.classList.remove("panning"));
    }
    dispatch("zoomEnd", { zoom: $board.zoom });
    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  function onMouseDown(e: MouseEvent) {
    e.stopPropagation();
    if (hasClassOrParentWithClass(e.target as HTMLElement, "no-pan")) return;

    document.body.classList.add("panning");

    panState.init = { x: e.clientX, y: e.clientY };
    panState.curr = { x: e.clientX, y: e.clientY };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    panState.offset = {
      x: Math.floor(e.clientX - panState.curr.x),
      y: Math.floor(e.clientY - panState.curr.y)
    };

    panState.curr = { x: e.clientX, y: e.clientY };

    const boundX = clamp(
      $board.viewOffset.x - panState.offset.x,
      settings.BOUNDS!.minX !== null ? settings.BOUNDS!.minX : -Infinity,
      settings.BOUNDS!.maxX !== null ? settings.BOUNDS!.maxX - window.innerWidth : Infinity
    );
    const boundY = clamp(
      $board.viewOffset.y - panState.offset.y,
      settings.BOUNDS!.minY !== null ? settings.BOUNDS!.minY : -Infinity,
      settings.BOUNDS!.maxY !== null ? settings.BOUNDS!.maxY - window.innerHeight : Infinity
    );

    $board.viewOffset = {
      x: boundX, //$board.viewOffset.x - panState.offset.x,
      y: boundY //$board.viewOffset.y - panState.offset.y
    };

    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  function onMouseUp(e: MouseEvent) {
    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
    document.body.classList.remove("panning");
    document.removeEventListener("mousemove", onMouseMove);
    dispatch("panEnd", { offset: $board.viewOffset });
  }
</script>

{#if settings.DEV_POS}
  <span style="position: fixed; left: 1ch; bottom: 1ch; z-index: 200; background: white;"
    >{$board.viewOffset.x} - {$board.viewOffset.y}</span
  >
{/if}

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

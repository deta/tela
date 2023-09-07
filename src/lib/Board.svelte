<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { TBoard, TBoardMode, TBoardSettings } from "./types/Board.type.js";
  import { clamp, debounce, hasClassOrParentWithClass, snapToGrid } from "./utils.js";
  import { createEventDispatcher, onMount, setContext } from "svelte";

  export let settings: TBoardSettings;
  export let board: Writable<TBoard>;

  const dispatch = createEventDispatcher();

  // Defaults
    CAN_ZOOM: true,
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

  setContext("board", board);
  setContext("settings", writable(settings));

  let mode = writable<TBoardMode>("draw");
  setContext("mode", mode);

  let containerEl: HTMLDivElement;

  let dragState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  };

  let selectState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    pos: { x: 0, y: 0 },
    size: { x: 0, y: 0 }
  }

  // let transformCss = `transform: scale(${$board.zoom}) translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px);`;
  $: transformCss = `transform-origin: top left; transform: scale(${
    $board.zoom
  }) translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px);`;

  $: selectionCss = `transform: translate(${
    settings.SNAP_TO_GRID ? snapToGrid(Math.floor($board.viewOffset.x + (selectState.pos.x - 0.5) / $board.zoom), settings.GRID_SIZE!) : $board.viewOffset.x + selectState.pos.x / $board.zoom
  }px, ${
    settings.SNAP_TO_GRID ? snapToGrid(Math.floor($board.viewOffset.y + (selectState.pos.y - 0.5) / $board.zoom), settings.GRID_SIZE!) : $board.viewOffset.y + selectState.pos.y / $board.zoom
  }px); width: ${
    settings.SNAP_TO_GRID ? snapToGrid(Math.round(selectState.size.x + 0.5), settings.GRID_SIZE!) : Math.round(selectState.size.x)
  }px; height: ${
    settings.SNAP_TO_GRID ? snapToGrid(Math.round(selectState.size.y + 0.5), settings.GRID_SIZE!) : Math.round(selectState.size.y)
  }px;`;

  $: modeCursorCss = `cursor: ${
    $mode === "draw" ? "crosshair" : $mode === "select" ? "default" : $mode === "pan" ? "grab" : $mode === "panning" ? "grabbing" : "crosshair"
  };`;

  // Utils
  function startPanning() {
    document.body.classList.add("panning");
  }
  function stopPanning() {
    document.body.classList.remove("panning");
    document.removeEventListener("mousemove", onMouseMovePan);
    dispatch("panEnd", { offset: $board.viewOffset });
  }

  function startSelect() {
    document.body.classList.add("selecting");
    document.addEventListener("mousemove", onMouseMoveSelect);
  }
  function stopSelect() {
    document.body.classList.remove("selecting");
    document.removeEventListener("mousemove", onMouseMoveSelect);
    dispatch("selectEnd", { selectState });
  }

  // UI Handlers
  function onWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!$settings.CAN_ZOOM) return;

      $mode = "zoom";

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

  function onKeyDown(e: KeyboardEvent) {
    console.log(e.shiftKey);
    if (e.shiftKey) {
      mode.set("select");
    } else if (e.metaKey) {
      mode.set("pan");
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (!e.shiftKey && !e.metaKey) {
      stopPanning();
      stopSelect();
      mode.set("draw");
    }
  }

  function onMouseDown(e: MouseEvent) {
    if ($mode === "pan") {
      mode.set("panning");
    }

    if ($mode === "panning") {
      e.stopPropagation();
      if (hasClassOrParentWithClass(e.target as HTMLElement, "no-pan")) return;

      startPanning();

      dragState.init = { x: e.clientX, y: e.clientY };
      dragState.curr = { x: e.clientX, y: e.clientY };

      document.addEventListener("mousemove", onMouseMovePan);
      document.addEventListener("mouseup", onMouseUp, { once: true });
    }
    else if ($mode === "select") {
      e.stopPropagation();
      startSelect();

      selectState.init = { x: e.clientX, y: e.clientY };
      selectState.curr = { x: e.clientX, y: e.clientY };
      selectState.pos = { x: e.clientX, y: e.clientY };
      selectState.size = { x: 0, y: 0 };

      document.addEventListener("mousemove", onMouseMoveSelect);
      document.addEventListener("mouseup", onMouseUp, { once: true });
    }
  }

  function onMouseMovePan(e: MouseEvent) {
    dragState.offset = {
      x: Math.floor(e.clientX - dragState.curr.x),
      y: Math.floor(e.clientY - dragState.curr.y)
    };

    dragState.curr = { x: e.clientX, y: e.clientY };

    const boundX = clamp(
      $board.viewOffset.x - dragState.offset.x,
      settings.BOUNDS!.minX !== null ? settings.BOUNDS!.minX : -Infinity,
      settings.BOUNDS!.maxX !== null ? settings.BOUNDS!.maxX - window.innerWidth : Infinity
    );
    const boundY = clamp(
      $board.viewOffset.y - dragState.offset.y,
      settings.BOUNDS!.minY !== null ? settings.BOUNDS!.minY : -Infinity,
      settings.BOUNDS!.maxY !== null ? settings.BOUNDS!.maxY - window.innerHeight : Infinity
    );

    $board.viewOffset = {
      x: boundX, //$board.viewOffset.x - dragState.offset.x,
      y: boundY //$board.viewOffset.y - dragState.offset.y
    };

    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  function onMouseMoveSelect(e: MouseEvent) {
    selectState.offset = {
      x: -Math.floor(selectState.init.x - selectState.curr.x),
      y: -Math.floor(selectState.init.y - selectState.curr.y)
    };

    selectState.pos.x = selectState.init.x;
    selectState.pos.y = selectState.init.y;

    selectState.size.x = selectState.offset.x / $board.zoom;
    selectState.size.y = selectState.offset.y / $board.zoom;

    if (selectState.size.x < 0) {
      selectState.size.x = Math.abs(selectState.offset.x / $board.zoom);
      selectState.pos.x = selectState.init.x - selectState.size.x * $board.zoom;
    }
    if (selectState.size.y < 0) {
      selectState.size.y = Math.abs(selectState.offset.y / $board.zoom);
      selectState.pos.y = selectState.init.y - selectState.size.y * $board.zoom;
    }

    selectState.curr = { x: e.clientX, y: e.clientY };
    dispatch("selectMove", { selectState });
  }

  function onMouseUp(e: MouseEvent) {
    if ($mode === "panning") {
      $mode = "pan";
      stopPanning();
    }
    else if ($mode === "select") {
      stopSelect();
      selectState = {
        init: { x: 0, y: 0 },
        curr: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        size: { x: 0, y: 0 }
      }
    }

    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  // onMount(() => {
  //   containerEl.addEventListener("mousedown", onMouseDown, { capture: true });
  // });
</script>

<div style="position: absolute; left: 1ch; bottom: 1ch; background: darkblue; z-index: 200; color: #fff; padding: 4px; display: flex; gap: 2ch; user-select: none; pointer-events: none;">
  {#if settings.DEV_POS}
    <span
      >{$board.viewOffset.x} - {$board.viewOffset.y}</span
    >
  {/if}
  <span>{$mode}</span>
</div>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<div
  class="container"
  style={modeCursorCss}
  on:mousedown|capture={onMouseDown}
  on:wheel|nonpassive={onWheel}
  bind:this={containerEl}
>
  <div class="board" style={transformCss}>

    {#if $mode === "select"}
    <div class="selection-rect" style="{selectionCss}"/>
      <!-- <div id="dragIntercept">
        <div id="selectionRect" style={selectionCss} bind:this={selectionRectEl} />
      </div> -->
    {/if}

    <slot />
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;

    overflow: hidden;
    overscroll-behavior: contain;
  }
  .board {
    position: relative;
    height: 100%;
    overflow: visible;

    will-change: transform;
    isolation: isolate;

    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  .selection-rect {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.1);
  }
</style>

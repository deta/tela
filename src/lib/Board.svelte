<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { TBoard, TBoardMode, TBoardSettings } from "./types/Board.type.js";
  import { clamp, debounce, hasClassOrParentWithClass } from "./utils.js";
  import { createEventDispatcher, onMount, setContext } from "svelte";

  export let settings: Writable<Partial<TBoardSettings>>;
  export let board: Writable<Partial<TBoard>>;

  const dispatch = createEventDispatcher();

  // Defaults
  $settings = {
    CAN_ZOOM: true,
    SNAP_TO_GRID: false,
    GRID_SIZE: 20,

    CULL: true,
    CULL_MARGIN: 400,

    DEV: {
      SHOW_POS: false,
      SHOW_MODE: false
    },
    ...$settings,
    BOUNDS: {
      minX: null,
      maxX: null,
      minY: null,
      maxY: null,
      maxZoom: 3,
      minZoom: 0,
      limit: "hard",
      ...$settings.BOUNDS
    },
  } satisfies TBoardSettings;

  $board = {
    zoom: 1,
    viewOffset: { x: 0, y: 0 },
    viewSize: { x: 1280, y: 720 },
    viewPort: { x: 0, y: 0, w: 0, h: 0 },
    ...$board
  } satisfies TBoard;

  setContext("board", board);
  setContext("settings", settings);

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
  };

  $: transformCss = `transform-origin: top left; transform: scale(${
    $board.zoom
  }) translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px);`;

  // $: selectionCss = `transform: translate(${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.floor($board.viewOffset.x + (selectState.pos.x - 0.5) / $board.zoom), $settings.GRID_SIZE!) : $board.viewOffset.x + selectState.pos.x / $board.zoom
  // }px, ${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.floor($board.viewOffset.y + (selectState.pos.y - 0.5) / $board.zoom), $settings.GRID_SIZE!) : $board.viewOffset.y + selectState.pos.y / $board.zoom
  // }px); width: ${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.round(selectState.size.x + 0.5), $settings.GRID_SIZE!) : Math.round(selectState.size.x)
  // }px; height: ${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.round(selectState.size.y + 0.5), $settings.GRID_SIZE!) : Math.round(selectState.size.y)
  // }px;`;

  $: selectionCss = `transform: translate(${
    $board.viewOffset.x + selectState.pos.x / $board.zoom
  }px, ${$board.viewOffset.y + selectState.pos.y / $board.zoom}px); width: ${Math.round(
    selectState.size.x
  )}px; height: ${Math.round(selectState.size.y)}px;`;

  $: modeCursorCss = `cursor: ${
    $mode === "draw"
      ? "crosshair"
      : $mode === "select"
      ? "default"
      : $mode === "pan"
      ? "grab"
      : $mode === "panning"
      ? "grabbing"
      : "crosshair"
  };`;

  // if ($settings.BOUNDS?.minX !== null && $board.viewOffset.x < $settings.BOUNDS!.minX) {
  //   $board.viewOffset.x = $settings.BOUNDS!.minX;
  // }
  // if ($settings.BOUNDS?.minY !== null && $board.viewOffset.y < $settings.BOUNDS!.minY) {
  //   $board.viewOffset.y = $settings.BOUNDS!.minY;
  // }
  // if ($settings.BOUNDS?.maxX !== null && $board.viewOffset.x > $settings.BOUNDS!.maxX - window.innerWidth) {
  //   $board.viewOffset.x = $settings.BOUNDS!.maxX - window.innerWidth;
  // }
  // if ($settings.BOUNDS?.maxY !== null && $board.viewOffset.y > $settings.BOUNDS!.maxY - window.innerHeight) {
  //   $board.viewOffset.y = $settings.BOUNDS!.maxY - window.innerHeight;
  // }

  // Utils
  function posToViewportPos(x: number, y: number) {
    return {
      x: x - $board.viewPort.x,
      y: y - $board.viewPort.y + window.scrollY
    };
  }
  function startDrawing() {
    document.body.classList.add("drawing");
    dispatch("drawStart");
  }
  function stopDrawing() {
    document.body.classList.remove("drawing");
    document.removeEventListener("mousemove", onMouseMoveDraw);
    selectState = {
      init: { x: 0, y: 0 },
      curr: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      pos: { x: 0, y: 0 },
      size: { x: 0, y: 0 }
    };
  }
  function startPanning() {
    document.body.classList.add("panning");
  }
  function stopPanning() {
    document.body.classList.remove("panning");
    document.removeEventListener("mousemove", onMouseMovePan);
    dispatch("panEnd", { offset: $board.viewOffset });
  }

  function startSelect() {
    dispatch("selectStart");
    document.body.classList.add("selecting");
    document.addEventListener("mousemove", onMouseMoveSelect);
  }
  function stopSelect() {
    document.body.classList.remove("selecting");
    document.removeEventListener("mousemove", onMouseMoveSelect);
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
      if (hasClassOrParentWithClass(e.target as HTMLElement, "tela-ignore")) return;
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      const boundX = clamp(
        $board.viewOffset.x + deltaX,
        $settings.BOUNDS!.minX !== null ? $settings.BOUNDS!.minX : -Infinity,
        $settings.BOUNDS!.maxX !== null ? $settings.BOUNDS!.maxX - window.innerWidth : Infinity // todo: use bounding rect
      );
      const boundY = clamp(
        $board.viewOffset.y + deltaY,
        $settings.BOUNDS!.minY !== null ? $settings.BOUNDS!.minY : -Infinity,
        $settings.BOUNDS!.maxY !== null ? $settings.BOUNDS!.maxY - window.innerHeight : Infinity
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
    if (e.shiftKey) {
      mode.set("select");
    } else if (e.metaKey) {
      mode.set("pan");
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (!e.shiftKey && !e.metaKey) {
      $mode === "draw" && stopDrawing();
      ($mode === "pan" || $mode === "panning") && stopPanning();
      $mode === "select" && stopSelect();
      mode.set("draw");
    }
  }

  function onMouseDown(e: MouseEvent | TouchEvent) {
    const target = (e as TouchEvent).targetTouches?.item(0)?.target || (e as MouseEvent).target;
    const { x: clientX, y: clientY } = posToViewportPos(
      (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX,
      (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY
    );

    if (hasClassOrParentWithClass(target as HTMLElement, "tela-ignore")) return;
    if ($mode === "pan" || (e as TouchEvent).targetTouches?.length === 1) {
      mode.set("panning");
    }

    if ($mode === "draw") {
      e.stopPropagation();
      startDrawing();

      selectState.init = { x: clientX, y: clientY };
      selectState.curr = { x: clientX, y: clientY };
      selectState.pos = { x: clientX, y: clientY };
      selectState.size = { x: 0, y: 0 };

      document.addEventListener("mousemove", onMouseMoveDraw);
      document.addEventListener("mouseup", onMouseUp, { once: true });
    } else if ($mode === "panning") {
      e.stopPropagation();
      startPanning();

      dragState.init = { x: clientX, y: clientY };
      dragState.curr = { x: clientX, y: clientY };

      document.addEventListener("mousemove", onMouseMovePan);
      document.addEventListener("mouseup", onMouseUp, { once: true });
      document.addEventListener("touchmove", onMouseMovePan);
      document.addEventListener("touchend", onMouseUp, { once: true });
    } else if ($mode === "select") {
      e.stopPropagation();
      startSelect();

      selectState.init = { x: clientX, y: clientY };
      selectState.curr = { x: clientX, y: clientY };
      selectState.pos = { x: clientX, y: clientY };
      selectState.size = { x: 0, y: 0 };

      document.addEventListener("mousemove", onMouseMoveSelect);
      document.addEventListener("mouseup", onMouseUp, { once: true });
    }
  }

  function onMouseMovePan(e: MouseEvent | TouchEvent) {
    const clientX = (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX;
    const clientY = (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY;

    dragState.offset = {
      x: Math.floor(clientX - dragState.curr.x),
      y: Math.floor(clientY - dragState.curr.y)
    };

    dragState.curr = { x: clientX, y: clientY };

    const boundX = clamp(
      $board.viewOffset.x - dragState.offset.x,
      $settings.BOUNDS!.minX !== null ? $settings.BOUNDS!.minX : -Infinity,
      $settings.BOUNDS!.maxX !== null ? $settings.BOUNDS!.maxX - window.innerWidth : Infinity
    );
    const boundY = clamp(
      $board.viewOffset.y - dragState.offset.y,
      $settings.BOUNDS!.minY !== null ? $settings.BOUNDS!.minY : -Infinity,
      $settings.BOUNDS!.maxY !== null ? $settings.BOUNDS!.maxY - window.innerHeight : Infinity
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

  function onMouseMoveDraw(e: MouseEvent | TouchEvent) {
    const { x: clientX, y: clientY } = posToViewportPos(
      (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX,
      (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY
    );

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

    selectState.curr = { x: clientX, y: clientY };
  }

  function onMouseUp(e: MouseEvent | TouchEvent) {
    if ($mode === "draw") {
      dispatch("drawEnd", { selection: { pos: selectState.pos, size: selectState.size } });
      stopDrawing();
    } else if ($mode === "panning") {
      $mode = "pan";
      stopPanning();
    } else if ($mode === "select") {
      stopSelect();
      dispatch("selectEnd", { selectState });
      selectState = {
        init: { x: 0, y: 0 },
        curr: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
        size: { x: 0, y: 0 }
      };
    }

    //transformCss = `transform: translate(${-$board.viewOffset.x}px, ${-$board.viewOffset.y}px) scale(${$board.zoom});`;
  }

  onMount(() => {
    const rec = containerEl.getBoundingClientRect();
    $board.viewPort = {
      x: rec.x,
      y: rec.y,
      w: rec.right - rec.left,
      h: rec.bottom - rec.top
    }
  });
</script>

{#if Object.values($settings.DEV).includes(true)}
  <!-- todo: add dev toggle -->
  <div
    style="position: absolute; right: 1ch; top: 1ch; background: darkblue; z-index: 200; color: #fff; padding: 4px; display: flex; gap: 2ch; user-select: none; pointer-events: none;"
  >
    {#if $settings.DEV?.SHOW_POS}
      <span>{$board.viewOffset.x} - {$board.viewOffset.y}</span>
    {/if}
    {#if $settings.DEV?.SHOW_MODE}
      <span>{$mode}</span>
    {/if}
  </div>
{/if}

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<div
  class="container"
  style={modeCursorCss}
  on:mousedown={onMouseDown}
  on:touchstart|nonpassive={onMouseDown}
  on:wheel|nonpassive={onWheel}
  bind:this={containerEl}
>
  <div class="board" style={transformCss}>
    {#if $mode === "select" || $mode === "draw"}
      <div class="selection-rect" style={selectionCss} />
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
    /* overscroll-behavior: contain; */
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
    z-index: 99999;
    background: rgba(0, 0, 0, 0.1);
  }
</style>

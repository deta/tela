<script context="module" lang="ts">
  /**
   * Creates a board settings store with given values or defaults as fallback.
   * @param settings The settings to override.
   */
  export function createSettings(settings: DeepPartial<IBoardSettings>): Writable<IBoardSettings> {
    return writable({
      CAN_ZOOM: true,
      SNAP_TO_GRID: false,
      GRID_SIZE: 20,

      CULL: true,
      CULL_MARGIN: 200,
      CHUNK_SIZE: 2000,
      CHUNK_CULL_MARGIN: 2000,
      ...settings,
      BOUNDS: {
        minX: null,
        maxX: null,
        minY: null,
        maxY: null,
        minZoom: 0.3,
        maxZoom: 1,
        limit: "soft",
        ...settings.BOUNDS
      },
      DEV: {
        SHOW_POS: false,
        SHOW_MODE: false,
        CHUNK_DBG: false,
        ...settings.DEV
      }
    } as IBoardSettings); // hack: fixs optional types
  }

  /**
   * Pan the board to the given position.
   * @param viewOffset
   * @param x
   * @param y
   * @param duration
   * @param delay
   */
  export function panTo(
    viewOffset: Vec2<Tweened<number>>,
    x: number,
    y: number,
    duration: number = 400,
    delay: number = 0
  ) {
    return Promise.all([
      viewOffset.x.set(x, { duration, delay }),
      viewOffset.y.set(y, { duration, delay })
    ]);
  }

  /**
   * Zoom the board to a given zoom factor.
   * @param state
   * @param zoom
   * @param duration
   * @param delay
   */
  export function zoomTo(
    state: IBoardState,
    zoom: number,
    duration: number = 400,
    delay: number = 0
  ) {
    return state.zoom.set(zoom, { duration, delay });
  }

  export function createBoard(
    initialState: DeepPartial<{
      viewOffset: Vec2<number>;
      viewPort: Vec4;
      zoom: number;
      mode: TBoardMode;
    }>
  ): IBoard {
    initialState.viewOffset = {
      // @ts-ignore we just override to not create a new object
      x: tweened(initialState.viewOffset?.x === undefined ? 0 : initialState.viewOffset?.x, {
        duration: 0,
        easing: cubicOut
      }),
      // @ts-ignore we just override to not create a new object
      y: tweened(initialState.viewOffset?.y === undefined ? 0 : initialState.viewOffset?.y, {
        duration: 0,
        easing: cubicOut
      })
    };
    initialState.viewPort = {
      // todo
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };
    // @ts-ignore we just override
    initialState.zoom = tweened(initialState.zoom === undefined ? 1 : initialState.zoom, {
      duration: 0,
      easing: cubicOut
    });
    initialState.mode = initialState.mode !== undefined ? initialState.mode : "draw";

    const state = writable<IBoardState>(initialState as unknown as IBoardState); // hack: types

    return {
      state,

      setMode: (mode: TBoardMode) => {
        state.update((s) => {
          s.mode = mode;
          return s;
        });
      },
      panTo: (x: number, y: number, duration = 400, delay = 0) => {
        return panTo(get(state).viewOffset, x, y, duration, delay);
      },
      zoomTo: (zoom: number, duration = 400, delay = 0) => {
        return zoomTo(get(state), zoom, duration, delay);
      }
    };
  }

  export function moveToStackingTop(stack: Writable<string[]>, key: string) {
    const l = get(stack).length;
    console.time(`[StackingOrder-update :: n = ${l}]`); // todo: debug only
    stack.update(s => {
      const i = s.indexOf(key);
      if (i === -1) return s;
      s.splice(i, 1);
      s.push(key);
      return s;
    });
    console.timeEnd(`[StackingOrder-update :: n = ${l}]`);
  }
</script>

<script lang="ts">
  import { derived, get, writable, type Writable } from "svelte/store";
  import type { IBoard, IBoardState, TBoardMode, IBoardSettings } from "./types/Board.type.ts";
  import type { DeepPartial, Vec2, Vec4 } from "./types/Utils.type.ts";
  import { clamp, debounce, hasClassOrParentWithClass } from "./utils.js";
  import { createEventDispatcher, onDestroy, onMount, setContext } from "svelte";
  import { tweened, type Tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import Chunk from "./Chunk.svelte";
  import type { IPositionable } from "./Positionable.svelte";

  export let settings: Writable<IBoardSettings>;
  export let board: IBoard; // "exported" with custom properties
  //export let positionables: { key: string; pos: Vec2<number>; size: Vec2<number> }[];

    // Store the contents as a map of chunks
    // number: composit chunk position
    // Array<IPositionable>: positionables in chunk
  export let chunks: Map<string, Writable<IPositionable[]>> = new Map();

  const dispatch = createEventDispatcher();

  setContext("board", board); // todo: fix
  setContext("settings", settings);
  setContext("stackingOrder", stackingOrder);

  let state = board.state;
  let mode = derived(state, (e) => e.mode);
  let viewX = $state.viewOffset.x;
  let viewY = $state.viewOffset.y;
  $: ({ viewPort } = $state);
  let prevViewChunkX = 0;
  let prevViewChunkY = 0;
  let viewChunkX = writable(0);
  let viewChunkY = writable(0);
  let _viewChunkX = derived(viewX, (e) => Math.floor($viewX / $settings.CHUNK_SIZE));
  let _viewChunkY = derived(viewY, (e) => Math.floor($viewY / $settings.CHUNK_SIZE));
  _viewChunkX.subscribe((v) => {
    if (prevViewChunkX !== v) {
      prevViewChunkX = v;
      viewChunkX.set(v);
    }
  });
  _viewChunkY.subscribe((v) => {
    if (prevViewChunkY !== v) {
      prevViewChunkY = v;
      viewChunkY.set(v);
    }
  });
  $: ({ zoom } = $state);

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

  $: transformCss = `transform-origin: top left; transform: scale(${$zoom}) translate(${-$viewX}px, ${-$viewY}px);`;

  // $: selectionCss = `transform: translate(${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.floor($viewX + (selectState.pos.x - 0.5) / $zoom), $settings.GRID_SIZE!) : $viewX + selectState.pos.x / $zoom
  // }px, ${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.floor($viewY + (selectState.pos.y - 0.5) / $zoom), $settings.GRID_SIZE!) : $viewY + selectState.pos.y / $zoom
  // }px); width: ${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.round(selectState.size.x + 0.5), $settings.GRID_SIZE!) : Math.round(selectState.size.x)
  // }px; height: ${
  //   $settings.SNAP_TO_GRID ? snapToGrid(Math.round(selectState.size.y + 0.5), $settings.GRID_SIZE!) : Math.round(selectState.size.y)
  // }px;`;

  $: selectionCss = `transform: translate3d(${selectState.pos.x}px, ${
    selectState.pos.y
  }px, 0); width: ${Math.round(selectState.size.x)}px; height: ${Math.round(
    selectState.size.y
  )}px;`;

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

  // if ($settings.BOUNDS?.minX !== null && $viewX < $settings.BOUNDS!.minX) {
  //   $viewX = $settings.BOUNDS!.minX;
  // }
  // if ($settings.BOUNDS?.minY !== null && $viewY < $settings.BOUNDS!.minY) {
  //   $viewY = $settings.BOUNDS!.minY;
  // }
  // if ($settings.BOUNDS?.maxX !== null && $viewX > $settings.BOUNDS!.maxX - window.innerWidth) {
  //   $viewX = $settings.BOUNDS!.maxX - window.innerWidth;
  // }
  // if ($settings.BOUNDS?.maxY !== null && $viewY > $settings.BOUNDS!.maxY - window.innerHeight) {
  //   $viewY = $settings.BOUNDS!.maxY - window.innerHeight;
  // }

  // Utils
  function posToViewportPos(x: number, y: number) {
    return {
      x: $viewX / $zoom + x,
      y: $viewY / $zoom + y //y - $viewY + window.scrollY
    };
  }
  function startDrawing() {
    document.body.classList.add("drawing");
    dispatch("drawStart");
  }
  function stopDrawing() {
    document.body.classList.remove("drawing");
    document.removeEventListener("mousemove", onMouseMoveDraw);
    document.removeEventListener("touchmove", onMouseMoveDraw);
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
    document.removeEventListener("touchmove", onMouseMovePan);
    dispatch("panEnd", { offset: $state.viewOffset });
  }

  function startSelect() {
    dispatch("selectStart");
    document.body.classList.add("selecting");
    document.addEventListener("mousemove", onMouseMoveSelect);
    // document.removeEventListener("touchmove", onMouseMoveSelect);
  }
  function stopSelect() {
    document.body.classList.remove("selecting");
    document.removeEventListener("mousemove", onMouseMoveSelect);
    // document.removeEventListener("touchmove", onMouseMoveSelect);
  }

  // UI Handlers
  function onWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!$settings.CAN_ZOOM) return;

      board.setMode("zoom");

      // todo: fix relative to bounding element box not screen pos
      const absoluteMouseXOld = $viewX + e.clientX / $zoom;
      const absoluteMouseYOld = $viewY + e.clientY / $zoom;

      const delta = e.deltaY;
      const newZoom = clamp($zoom - delta / 500, 0.03, 1.9);

      const absoluteMouseXNew = $viewX + e.clientX / newZoom;
      const absoluteMouseYNew = $viewY + e.clientY / newZoom;

      const offsetX = absoluteMouseXOld - absoluteMouseXNew;
      const offsetY = absoluteMouseYOld - absoluteMouseYNew;

      board.panTo($viewX + offsetX, $viewY + offsetY, 0, 0);
      board.zoomTo(newZoom, 0, 0);
    } else {
      if (hasClassOrParentWithClass(e.target as HTMLElement, "tela-ignore")) return;
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.deltaX / $zoom;
      const deltaY = e.deltaY / $zoom;

      const boundX = clamp(
        $viewX + deltaX,
        $settings.BOUNDS!.minX !== null ? $settings.BOUNDS!.minX : -Infinity,
        $settings.BOUNDS!.maxX !== null ? $settings.BOUNDS!.maxX - window.innerWidth : Infinity // todo: use bounding rect
      );
      const boundY = clamp(
        $viewY + deltaY,
        $settings.BOUNDS!.minY !== null ? $settings.BOUNDS!.minY : -Infinity,
        $settings.BOUNDS!.maxY !== null ? $settings.BOUNDS!.maxY - window.innerHeight : Infinity
      );

      board.panTo(boundX, boundY, 0, 0);
      debounce("remove_trackpad_panning", 100, () => document.body.classList.remove("panning"));
    }
    dispatch("zoomEnd", { zoom: $zoom });
    //transformCss = `transform: translate(${-$viewX}px, ${-$viewY}px) scale(${$zoom});`;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.shiftKey) {
      board.panTo(Math.random() * 2000, Math.random() * 2000);
      //mode.set("select");
    } else if (e.metaKey) {
      //mode.set("pan");
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (!e.shiftKey && !e.metaKey) {
      $mode === "draw" && stopDrawing();
      ($mode === "pan" || $mode === "panning") && stopPanning();
      $mode === "select" && stopSelect();
      //mode.set("draw");
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
      //mode.set("panning");
    }

    if ($mode === "draw") {
      e.stopPropagation();
      startDrawing();

      const pX = $viewX + clientX;
      const pY = $viewY + clientY;

      selectState.init = { x: pX, y: pY };
      selectState.curr = { x: pX, y: pY };
      selectState.pos = { x: pX, y: pY };
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
    const { x: clientX, y: clientY } = posToViewportPos(
      (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX,
      (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY
    );

    dragState.offset = {
      x: Math.floor(clientX - dragState.curr.x),
      y: Math.floor(clientY - dragState.curr.y)
    };

    dragState.curr = { x: clientX, y: clientY };

    const boundX = clamp(
      $viewX - dragState.offset.x,
      $settings.BOUNDS!.minX !== null ? $settings.BOUNDS!.minX : -Infinity,
      $settings.BOUNDS!.maxX !== null ? $settings.BOUNDS!.maxX - window.innerWidth : Infinity
    );
    const boundY = clamp(
      $viewY - dragState.offset.y,
      $settings.BOUNDS!.minY !== null ? $settings.BOUNDS!.minY : -Infinity,
      $settings.BOUNDS!.maxY !== null ? $settings.BOUNDS!.maxY - window.innerHeight : Infinity
    );

    // $board.viewOffset = {
    //   x: boundX, //$viewX - dragState.offset.x,
    //   y: boundY //$viewY - dragState.offset.y
    // };

    //transformCss = `transform: translate(${-$viewX}px, ${-$viewY}px) scale(${$zoom});`;
  }

  function onMouseMoveSelect(e: MouseEvent) {
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

    selectState.size.x = selectState.offset.x / $zoom;
    selectState.size.y = selectState.offset.y / $zoom;

    if (selectState.size.x < 0) {
      selectState.size.x = Math.abs(selectState.offset.x / $zoom);
      selectState.pos.x = selectState.init.x - selectState.size.x * $zoom;
    }
    if (selectState.size.y < 0) {
      selectState.size.y = Math.abs(selectState.offset.y / $zoom);
      selectState.pos.y = selectState.init.y - selectState.size.y * $zoom;
    }

    selectState.curr = { x: clientX, y: clientY };
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

    selectState.size.x = selectState.offset.x / $zoom;
    selectState.size.y = selectState.offset.y / $zoom;

    // if (selectState.size.x < 0) {
    //   selectState.size.x = Math.abs(selectState.offset.x / $zoom);
    //   selectState.pos.x = selectState.init.x - selectState.size.x //* $zoom;
    // }
    // if (selectState.size.y < 0) {
    //   selectState.size.y = Math.abs(selectState.offset.y / $zoom);
    //   selectState.pos.y = selectState.init.y - selectState.size.y //* $zoom;
    // }

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

    //transformCss = `transform: translate(${-$viewX}px, ${-$viewY}px) scale(${$zoom});`;
  }

  // let chunks = new Map<string, { key: string; pos: { x: number; y: number } }[]>();
  // positionables.forEach((e) => {
  //   const xChunk = Math.floor(e.pos.x / $settings.CHUNK_SIZE);
  //   const yChunk = Math.floor(e.pos.y / $settings.CHUNK_SIZE);
  //   const key = `${xChunk}:${yChunk}`;
  //   if (!chunks.has(key)) {
  //     chunks.set(key, []);
  //   }
  //   chunks.get(key)!.push(e);
  // });
  //console.debug("Handling n positionables:", Array.from(chunks.values).reduce((a, b) => a + b.length, 0));
  console.debug("Handling n chunks:", chunks.size);

  function chunkInView(xChunk: number, yChunk: number, viewChunkX: number, viewChunkY: number) {
    return (
      // xChunk + $settings.CHUNK_CULL_MARGIN / $settings.CHUNK_SIZE >= viewChunkX &&
      // yChunk + $settings.CHUNK_CULL_MARGIN / $settings.CHUNK_SIZE >= viewChunkY &&
      // xChunk * $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewX + viewPort.w / $zoom &&
      // yChunk * $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewY + viewPort.h / $zoom
      xChunk + 1 + $settings.CHUNK_CULL_MARGIN / $settings.CHUNK_SIZE > viewChunkX &&
      yChunk + 1 + $settings.CHUNK_CULL_MARGIN / $settings.CHUNK_SIZE > viewChunkY &&
      xChunk * $settings.CHUNK_SIZE - $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewX + viewPort.w / $zoom &&
      yChunk * $settings.CHUNK_SIZE - $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewY + viewPort.h / $zoom

    );
  }

  const ckCmp = import("./Chunk.svelte");

  onMount(() => {
    const rec = containerEl.getBoundingClientRect();
    $state.viewPort = {
      x: rec.x,
      y: rec.y,
      w: rec.right - rec.left,
      h: rec.bottom - rec.top
    };
  });
</script>

{#if Object.values($settings.DEV).includes(true)}
  <!-- todo: add dev toggle -->
  <div
    style="position: absolute; right: 1ch; top: 1ch; background: darkblue; z-index: 200; color: #fff; padding: 4px; display: flex; gap: 2ch; user-select: none; pointer-events: none;"
  >
    {#if $settings.DEV?.SHOW_POS}
      <span>{$viewChunkX} // {$viewChunkY}</span>
      <span>{$viewX} // {$viewY} // {$zoom}x</span>
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

    <slot name="meta" />

    {#each chunks.entries() as [k, v] (k)}
      {@const cX = parseInt(k.split(":")[0])}
      {@const cY = parseInt(k.split(":")[1])}
      {#if chunkInView(cX, cY, $viewChunkX, $viewChunkY)}
        {#await ckCmp}
        {:then c}
        <svelte:component this={c.default}
          {board}
          positionables={v}
          chunkX={parseInt(k.split(":")[0])}
          chunkY={parseInt(k.split(":")[1])}
          let:key
          let:x
          let:y
          let:width
          let:height>
          <slot {key} posX={x} posY={y} {width} {height}/>
        </svelte:component>
        {/await}
        <!-- <Chunk
        {board}
          positionables={v}
          chunkX={parseInt(k.split(":")[0])}
          chunkY={parseInt(k.split(":")[1])}
          let:key
          let:x
          let:y
        >
          <slot {key} posX={x} posY={y} />
        </Chunk> -->
      {/if}
      <!-- {#if isChunkInView(parseInt(k.split(":")[0]), parseInt(k.split(":")[1]), $viewChunkX, $viewChunkY)} -->
      <!-- {#if (parseInt(k.split(":")[0]) * CHUNK_SIZE) > ($viewChunkX)}
      <div class="chunk" style="will-change: transform; position: absolute; z-index:10; transform: translate({parseInt(k.split(":")[0]) * CHUNK_SIZE}px, {parseInt(k.split(":")[1]) * CHUNK_SIZE}px); width: {CHUNK_SIZE}px; height: {CHUNK_SIZE}px; background-color: {randCol()};">
        <span style="font-size: 4rem;">{`${parseInt(k.split(":")[0])} : ${parseInt(k.split(":")[1])}`}</span>
        {#if $zoom > 0.4}
        {#each v as positionable, i (positionable.key)}
          <slot x={positionable.pos.x} y={positionable.pos.y}/>
        {/each}
        {/if}
      </div>
    {/if} -->
    {/each}
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;

    overflow: hidden;
    /* overscroll-behavior: contain; */
  }
  .chunk {
    /* transform-style: preserve-3d;
    backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
-webkit-backface-visibility: hidden; */
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

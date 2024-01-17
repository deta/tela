<!-- <svelte:window on:keydown={onKeyDown} /> -->
<svelte:options immutable={true} />

<script context="module" lang="ts">
  // TODO: REMOVE
  // export const dragDelay = writable(180);
  // export const dragAbortMin = writable(8);
  /**
   * Creates a board settings store with given values or defaults as fallback.
   * @param settings The settings to override.
   */
  export function createSettings(settings: DeepPartial<IBoardSettings>): Writable<IBoardSettings> {
    return writable({
      CAN_PAN: true,
      PAN_DIRECTION: "xy",

      CAN_DRAW: true,
      CAN_ZOOM: true,
      CAN_SELECT: true,
      SNAP_TO_GRID: false,
      GRID_SIZE: 20,

      // CULL: true,
      // CULL_MARGIN: 200,

      CHUNK_WIDTH: 500,
      CHUNK_HEIGHT: 500,
      // CHUNK_CULL_MARGIN: 2000,
      // CHUNK_WARM_MARGIN: 1,

      POSITIONABLE_KEY: "key",

      DEV: false,

      ...settings,
      BOUNDS: {
        minX: -Infinity,
        maxX: Infinity,
        minY: -Infinity,
        maxY: Infinity,
        minZoom: 0.3,
        maxZoom: 1,
        limit: "soft",
        ...settings.BOUNDS
      }
    });
  }

  export function createBoard<BaseSt extends BaseState, Actions>(
    settings: Writable<IBoardSettings>,
    stackingOrder: Writable<string[]>,
    initState: DeepPartial<IBoardState<BaseSt, Actions>>,
    initMode: string,
    modes: {}
  ): IBoard<BaseSt, Actions> {
    const cfg = get(settings);
    const selectionRect = writable({ x: 0, y: 0, w: 0, h: 0 });

    initState = {
      zoom: writable(1),
      ...initState,
      viewOffset:
        cfg.BOUNDS.limit === "soft"
          ? spring({ x: 0, y: 0 }, { stiffness: 0.499, damping: 0.999 })
          : tweened({ x: 0, y: 0 }, { duration: 0, easing: cubicOut }),
      // mode: fsm(initMode, modes),
      viewPort: writable({ x: 0, y: 0, w: 0, h: 0, ...initState.viewPort }),
      selection: writable(new Set()),
      selectionRect,
      selectionCss: derived(
        selectionRect,
        (v) =>
          `left: ${v?.x || 0}px; top: ${v?.y || 0}px; width: ${v?.w || 0}px; height: ${
            v?.h || 0
          }px; z-index: 9999999;`
      ),

      stackingOrder
    };

    const state = writable<IBoardState<BaseSt, Actions>>(initState as IBoardState<BaseSt, Actions>);
    const viewOffset = get(state).viewOffset;
    const zoom = get(state).zoom;

    const panTo = (
      x: number,
      y: number,
      opts?: { delay?: number; duration?: number; soft: string | number | boolean }
    ) => {
      opts = {
        delay: 0,
        duration: 0,
        soft: false,
        hard: true,
        ...opts
      };
      viewOffset.update((v) => {
        // TODO: Override if limit axis is used
        v.x = x;
        v.y = y;
        return v;
      }, opts);
    };
    const zoomTo = (
      targetZoom: number,
      opts?: { delay?: number; duration?: number; soft?: string | number | boolean }
    ) => {
      opts = {
        delay: 0,
        duration: 0,
        soft: false,
        hard: true,
        ...opts
      };
      zoom.set(targetZoom, opts);
    };

    return {
      state,
      panTo,
      zoomTo
    };
  }

  export function moveToStackingTop(stack: Writable<string[]>, key: string) {
    stack.update((_stack) => {
      const i = _stack.indexOf(key);
      if (i !== -1) _stack.splice(i, 1);
      _stack.push(key);
      return _stack;
    });
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onMount, setContext } from "svelte";
  import { derived, get, writable, type Writable } from "svelte/store";
  import {
    lerp,
    type DeepPartial,
    type IBoard,
    type IBoardSettings,
    type IBoardState,
    type IPositionable,
    map
  } from "./index.js";
  // import DebugPanels from "./DebugPanels.svelte";
  import type { BaseState } from "./state-machine/fsm.js";
  import { spring, tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { fastFilter, isInsideViewport } from "./utils.js";

  const dispatch = createEventDispatcher();
  export let containerEl: HTMLElement;

  export let settings: Writable<IBoardSettings>;
  export let board: IBoard<any, any>;
  export let positionables: Writable<Writable<IPositionable<any>>[]> = writable([]);

  setContext("board", board);
  setContext("settings", settings);

  const CHUNK_WIDTH = $settings.CHUNK_WIDTH;
  const CHUNK_HEIGHT = $settings.CHUNK_HEIGHT;
  const POSITIONABLE_KEY = $settings.POSITIONABLE_KEY;

  const state = board.state;
  const viewPort = $state.viewPort;
  const zoom = $state.zoom;
  $zoom = 0.5;
  const mode = writable("idle");

  // Actual viewoffset used to transform board
  const viewOffset = writable({ x: 0, y: 0 });
  let viewOffsetTargetX = $viewOffset.x;
  let viewOffsetTargetY = $viewOffset.y;
  let viewX = $viewOffset.x;
  let viewY = $viewOffset.y;
  // ChunkOffset gets updated when viewOffset changes to new chunk
  const chunkOffset = writable({ x: 0, y: 0 });

  // const transformCss = derived([viewOffset, zoom], ([_offset, _zoom]) => {
  //   return `${$mode === "pan" ? "will-change: transform;" : ""}; transform: ${
  //     $zoom !== 1 ? `scale(${$zoom * 100}%)` : ""
  //   } translate3d(${-_offset.x}px, ${-_offset.y}px, 0px);`;
  // });

  let resizeObserver: ResizeObserver;
  onMount(() => {
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        // Set viewport
        const { x, y, width, height } = containerEl.getBoundingClientRect();
        viewPort.update((v) => {
          v.x = x;
          v.y = y;
          v.w = width;
          v.h = height;
          return v;
        });
      });
      resizeObserver.observe(containerEl);
    }
  });

  const visiblePositionables = derived(
    [positionables, viewOffset, viewPort, zoom],
    ([_positionables, _viewOffset, _viewPort, _zoom]) => {
      return fastFilter((positionable) => {
        const p = get(positionable);
        return isInsideViewport(
          p.x,
          p.y,
          p.width,
          p.height,
          _viewOffset.x,
          _viewOffset.y,
          _viewPort,
          _zoom,
          CHUNK_WIDTH,
          CHUNK_HEIGHT
        );
      }, _positionables);
    }
  );

  const renderedPositionables = writable<Writable<IPositionable<any>>[]>([]);
  let toBeRendered: Writable<IPositionable<any>>[] = [];
  let toBeRemoved: Writable<IPositionable<any>>[] = [];


  function processRender() {
    let start = performance.now();
    const RENDER_NUM = 8;
    if (toBeRendered.length === 0 && toBeRemoved.length === 0) return;
    const toRender = toBeRendered.splice(0, RENDER_NUM);
    // const toRemove = toBeRemoved//.splice(0, 5);
    renderedPositionables.update((v) => {
      v = v.concat(toRender);

      // Remove elements from toRender from toBeRendered
      for (let i = 0; i < toRender.length; i++) {
        const e = toRender[i];
        const index = toBeRendered.indexOf(e);
        if (index !== -1) {
          toBeRendered.splice(index, 1);
        }
      }

      // remove duplicate keys from rendered positionables
      //v = v.filter((v, i, a) => a.findIndex(t => (get(t)[POSITIONABLE_KEY] === get(v)[POSITIONABLE_KEY])) === i)

      let removed = 0;
      for (let i = 0; i < v.length; i++) {
        const p = get(v[i]);
        if (
          !isInsideViewport(
            p.x,
            p.y,
            p.width,
            p.height,
            $viewOffset.x,
            $viewOffset.y,
            $viewPort,
            $zoom,
            CHUNK_WIDTH,
            CHUNK_HEIGHT
          )
        ) {
          v.splice(i, 1);
          removed += 1;
        }
      }
      // for (let i = 0; i < toRemove.length; i++) {
      //   const e = toRemove[i];
      //   v = v.slice(v.indexOf(e), 1);
      //   toBeRemoved = toBeRemoved.splice(toBeRemoved.indexOf(e), 1);
      //   removed += 1;
      // }
      if (removed > 0) console.debug(`removed ${removed} positionables.`);
      return v;
    });
    if (toBeRendered.length - RENDER_NUM > 0) {
      setTimeout(processRender);
    } else {
      prt = null;
    }
    let end = performance.now();
    console.debug(`rendered ${RENDER_NUM} positionables in ${end - start}ms`);
  }
  // queueMicrotask(processRender);
  let prt: number | null = null;
  prt = setTimeout(processRender);
  // setInterval(() => queueMicrotask(processRender), 100);

  visiblePositionables.subscribe((v) => {
    // Find new positionables which need to be rendered.
    const newRenderedPositionables = fastFilter((positionable) => {
      return !get(renderedPositionables).includes(positionable);
    }, v);

    for (let i = 0; i < newRenderedPositionables.length; i++) {
      const toRender = newRenderedPositionables[i];
      if (toBeRendered.includes(toRender)) continue;
      toBeRendered.push(toRender);
    }

    // Find positionables which are out of view and need to be removed.
    // const removedRenderedPositionables = fastFilter((positionable) => {
    //   //return !v.includes(positionable);
    //   const p = get(positionable);
    //   return isInsideViewport(
    //     p.x,
    //     p.y,
    //     p.width,
    //     p.height,
    //     $viewOffset.x,
    //     $viewOffset.y,
    //     $viewPort,
    //     $zoom,
    //     CHUNK_WIDTH,
    //     CHUNK_HEIGHT
    //   );
    // }, get(renderedPositionables));

    // for (let i = 0; i < removedRenderedPositionables.length; i++) {
    //   const toRemove = removedRenderedPositionables[i];
    //   if (toBeRemoved.includes(toRemove)) continue;
    //   toBeRemoved.push(toRemove);
    // }

    // // Queue microtask to render 5 of the new rendered positionables.
    // setTimeout(() => {
    //   const toRender = newRenderedPositionables//.splice(0, 5);
    //   console.debug(`rendering ${toRender.length} new positionables.`)
    //   renderedPositionables.update(v => {
    //     v = v.concat(toRender);
    //     // remove duplicate keys from rendered positionables
    //     v = v.filter((v, i, a) => a.findIndex(t => (get(t)[POSITIONABLE_KEY] === get(v)[POSITIONABLE_KEY])) === i)

    //     let removed = 0;
    //     for (let i = 0; i < removedRenderedPositionables.length; i++) {
    //       const toRemove = removedRenderedPositionables[i];
    //       v.slice(v.indexOf(toRemove), 1);
    //       removed += 1;
    //     }
    //     console.debug(`removed ${removed} positionables.`)
    //     return v;
    //   });
    // });

    if (toBeRendered.length > 0 && prt === null) {
      prt = setTimeout(processRender);
    }
  });

  if (typeof requestPostAnimationFrame !== "function") {
    monkeyPatchRequestPostAnimationFrame();
  }

  // monkey-patches requestPostAnimationFrame
  //!\ Can not be called from inside a requestAnimationFrame callback
  function monkeyPatchRequestPostAnimationFrame() {
    console.warn("using a MessageEvent workaround");
    const channel = new MessageChannel();
    const callbacks = [];
    let timestamp = 0;
    let called = false;
    channel.port2.onmessage = (e) => {
      called = false;
      const toCall = callbacks.slice();
      callbacks.length = 0;
      toCall.forEach((fn) => {
        try {
          fn(timestamp);
        } catch (e) {}
      });
    };
    window.requestPostAnimationFrame = function (callback) {
      if (typeof callback !== "function") {
        throw new TypeError("Argument 1 is not callable");
      }
      callbacks.push(callback);
      if (!called) {
        requestAnimationFrame((time) => {
          timestamp = time;
          channel.port1.postMessage("");
        });
        called = true;
      }
    };
  }

  let lastChunkX = Math.floor($viewOffset.x / CHUNK_WIDTH);
  let lastChunkY = Math.floor($viewOffset.y / CHUNK_HEIGHT);
  let panAnimationFrame: number | null = null;
  let panModeTimeout: number | null = null;

  let microTaskKey = {};
  // TODO: Rename this is a macrotask AcTuaLly
  function queueMicroTask(cbk: any) {
    microTaskKey = {};
    const currentKey = microTaskKey;
    queueMicrotask(() => {
      if (microTaskKey === currentKey) cbk();
    });
  }

  // let lastFrame = 0;
  // setInterval(() => {
  //   requestAnimationFrame((time) => {
  //     // const delta = time - lastFrame;
  //     // lastFrame = time;
  //     // console.log(delta)
  //     viewOffset.update(v => {
  //       v.x = viewOffsetTargetX;
  //       v.y = viewOffsetTargetY;
  //       return v;
  //     })
  //   })
  // }, 1000 / 60);

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (e.ctrlKey && $settings.CAN_ZOOM) {
      e.preventDefault();
      e.stopPropagation();
      $mode = "zoom";

      const absXOld = $viewOffset.x + e.clientX / $zoom;
      const absYOld = $viewOffset.y + e.clientY / $zoom;

      const delta = e.deltaY / 1000;
      const newZoom = $zoom - delta * 4; // TODO: CLAMP // TODO: Zoom sensitivity cfg?

      const absXNew = $viewOffset.x + e.clientX / newZoom;
      const absYNew = $viewOffset.y + e.clientY / newZoom;
      const offsetX = absXOld - absXNew;
      const offsetY = absYOld - absYNew;

      if (panAnimationFrame !== null) {
        cancelAnimationFrame(panAnimationFrame);
      }
      panAnimationFrame = requestAnimationFrame(() => {
        viewOffset.update((v) => {
          v.x = v.x + offsetX;
          v.y = v.y + offsetY;
          return v;
        });
        zoom.update(v => {
          v = newZoom;
          return v;
        })
        panAnimationFrame = null;
        if (panModeTimeout !== null) {
          clearTimeout(panModeTimeout);
        }
        panModeTimeout = setTimeout(() => {
          $mode = "idle";
          panModeTimeout = null;
        }, 100);
      });
    } else {
      $mode = "pan";

      viewOffsetTargetX += e.deltaX * (2 - $zoom);
      viewOffsetTargetY += e.deltaY * (2 - $zoom);
      // viewOffset.update(v => {
      //   v.x = viewOffsetTargetX;
      //   v.y = viewOffsetTargetY;
      //   return v;
      // })
      viewOffset.update((v) => {
          v.x = viewOffsetTargetX;
          v.y = viewOffsetTargetY;
          return v;
        });

      if (panAnimationFrame !== null) {
        cancelAnimationFrame(panAnimationFrame);
      }
      panAnimationFrame = requestAnimationFrame(() => {
        viewX = viewOffsetTargetX;
        viewY = viewOffsetTargetY;
        // viewOffset.set({ x: targetOffsetX, y: targetOffsetY }, { duration: 0 });
        panAnimationFrame = null;
        if (panModeTimeout !== null) {
          clearTimeout(panModeTimeout);
        }
        panModeTimeout = setTimeout(() => {
          $mode = "idle";
          panModeTimeout = null;
        }, 100);
      });

      // viewOffset.update(v => {
      //   v.x += e.deltaX;
      //   v.y += e.deltaY;

      //   if ((Math.floor(v.x / CHUNK_WIDTH) !== lastChunkX)|| (Math.floor(v.y / CHUNK_WIDTH) !== lastChunkY)) {
      //   lastChunkX = Math.floor(v.x / CHUNK_WIDTH);
      //   lastChunkY = Math.floor(v.y / CHUNK_HEIGHT);
      //   chunkOffset.update(v => {
      //     v.x = lastChunkX;
      //     v.y = lastChunkY;
      //     return v;
      //   })
      // }
      //   return v;
      // })
    }
  }

  function onMouseMove(e: MouseEvent) {}
</script>

<!--
  TODO: switch to use resize observer to update viewport
-->
<!-- on:mousemove|capture={onMouseMove} -->
<div
  class="tela-container {$$restProps.class || ''}"
  bind:this={containerEl}
  on:wheel={onWheel}
  on:mousedown
>
  {#if $settings.DEV}
    <ul class="dev" style="list-style: none;">
      <li>
        <ul class="dev-txt" style="list-style: none;">
          <!-- TODO: Dynamic version inject -->
          <span style="margin-bottom: 8px;"
            ><i>Tela <small style="color: #b7b7c4;">v3.1.0</small></i></span
          >
          <li><span>Mode:</span><span>{$mode}</span></li>
          <li><span>Zoom:</span><span>{$zoom}</span></li>
          <li>
            <span>Offset:</span><span
              >{$viewOffset.x}, {$viewOffset.y} // {$chunkOffset.x}, {$chunkOffset.y}</span
            >
          </li>
          <!-- <li>
            <span>Viewport:</span><span
              >{$viewPort.x}, {$viewPort.y}, {$viewPort.w}, {$viewPort.h}</span
            >
          </li> -->
          <li><span>N-Cards:</span><span>{$positionables.length}</span></li>
          <!-- <li><span>N-Chunks:</span><span>{$chunks.size}</span></li>
          <li><span>Hot Chunks:</span><span>{$visibleChunks.length}</span></li>
          <li><span>Target Offset:</span><span>{targetOffsetX} // {targetOffsetY}</span></li> -->
          <!-- <li>
            <span>Hot Cards:</span><span
              >{$visiblePositionables.length}
              <small>({$hoisted.length} hoisted)</small></span
            >
          </li>-->
          <li>
            <span>Hot Cards:</span><span>{$visiblePositionables.length}</span>
          </li>
          <li>
            <span>Rendered Cards:</span><span>{$renderedPositionables.length}</span>
          </li>
          <!-- NOTE: Major perf hit due to conditional slot -> No custom dev overlay for now -->
          <!-- TODO: Look into optimizing dev overlay perf -->
          <!-- <slot name="dev" /> -->
        </ul>
      </li>
      <br />
      <!-- <DebugPanels /> -->
    </ul>
  {/if}

  <!-- {#if $mode === "pan"} -->
    <div class="tela-overlay" />
  <!-- {/if} -->

  <div class="tela-board" style="transform: {$zoom !== 1 ? `scale(${$zoom * 100}%)` : ""} translate3d({-viewX}px, {-viewY}px, 0px);">
    <!-- {#if $mode === "select" || $mode === "modSelect"}
      <slot name="selectRect" />
    {/if} -->

    <!-- {#if $settings.DEV}
      <!-- TODO: Using iterator requires updating lib users to Svelte4 --
      <!-- TODO: Perf use iterator is much faster: https://github.com/sveltejs/svelte/issues/7425#issuecomment-1461021936 --
      {#each $visibleChunks as [chunkId, _] (chunkId)}
        {@const index = chunkId.split(":")}
        {@const chunkX = parseInt(index[0])}
        {@const chunkY = parseInt(index[1])}
        <ChunkOverlay {chunkX} {chunkY} />
      {/each}
    {/if} -->

    {#each $renderedPositionables as positionable (get(positionable)[POSITIONABLE_KEY])}
        <!-- {#if $zoom > 0.3} -->
      <slot {positionable} />
      <!-- {:else}
      {@const p = get(positionable)}
      <div class="cardLOD" style="width: {p.width}px; height: {p.height}px;top: {p.y}px; left: {p.x}px;"></div>
      {/if} -->
    {/each}

    <!-- Note: Iterating the chunks instead of visible positionables directly solves card reloading
        TODO: Figure out a way to use this without missing state when deleting stuff from positionables store
    -->
    <!-- {#each [...get(visibleChunks)] as [id, content] (id)}
      {#each get(content) as positionable (get(positionable)[POSITIONABLE_KEY])}
          <slot {positionable} />
        {/each}
    {/each} -->

    <slot name="raw" />
  </div>
</div>

<style>
  .tela-container {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    overscroll-behavior: contain;
    contain: strict;
    width: 100%;
    height: 100%;
    /* content-visibility: auto; */
  }
  :global(.cardLOD) {
    position: absolute;
    background: rgb(150, 150, 150);
  }
  .tela-container * {
    box-sizing: border-box;
  }
  .tela-board {
    position: absolute;
    backface-visibility: hidden;
    transform-origin: top left;
    contain: style layout;
    display: grid;
    grid-template-columns: 1fr;
    /* cubic-bezier(0, .29, .65, .99) */
    /* transition: transform 0.92s cubic-bezier(0, .29, .65, .99); */
    /*ease-out;*/
  }
  .tela-board > * {
    grid-row-start: 1;
    grid-column-start: 1;
  }

  .tela-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    user-select: none;
    z-index: 999999;
  }

  /* DEV */
  .tela-container > .dev {
    margin: 0;
    position: absolute;
    font-family: monospace;
    right: 1ch;
    top: 1ch;
    z-index: 9999999;
    padding: 4px;
    display: flex;
    flex-direction: column;
    /* TODO: Reenable */
    user-select: none;
    /* pointer-events: none; */
  }
  .tela-container > .dev .dev-txt {
    margin: 0;
    font-size: 0.85em;
    font-family: monospace;
    background: darkblue;
    color: #fff;
    padding: 4px;
    display: flex;
    flex-direction: column;
    /* TODO: Reenable */
    user-select: none;
    /* pointer-events: none; */
  }
  :global(.tela-container > .dev .dev-txt li :first-child) {
    color: #b7b7c4;
  }
  :global(.tela-container > .dev .dev-txt li) {
    display: flex;
    justify-content: space-between;
    gap: 1.5ch;
  }
</style>

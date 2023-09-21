<script context="module" lang="ts">
  export interface IPositionable {
    key: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
  }
</script>

<script lang="ts">
  import { getContext, onMount, setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { Vec2, Vec4 } from "./types/Utils.type.js";
  import type { IBoard, IBoardSettings } from "./types/Board.type.js";
  import { isBrowser, snapToGrid } from "./utils.js";
  import type { Tweened } from "svelte/motion";

  export let key: string;
  export let posX: number;
  export let posY: number;
  export let width: number;
  export let height: number;
  // export let z: number | undefined = undefined;

  const board = getContext<IBoard>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");
  const stackingOrder = getContext<Writable<string>>("stackingOrder");

  let state = board.state;
  $: ({ viewPort } = $state);
  $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: ({ zoom } = $state);
  $: z = $stackingOrder.indexOf(key);
  // $: chunkPos = {
  //   x: Math.abs(posX) % $settings.CHUNK_SIZE,
  //   y: Math.abs(posY) % $settings.CHUNK_SIZE
  // };

  $: transformCss = `transform: translate3d(${
    $settings.SNAP_TO_GRID ? snapToGrid(chunkPos.x, $settings.GRID_SIZE!) : chunkPos.x
  }px, ${
    $settings.SNAP_TO_GRID ? snapToGrid(chunkPos.y, $settings.GRID_SIZE!) : chunkPos.y
  }px, 0); width: ${
    $settings.SNAP_TO_GRID ? snapToGrid(width, $settings.GRID_SIZE!) : width
  }px; height: ${
    $settings.SNAP_TO_GRID ? snapToGrid(height, $settings.GRID_SIZE!) : height
  }px; z-index: ${z};`;
  // $: inView = isVisible($state.viewOffset, $state.viewPort);

  // function isVisible(viewOffset: Vec2<Tweened<number>>, viewport: Vec4 = { x: 620, y: 340, w: 1080, h: 720 }) {
  //   if (isBrowser()) {
  //     viewport.w = window.innerWidth; // todo: use viewport itself
  //     viewport.h = window.innerHeight;
  //   }
  //   return (
  //     pos.x > $viewY - $settings.CULL_MARGIN! &&
  //     pos.y > $viewY - $settings.CULL_MARGIN! &&
  //     pos.x + size.x < $viewX + $settings.CULL_MARGIN! + viewport.w / $zoom && // todo: use bounding rect not window
  //     pos.y + size.y < $viewY + $settings.CULL_MARGIN! + viewport.h / $zoom
  //   );
  // }
  function inView(viewX: number, viewY: number, viewPort: Vec4) {
    return ($zoom > 0.6) && (
      // posX + $settings.CULL_MARGIN >= viewX &&
      // posY + $settings.CULL_MARGIN >= viewY
      posX + width >= viewX &&
      posY + height >= viewY &&
      posX + width - $settings.CULL_MARGIN < viewX + viewPort.w / $zoom &&
      posY + height - $settings.CULL_MARGIN < viewY + viewPort.h / $zoom
      // xChunk * $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewX + viewPort.w / $zoom &&
      // yChunk * $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewY + viewPort.h / $zoom
    );
  }

  onMount(() => {
    document.addEventListener("dragMove", (e) => {
      if (e.detail.key === key) {
        posX = e.detail.posX;
        posY = e.detail.posY;
        chunkPos = {
          x: Math.abs(posX) % $settings.CHUNK_SIZE,
          y: Math.abs(posY) % $settings.CHUNK_SIZE
        };
      }
    });
  });
</script>

<!-- {#if cull === undefined ? !$settings.CULL || inView : !cull || inView} -->
<!-- {#if inView($viewX, $viewY, viewPort)} -->
  <svelte:element
    this="div"
    {...$$restProps}
    class="positionable {$$restProps.class || ''}"
    style="{transformCss} {$$restProps.style || ''}"
  >
    <!-- {#if $zoom > 0.6} -->
    {posX}
    <slot />
    <!-- {/if} -->
  </svelte:element>
<!-- {/if} -->

<style>
  .positionable {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;

    transform-style: preserve-3d;
    backface-visibility: hidden;
  }
</style>

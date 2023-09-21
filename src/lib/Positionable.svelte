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

  const board = getContext<IBoard>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");
  const stackingOrder = getContext<Writable<string>>("stackingOrder");

  let state = board.state;
  $: ({ viewPort } = $state);
  $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: ({ zoom } = $state);
  $: z = $stackingOrder.indexOf(key) <= -1 ? 1 : $stackingOrder.indexOf(key) + 1; // todo: kill +1?
  // $: chunkPos = {
  //   x: Math.abs(posX) % $settings.CHUNK_SIZE,
  //   y: Math.abs(posY) % $settings.CHUNK_SIZE
  // };

  $: transformCss = `transform: translate3d(${
    $settings.SNAP_TO_GRID ? snapToGrid(posX, $settings.GRID_SIZE!) : posX
  }px, ${$settings.SNAP_TO_GRID ? snapToGrid(posY, $settings.GRID_SIZE!) : posY}px, 0); width: ${
    $settings.SNAP_TO_GRID ? snapToGrid(width, $settings.GRID_SIZE!) : width
  }px; height: ${
    $settings.SNAP_TO_GRID ? snapToGrid(height, $settings.GRID_SIZE!) : height
  }px; z-index: ${z};`;

  // function inView(viewX: number, viewY: number, viewPort: Vec4) {
  //   return (
  //     $zoom > 0.6 &&
  //     // posX + $settings.CULL_MARGIN >= viewX &&
  //     // posY + $settings.CULL_MARGIN >= viewY
  //     posX + width >= viewX &&
  //     posY + height >= viewY &&
  //     posX + width - $settings.CULL_MARGIN < viewX + viewPort.w / $zoom &&
  //     posY + height - $settings.CULL_MARGIN < viewY + viewPort.h / $zoom
  //     // xChunk * $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewX + viewPort.w / $zoom &&
  //     // yChunk * $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN < $viewY + viewPort.h / $zoom
  //   );
  // }

  onMount(() => {
    document.addEventListener("dragMove", (e) => {
      if (e.detail.key === key) {
        posX = e.detail.posX;
        posY = e.detail.posY;
        // chunkPos = {
        //   x: Math.abs(posX) % $settings.CHUNK_SIZE,
        //   y: Math.abs(posY) % $settings.CHUNK_SIZE
        // };
      }
    });
  });
</script>

<svelte:element
  this="div"
  {...$$restProps}
  class="positionable {$$restProps.class || ''}"
  style="{transformCss} {$$restProps.style || ''}"
>
  <!-- {#if $zoom > 0.6} -->
  <slot />
  {Math.floor(Math.abs(posX) / $settings.CHUNK_SIZE)}
  <!-- {/if} -->
</svelte:element>

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

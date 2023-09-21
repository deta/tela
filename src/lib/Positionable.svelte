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

  export let positionable: IPositionable;
  export let zIndex: number | undefined = undefined;
  let { key, posX, posY, width, height } = positionable;

  const board = getContext<IBoard>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");
  const stackingOrder = getContext<Writable<string>>("stackingOrder");

  let state = board.state;
  $: ({ viewPort } = $state);
  $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: ({ zoom } = $state);
  $: z = zIndex !== undefined ? zIndex : $stackingOrder.indexOf(key);

  $: transformCss = `transform: translate3d(${
    $settings.SNAP_TO_GRID ? snapToGrid(posX, $settings.GRID_SIZE!) : posX
  }px, ${$settings.SNAP_TO_GRID ? snapToGrid(posY, $settings.GRID_SIZE!) : posY}px, 0); width: ${
    $settings.SNAP_TO_GRID ? snapToGrid(width, $settings.GRID_SIZE!) : width
  }px; height: ${
    $settings.SNAP_TO_GRID ? snapToGrid(height, $settings.GRID_SIZE!) : height
  }px; z-index: ${z};`;

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

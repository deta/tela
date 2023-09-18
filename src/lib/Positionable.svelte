<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { Vec2 } from "./types/Utils.type.js";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";
  import { isBrowser, snapToGrid } from "./utils.js";

  export let pos: Vec2;
  export let size: Vec2;
  export let z: number = 1;
  // Culling override
  export let cull: boolean | undefined = undefined;

  const board = getContext<Writable<TBoard>>("board");
  const settings = getContext<Writable<TBoardSettings>>("settings");

  $: transformCss = `transform: translate3d(${
    $settings.SNAP_TO_GRID ? snapToGrid(pos.x, $settings.GRID_SIZE!) : pos.x
  }px, ${
    $settings.SNAP_TO_GRID ? snapToGrid(pos.y, $settings.GRID_SIZE!) : pos.y
  }px, 0); width: ${
    $settings.SNAP_TO_GRID ? snapToGrid(size.x, $settings.GRID_SIZE!) : size.x
  }px; height: ${
    $settings.SNAP_TO_GRID ? snapToGrid(size.y, $settings.GRID_SIZE!) : size.y
  }px; z-index: ${z};`;
  $: inView = isVisible($board.viewOffset)

  function isVisible(viewOffset: Vec2, viewport: Vec2 = { x: 620, y: 340 }) {
    if (isBrowser()) {
      viewport.x = window.innerWidth;
      viewport.y = window.innerHeight;
    }
    return (
      pos.x > viewOffset.x - $settings.CULL_MARGIN! &&
      pos.y > viewOffset.y - $settings.CULL_MARGIN! &&
      pos.x + size.x < viewOffset.x + $settings.CULL_MARGIN! + viewport.x / $board.zoom && // todo: use bounding rect not window
      pos.y + size.y < viewOffset.y + $settings.CULL_MARGIN! + viewport.y / $board.zoom
    );
  }

</script>

{#if cull === undefined ? (!$settings.CULL || inView) : !cull || inView}
<svelte:element
  this="div"
  {...$$restProps}
  class="positionable {$$restProps.class || ''}"
  style="{transformCss} {$$restProps.style || ''}"
>
  <slot />
</svelte:element>
{/if}

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

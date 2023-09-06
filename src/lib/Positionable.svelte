<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { Vec2 } from "./types/Utils.type.js";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";

  export let pos: Vec2;
  export let size: Vec2;
  export let z: number = 1;

  const board = getContext<Writable<TBoard>>("board");
  const settings = getContext<Writable<TBoardSettings>>("settings");

  $: transformCss = `transform: translate(${pos.x}px, ${pos.y}px); width: ${size.x}px; height: ${size.y}px; z-index: ${z};`;
  $: inView = isVisible($board.viewOffset)

  function isVisible(viewOffset: Vec2) {
    return (
      pos.x > viewOffset.x - $settings.CULL_MARGIN! &&
      pos.y > viewOffset.y - $settings.CULL_MARGIN! &&
      pos.x + size.x < viewOffset.x + $settings.CULL_MARGIN! + window.innerWidth / $board.zoom &&
      pos.y + size.y < viewOffset.y + $settings.CULL_MARGIN! + window.innerHeight / $board.zoom


      // pos.x > viewOffset.x - $settings.CULL_MARGIN! &&
      // pos.y > viewOffset.y - $settings.CULL_MARGIN! &&

      // pos.x + size.x < viewOffset.x + $settings.CULL_MARGIN! + window.innerWidth &&
      // pos.y + size.y < viewOffset.y + $settings.CULL_MARGIN! + window.innerHeight
    );
  }

</script>

{#if inView}
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
  }
</style>

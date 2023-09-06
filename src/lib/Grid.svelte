<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";

  export let dotColor = "black";
  export let dotOpacity = 30;
  export let dotSize = 1;

  const board = getContext<Writable<TBoard>>("board");
  const settings = getContext<Writable<TBoardSettings>>("settings");

  // $: transformCss = `transform: translate(${$board.viewOffset.x}px, ${$board.viewOffset.y}px);`;
  $: transformCss = `width: ${100 / $board.zoom}%; height: ${
    100 / $board.zoom
  }%; transform: translate(-${dotSize}px, -${dotSize}px) translate(${
    $board.viewOffset.x - ($board.viewOffset.x % $settings.GRID_SIZE!)
  }px, ${$board.viewOffset.y - ($board.viewOffset.y % $settings.GRID_SIZE!)}px);`;

  $: svgShiftCss = `transform: translate(-${$board.viewOffset.x % $settings.GRID_SIZE!}px, 0px);`;
</script>

<div class="grid" style={transformCss}>
  <svg width="100%" height="100%"  xmlns="http://www.w3.org/2000/svg">
    <pattern
      id="dotGrid"
      x="0"
      y="0"
      width={$settings.GRID_SIZE}
      height={$settings.GRID_SIZE}
      patternUnits="userSpaceOnUse"
    >
      <circle cx={dotSize} cy={dotSize} r={dotSize} fill={dotColor} fill-opacity="{dotOpacity}%" />
    </pattern>

    <!-- Left square with user space tiles -->
    <rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)" />
  </svg>
</div>

<style>
  .grid {
    position: relative;
    min-height: 100%;
    z-index: 0;
  }
  .grid > svg {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

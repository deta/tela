<script lang="ts">
  import type { IPositionable } from "$lib/Positionable.svelte";
  import { randomCssColor } from "$lib/utils.js";
  import { derived, type Writable } from "svelte/store";

  export let card: Writable<IPositionable<"key">>;

  const transformCss = derived(card, (_card) => {
    return `left: ${_card.x}px; top: ${_card.y}px; width: ${_card.width}px; height: ${_card.height}px; contain-intrinsic-size: ${_card.width}px ${_card.height}px;`;
  });
  // const transformCss = derived(card, (_card) => {
  //   return `transform: translate(${_card.x}px, ${_card.y}px); width: ${_card.width}px; height: ${_card.height}px; contain-intrinsic-size: ${_card.width}px ${_card.height}px;`;
  // });
</script>

<div style="{$transformCss} --bg: {randomCssColor()};">
  <!--<slot/>-->
  foo bar
</div>

<style>
  div {
    position: absolute;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    background: var(--bg);
    border: 1px solid rgba(52, 34, 132, 0.793);
  }
</style>

<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import Grid from "$lib/Grid.svelte";
  import type { TBoard, IBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";

  export let dotColor: string = "black";
  export let dotOpacity: number = 30;
  export let dotSize: number = 1;

  const settings = writable({

  } satisfies IBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);
</script>

<main>
  <Board {settings} {board}>
    <Grid {dotColor} {dotOpacity} {dotSize}/>
    <slot/>
  </Board>
</main>

<style>
  main {
    height: 500px;
  }
</style>
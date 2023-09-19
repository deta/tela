<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, IBoardSettings, Vec2 } from "$lib/index.js";
  import { writable } from "svelte/store";

  export let pos: Vec2 = { x: 0, y: 0 };
  export let size: Vec2 = { x: 100, y: 100 };
  export let z: number = 1;

  const settings = writable({} satisfies IBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);
</script>

<main>
  <Board {settings} {board}>
    <Positionable {pos} {size} {z}>
      Positionable
    </Positionable>
  </Board>
</main>

<style>
  main {
    height: 500px;
  }
</style>
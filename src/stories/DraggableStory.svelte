<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import type { TBoard, TBoardSettings, Vec2 } from "$lib/index.js";
  import { writable } from "svelte/store";

  export let pos: Vec2 = { x: 0, y: 0 };
  export let size: Vec2 = { x: 100, y: 100 };

  const settings = writable({} satisfies TBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);

  const element = { pos, size };
  const el2 = { pos: { x: 200, y: 200 }, size: { x: 100, y: 100 } };
</script>

<main class="draggableStory">
  <Board {settings} {board}>
    <Positionable pos={element.pos} size={element.size} z={1}>
      <Draggable bind:pos={element.pos} bind:size={element.size}>
      drag here.
      </Draggable>
      Positionable
    </Positionable>
    <Positionable pos={el2.pos} size={el2.size} z={1}>
      <Draggable bind:pos={el2.pos} bind:size={el2.size}>
      drag here.
      </Draggable>
      Positionable
    </Positionable>
  </Board>
</main>

<style>
  main {
    height: 500px;
  }
  :global(.draggableStory .draggable) {
    background: lightgray;
  }
</style>
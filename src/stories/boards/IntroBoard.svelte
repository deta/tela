<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({

  } satisfies TBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);

</script>

<main class="introBoard">
  <Board {settings} {board}>
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Hello, I am tela.</span>
    </Positionable>

    <Positionable pos={{ x: 200, y: 150 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Try moving the canvas around with the trackpad or by using META + Left Mouse.</span>
    </Positionable>
  </Board>
</main>

<style>
  main.introBoard {
    height: 500px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
  }

  /*:global(.positionable) {
    background: rgba(100, 100, 100, 0.1);
    border-radius: 15px;
    border: 1px solid rgba(0, 0, 0, 0.2);

    padding: 1rem;
  }
  span {
    font-weight: 500;
  }*/
</style>
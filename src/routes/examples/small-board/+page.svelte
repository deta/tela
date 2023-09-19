<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, IBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({

  } satisfies IBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);

</script>

<main>
  <Board {settings} {board}>
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Welcome.</span>
    </Positionable>

    <Positionable pos={{ x: 500, y: 250 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Welcome.</span>
    </Positionable>
  </Board>
</main>

<style>
  :global(body) {
    background: #eee;
    height: 2000px;
    padding-top: 50px;
  }
  main {
    position: static;
    width: 80%;
    margin: 0 auto;
    height: 800px;
    background: #fff;
  }

  :global(.positionable) {
    background: rgba(100, 100, 100, 0.1);
    border-radius: 15px;
    border: 1px solid rgba(0, 0, 0, 0.2);

    padding: 1rem;
  }
  span {
    font-weight: 500;
  }
</style>
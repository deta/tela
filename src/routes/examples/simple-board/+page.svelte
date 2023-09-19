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
      <br>
      <input type="text" name="asf" id="">
    </Positionable>
  </Board>
</main>

<style>
  main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
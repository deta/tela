<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import Grid from "$lib/Grid.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, IBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({
    SNAP_TO_GRID: true,
    GRID_SIZE: 13
  } satisfies IBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);

  let pos2 = {
    x: 500,
    y: 250
  }

</script>

<main>
  <Board {settings} {board}>
    <Grid />
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Welcome.</span>
    </Positionable>

    <Positionable pos={pos2} size={{ x: 400, y: 300 }} z={1}>
      <Draggable bind:pos={pos2} size={{ x: 400, y: 300 }}>
        Drag Handle
      </Draggable>
      <div class="content">
        <span>Welcome.</span>
        <br>
        <input type="text" name="asf" id="">
      </div>
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
    background: rgba(230, 230, 230, 1);
    border-radius: 15px;
    border: 1px solid rgba(0, 0, 0, 0.2);

    overflow: hidden;
  }
  :global(.draggable) {
    background: darkgray;
    padding: 1ch;
    cursor: move;
  }
  .content {
    padding: 1.25ch;
  }
  span {
    font-weight: 500;
  }
</style>
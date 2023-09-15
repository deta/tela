<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import Grid from "$lib/Grid.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";

  export let settings: TBoardSettings;
  export let board: TBoard;

  const _settings = writable(settings);
  const _board = writable(board);
</script>

<main class="boardStory">
  <Board settings={_settings} board={_board}>
    <Positionable pos={{ x: 0, y: 0 }} size={{ x: 300, y: 300}}>
      Example
    </Positionable>
    <slot/>
  </Board>
</main>

<style>
  main {
    height: 500px;
  }
  :global(.boardStory .positionable) {
    background: #eee;
  }
</style>
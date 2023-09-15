<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings);
  const board = writable({} satisfies TBoard);
</script>

<main class="stylingExample">
  <Board {settings} {board}>
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      <header>
        <span>Tela class styling</span>
      </header>
      <p>
        This card uses the default 'positionable' class provided by tela to style it.
        Note: These styles will automatically apply to all other positionables as well.
      </p>
    </Positionable>

    <Positionable class="card" pos={{ x: 420, y: 400 }} size={{ x: 400, y: 300 }} z={1}>
      <header>
        <span>Class styling</span>
      </header>
      <p>
        This card adds a 'card' class to the positionable and styles it inside the css
        Style block.
      </p>
    </Positionable>

    <Positionable
      style="background: #fefe;"
      pos={{ x: 400, y: 250 }}
      size={{ x: 300, y: 40 }}
      z={1}
    >
      <span>Styled using inline style tag. </span>
    </Positionable>
  </Board>
</main>

<style>
  main.stylingExample {
    height: 500px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  :global(.stylingExample .positionable) {
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 2ch;
  }

  :global(.stylingExample .card) {
    background: floralwhite;
  }
  :global(.stylingExample .card > header) {
    font-weight: 600;
    font-size: 1.3em;
  }
</style>

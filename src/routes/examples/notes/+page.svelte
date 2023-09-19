<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Grid from "$lib/Grid.svelte";
  import Note from "./Note.svelte";
  import type { TBoard, IBoardSettings, Vec2 } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({
    SNAP_TO_GRID: true,
    CAN_ZOOM: false,
    GRID_SIZE: 13
  } satisfies IBoardSettings);

  const board = writable({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);

  const notes = writable([
    {
      id: "s",
      pos: { x: 10, y: 10 },
      size: { x: 400, y: 300 },
      content: "Welcome. Try editing me, drag me around or draw on the board to create a new note."
    }
  ]);
  const stackingOrder = writable(["s"]);

  // This event is emitted when the user finishes drawing a box on the board
  // it can be used to create new items on the board
  function onDrawEnd(e: CustomEvent<{ selection: { pos: Vec2; size: Vec2 } }>) {
    const { pos, size } = e.detail.selection;
    pos.x += $board.viewOffset.x; // todo: this should be handled by tela
    pos.y += $board.viewOffset.y;
    if (size.x < 10 || size.y < 10) return;

    const note = {
      id: crypto.randomUUID(),
      pos,
      size,
      content: "Edit me."
    };
    notes.update((state) => {
      state.push(note);
      $stackingOrder.push(note.id);
      return state;
    });
  }

  function onDragStart(id: string) {
    stackingOrder.update(s => {
      s = s.filter(i => i !== id);
      s.push(id);
      return s;
    })
  }

</script>

<main>
  <Board {settings} {board} on:drawEnd={onDrawEnd}>
    <Grid />

    {#each $notes as note}
      <Note {note} {stackingOrder} on:dragStart={() => onDragStart(note.id)}/>
    {/each}

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
    background: rgba(240, 240, 240, 1);
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);

    overflow: hidden;
  }
  :global(.draggable) {
    background: rgb(215, 215, 215);
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
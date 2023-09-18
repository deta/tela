<script lang="ts">
  import Positionable from "$lib/Positionable.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import type { Writable } from "svelte/store";

  export let note: {
    id: string;
    pos: { x: number; y: number };
    size: { x: number; y: number };
    content: string;
  };

  export let stackingOrder: Writable<string[]>;
</script>

<Positionable class="note" pos={note.pos} size={note.size} z={$stackingOrder.findIndex(e => e === note.id)}>
  <Draggable bind:pos={note.pos} size={note.size} on:dragStart>
    Note
  </Draggable>
  <div class="content">
    <div class="editor" bind:textContent={note.content} contenteditable="true">
      {note.content}
    </div>
  </div>
</Positionable>

<style>
  :global(.note) {
    display: flex;
    flex-direction: column;
  }
  .content {
    flex: 1;
    overflow-y: scroll;
  }
  .editor {
    min-height: 100%;
    padding: 2ch;
  }
  .editor:focus {
    outline: none;
  }

  :global(body.drawing *) {
    user-select: none !important;
  }
</style>
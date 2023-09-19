<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, IBoardSettings } from "$lib/types/Board.type.js";
  import type { Vec2 } from "$lib/types/Utils.type.js";
  import { writable } from "svelte/store";

  const settings = {

  } satisfies IBoardSettings;

  const board = writable<TBoard>({
    viewOffset: { x: 0, y: 0 },
    zoom: 1
  } satisfies TBoard);

  const cards: { key: string, pos: Vec2, size: Vec2 }[] = [];
  const n = 20; // 30 -> 7.000  //  50 -> 20.000
    console.warn("Created", n * n, "cards");
    for (let x = -n; x < n; x++) {
      for (let y = -n; y < n; y++) {
        cards.push({
          key: `${x}-${y}`,
          pos: { x: x * 200 + 0, y: y* 200 + 0 },
          size: { x: 200, y: 200 }
        });
      }
    }

</script>


<span style="position: fixed; left: 1ch; bottom: 1ch; z-index: 200; background: white;">{$board.viewOffset.x} - {$board.viewOffset.y}</span>
<main>
  <Board {settings} {board}>

    {#each cards as card, i}
    <Positionable bind:pos={card.pos} bind:size={card.size} class="card">
      <Draggable bind:pos={card.pos}>
        Header
      </Draggable>
      <div class="content" style="background-color: rgba({card.pos.x / 12}, {70 + card.pos.y / 12}, {card.pos.y / 12}, 0.8);">
        {i} @ {card.pos.x}, {card.pos.y}
      </div>
    </Positionable>
    {/each}

  </Board>
</main>

<style>
  :global(html, body, main) {
    min-height: 100%;
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }


  :global(.card) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    user-select: none;

		overflow: hidden;
	}

  :global(.card .header) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-block: 0.3ch;
		cursor: move;
    background: rgba(0, 0, 0, 0.1);
	}

	.content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
	}
</style>
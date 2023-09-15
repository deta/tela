<script context="module" lang="ts">
  export const activeBoard = writable<TBoard>();
  export const activeStackingOrder = writable<string[]>([]);
</script>

<script lang="ts">
  import Board from "$lib/old/board/Board.svelte";
  import Draggable from "$lib/old/board/Draggable.svelte";
  import Positionable from "$lib/old/board/Positionable.svelte";
  import type { TBoard } from "$lib/types/Board.type.js";
  import type { Vec2 } from "$lib/types/Utils.type.js";
  import { derived, writable } from "svelte/store";

  export const board = writable<TBoard>({
    key: "board",
    viewOffset: { x: 0, y: 0 },
    zoom: 1,
    positionables: writable([]),
    inView: writable([]),
  });

  function isInView(offset: Vec2, card: { key: string, pos: Vec2, size: Vec2 }): boolean {

    // console.log("wright", ($board.viewOffset.x) + (window.innerWidth));
    // console.log("cbriPos", card.pos.x / $board.zoom);



    return (
      true
      // $board.viewOffset.x / zoom <= card.pos.x / zoom &&
      // $board.viewOffset.y / zoom <= card.pos.y / zoom &&
      // card.pos.x / zoom <= ($board.viewOffset.x + 1200 * (2+zoom)) / zoom &&
      // card.pos.y / zoom <= ($board.viewOffset.y + 900 * (2+zoom)) / zoom
      // (card.pos.x + card.size.x) / zoom <= Math.abs(($board.viewOffset.x + window.innerWidth * zoom)) &&
      // (card.pos.y + card.size.y) / zoom <= Math.abs(($board.viewOffset.y + window.innerHeight * zoom))

      //(card.pos.y + card.size.y) / zoom <= ($board.viewOffset.y + window.innerHeight * invZoom)
      // (card.pos.x + card.size.x) / zoom <= (window.innerWidth / 2) / invZoom
      // (card.pos.x + card.size.x) / $board.zoom <= $board.viewOffset.x + window.innerWidth * wwScale
      //(card.pos.x + card.size.x) / $board.zoom <= $board.viewOffset.x + window.innerWidth
      // (card.pos.x + card.size.x) / $board.zoom <= ($board.viewOffset.x + window.innerWidth) / $board.zoom &&
      // (card.pos.y + card.size.y) / $board.zoom <= ($board.viewOffset.y + window.innerHeight) / $board.zoom



    // (card.pos.x + card.size.x) / $board.zoom <= (window.innerWidth + $board.viewOffset.x) * $board.zoom //(($board.viewOffset.x + window.innerWidth  - $board.viewOffset.x) / (2- $board.zoom))
      // (card.pos.y + card.size.y) / $board.zoom <= (($board.viewOffset.y + window.innerHeight - $board.viewOffset.y) / (2- $board.zoom))

      //card.pos.x + card.size.x <= ($board.viewOffset.x + window.innerWidth) / $board.zoom  &&
      //card.pos.y + card.size.y <= ($board.viewOffset.y + window.innerHeight) / $board.zoom
    )

  }

    const cards: { key: string, pos: Vec2, size: Vec2, wc: boolean }[] = [];

    $: renderable = cards.filter(card => isInView($board.viewOffset, card));

    // generate cards
    const n = 45;
    console.warn("Drawing", n * n, "cards");
    for (let x = -n; x < n; x++) {
      for (let y = -n; y < n; y++) {
        cards.push({
          key: `${x}-${y}`,
          pos: { x: x * 200 + 0, y: y* 200 + 0 },
          size: { x: 200, y: 200 },
          wc: false
        });
      }
    }

</script>

<span style="position: fixed; left: 1ch; bottom: 1ch; z-index: 200; background: white;">{$board.viewOffset.x} - {$board.viewOffset.y}</span>
<span style="position: fixed; right: 1ch; bottom: 1ch; z-index: 200; background: darkblue; color:white;">{renderable.length} rendered</span>
<main>
  <Board activeBoard={board} on:dragEnd={() => {}}>
<span style="transform-origin: top left;width: 100px; height: 100px;background: red; position: absolute; left:0;top:0; transform: translate({(($board.viewOffset.x + window.innerWidth - 10 - $board.viewOffset.x) / ( 2- $board.zoom))}px, 200px);">asd</span>
<span style="transform-origin: top left;width: {(window.innerWidth / 2) / (2- $board.zoom)}px; height: {window.innerHeight}px;background: cyan; position: absolute; left:0;top:0; transform: translate({0 - $board.viewOffset.x}px, {0 - $board.viewOffset.y}px);">asd</span>

    {#each renderable as card, i}
      <Positionable class="card tela-ignore" data-key="" {board}
        stackingOrder={$activeStackingOrder}
        wc={card.wc}
        bounds={{
          key: card.key,
          pos: { x: card.pos.x, y: card.pos.y },
          size: { x: card.size.x, y: card.size.y }
        }}>
      <Draggable bind:pos={card.pos} bind:wc={card.wc} {board} class="header">
        drag
      </Draggable>

      <div class="content" style="background-color: rgba({card.pos.x / 12}, {70 + card.pos.y / 12}, {card.pos.y / 12}, 0.8);">
        {i} @ {card.pos.x}, {card.pos.y}
      </div>
    </Positionable>
    {/each}

  </Board>
</main>


<style>
  :global(body) {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }
  main {
    height: 100vh;
    width: 100vw;
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

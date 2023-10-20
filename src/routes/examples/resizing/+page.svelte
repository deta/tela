<script lang="ts">
  import Board, { createBoard, createSettings } from "$lib/Board.svelte";
  import { absToChunkIndex, positionableInView } from "$lib/Chunk.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import Grid from "$lib/Grid.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { IPositionable } from "$lib/Positionable.svelte";
  import Resizable from "$lib/Resizable.svelte";
  import type { IBoard as TBoard } from "$lib/types/Board.type.js";
  import { randomCssColor } from "$lib/utils.js";
  import { writable, type Writable } from "svelte/store";

  let settings = createSettings({
    DEV: {
      SHOW_POS: true,
      SHOW_MODE: true,
      CHUNK_DBG: true
    }
  });

  let board: TBoard = createBoard({});
  const state = board.state;
  $: ({ viewPort } = $state);
  $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: ({ zoom } = $state);

  let cards: Writable<{ key: string; posX: number; posY: number; width: number; height: number }[]> = writable([]);
  let chunks = writable(new Map<string, Writable<IPositionable[]>>());
  let stackingOrder = writable<string[]>([]);

  // cards.subscribe(_cards => {
  //   chunks.update(_chunks => {
  //     _cards.forEach(_card => {
  //       const [chunkX, chunkY] = absToChunkIndex(_card.posX, _card.posY, $settings.CHUNK_SIZE!);
  //       if (_chunks.has(`${chunkX}:${chunkY}`)) {
  //         _chunks.get(`${chunkX}:${chunkY}`)!.update(_chunk => {
  //           if (_chunk.findIndex(e => e.key === _card.key) === -1) {
  //             _chunk.push(_card);
  //           }
  //           return _chunk;
  //         })
  //         // .update(s => {
  //         //   s.push(_card);
  //         //   return s;
  //         // });
  //       } else {
  //         _chunks.set(`${chunkX}:${chunkY}`, writable([_card]));
  //       };
  //     });
  //     return _chunks;
  //   })
  // })

  const n = 10000;
  const spread = 100; //400;
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 200 * spread;
    const y = Math.random() * 200 * spread;

    const [chunkX, chunkY] = absToChunkIndex(x, y, $settings.CHUNK_SIZE!);
    let key = crypto.randomUUID();
    cards.update(s => {
      s.push({
        key,
        posX: x,
        posY: y,
        width: 420,
        height: 220
      })
      return s;
    });
    $stackingOrder.push(key);
    // $chunks.has(`${chunkX}:${chunkY}`) || $chunks.set(`${chunkX}:${chunkY}`, writable([]));
    // $chunks.get(`${chunkX}:${chunkY}`)!.update(s => {
    //   let key = crypto.randomUUID();
    //   s.push({
    //     key,
    //     posX: x,
    //     posY: y,
    //     width: 420,
    //     height: 220
    //   })
    //   $stackingOrder.push(key);
    //   return s;
    // });
  }
  console.warn("Created", n, "cards");

  const regularCard = {
    key: "asf",
    posX: 0,
    posY: 0,
    width: 400,
    height: 300,
  };
  $stackingOrder.push(regularCard.key);
</script>

<main>
  <Board {settings} {board} {stackingOrder}>
    <Grid dotColor="black" dotOpacity={30} dotSize={1} />

    {#each $cards as card}
    {#if positionableInView(card.posX, card.posY, card.width, card.height, $viewX, $viewY, 2000, viewPort, $zoom)}
    <Positionable positionable={card} class="card">
      <Draggable
        key={card.key}
        bind:posX={card.posX}
        bind:posY={card.posY}
        width={card.width}
        height={card.height}
        size={{ x: 400, y: 200 }}
        class="header"
      >
        frag me
      </Draggable>
      <Resizable positionable={card} direction="wn" style="position: absolute; bottom:0;right:0;">x</Resizable>
      <Resizable positionable={card} direction="ne" style="position: absolute; bottom:0;left:0;">x</Resizable>
      <Resizable positionable={card} direction="es" style="position: absolute; top:0;left:0;">x</Resizable>
      <Resizable positionable={card} direction="sw" style="position: absolute; top:0;right:0;">x</Resizable>
      <div class="content" style="background-color: {randomCssColor()};">regular positionable</div>
    </Positionable>
    {/if}
    {/each}

    <!-- <Chunked {chunks} let:item>
      {#await import("$lib/Positionable.svelte") then c}
        <svelte:component this={c.default} positionable={item} class="card">
          <Draggable
            key={item.key}
            posX={item.posX}
            posY={item.posY}
            size={{ x: 400, y: 800 }}
            class="header"
            on:dragMove
          >
            Header
          </Draggable>
          <div class="content" style="background-color: {randomCssColor()};">
            {item.key}
          </div>
        </svelte:component>
      {/await}
    </Chunked> -->
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
    background: rgba(0, 0, 0, 0.3);
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

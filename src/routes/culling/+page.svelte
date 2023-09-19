<script lang="ts">
  import Board, { createBoard, createSettings } from "$lib/Board.svelte";
  import { absToChunkIndex } from "$lib/Chunk.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import Grid from "$lib/Grid.svelte";
  import type { IPositionable } from "$lib/Positionable.svelte";
  import type { IBoard as TBoard } from "$lib/types/Board.type.js";
  import type { Vec2 } from "$lib/types/Utils.type.js";
  import { writable } from "svelte/store";

  let settings = createSettings({
    DEV: {
      SHOW_POS: true,
      SHOW_MODE: true
    }
  });

  let board: TBoard = createBoard({});

  // let cards: { key: string; pos: Vec2<number>; size: Vec2<number> }[] = [];
  let cards = new Map<string, Array<IPositionable>>();

  function addCard(x: number, y: number) {
    const [chunkX, chunkY] = absToChunkIndex(x, y, $settings.CHUNK_SIZE!);

    cards.has(`${chunkX}:${chunkY}`) || cards.set(`${chunkX}:${chunkY}`, []);
    cards.get(`${chunkX}:${chunkY}`)!.push({
      key: `${x}-${y}`,
      posX: x,
      posY: y,
      width: 420,
      height: 120
    });
  }
  addCard(0, 0)

  // const n = 20000;
  // const spread = 150; //400;
  // for (let i = 0; i < n; i++) {
  //   const x = Math.random() * 200 * spread;
  //   const y = Math.random() * 200 * spread;

  //   const [chunkX, chunkY] = absToChunkIndex(x, y, $settings.CHUNK_SIZE!);

  //   cards.has(`${chunkX}:${chunkY}`) || cards.set(`${chunkX}:${chunkY}`, []);
  //   cards.get(`${chunkX}:${chunkY}`)!.push({
  //     key: `${x}-${y}`,
  //     posX: x,
  //     posY: y,
  //     width: 120,
  //     height: 120
  //   });
  //   console.warn("Created", n, "cards");
  // }
  const randCol = () => {
    let r = Math.floor(Math.random() * 256); // Random between 0-255
    let g = Math.floor(Math.random() * 256); // Random between 0-255
    let b = Math.floor(Math.random() * 256); // Random between 0-255
    return "rgba(" + r + "," + g + "," + b + ", 0.8)";
  };

  //const foo = writable<{ key: string; pos: Vec2<number>; size: Vec2<number> }[]>(cards);

  function onDragMove(e: CustomEvent<{ key: string; posX: number; posY: number }>) {
    foo.update((cards) => {
      const i = cards.findIndex((c) => c.key === e.detail.key);
      cards[i].pos = { x: e.detail.posX, y: e.detail.posY };
      return cards;
    });
  }
</script>

<main>
  <Board {settings} {board} chunks={cards} let:key let:posX let:posY let:width let:height>
    <!-- <Grid dotColor="black" dotOpacitposY={30} dotSize={1} /> -->

    <!-- {#key foo} -->
    {#await import("$lib/Positionable.svelte") then c}
      <svelte:component this={c.default} {key} {posX} {posY} {width} {height} class="card">
        {key}
        <Draggable
          {key}
          {posX}
          {posY}
          size={{ x: 400, y: 400 }}
          class="header"
          on:dragMove={onDragMove}
        >
          Header
        </Draggable>
        <div class="content" style="background-color: {randCol()};">
          <!-- {i} @-->
          {posX}, {posY}
        </div>
      </svelte:component>
    {/await}
    <!-- <Positionable {key} {posX} {posY} width={400} height={200} class="card">
        {key}
        <Draggable
          {key}
          {posX}
          {posY}
          size={{ x: 400, y: 400 }}
          class="header"
          on:dragMove={onDragMove}
        >
          Header
        </Draggable>
        <div class="content" style="background-color: {randCol()};">
          <!-- {i} @
          {posX}, {posY}
        </div>
      </Positionable> -->
    <!-- {/key} -->
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

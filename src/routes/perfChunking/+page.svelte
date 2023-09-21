<script lang="ts">
  import Board, { createBoard, createSettings } from "$lib/Board.svelte";
  import { absToChunkIndex } from "$lib/Chunk.svelte";
  import Chunked from "$lib/Chunked.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import Grid from "$lib/Grid.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { IPositionable } from "$lib/Positionable.svelte";
  import type { IBoard as TBoard } from "$lib/types/Board.type.js";
  import type { Vec2 } from "$lib/types/Utils.type.js";
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

  // let cards: { key: string; pos: Vec2<number>; size: Vec2<number> }[] = [];
  let chunks = writable(new Map<string, Writable<IPositionable[]>>());

  let stackingOrder = writable<string[]>([]);

  const n = 2;
  const spread = 0.9; //400;
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 200 * spread;
    const y = Math.random() * 200 * spread;

    const [chunkX, chunkY] = absToChunkIndex(x, y, $settings.CHUNK_SIZE!);

    $chunks.has(`${chunkX}:${chunkY}`) || $chunks.set(`${chunkX}:${chunkY}`, writable([]));
    $chunks.get(`${chunkX}:${chunkY}`)!.update(s => {
      let key = crypto.randomUUID();
      s.push({
        key,
        posX: x,
        posY: y,
        width: 420,
        height: 220
      })
      $stackingOrder.push(key);
      return s;
    });
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
  <Board {settings} {board} {chunks} {stackingOrder}>
    <Grid dotColor="black" dotOpacity={30} dotSize={1} />

    <Positionable key={regularCard.key} posX={regularCard.posX} posY={regularCard.posY} width={regularCard.width} height={regularCard.height}>
      <Draggable key={regularCard.key} bind:posX={regularCard.posX} bind:posY={regularCard.posY} width={regularCard.width} height={regularCard.height} size={{x:400,y:200}} class="header">
        frag me
      </Draggable>
      <div class="content" style="background-color: {randomCssColor()};">
            regular positionable
      </div>
    </Positionable>

    <Chunked {chunks} let:key let:posX let:posY let:width let:height>
      {#await import("$lib/Positionable.svelte") then c}
        <svelte:component this={c.default} {key} {posX} {posY} {width} {height} class="card">
          <Draggable
            {key} {posX} {posY}
            size={{ x: 400, y: 800 }}
            class="header"
            on:dragMove
          >
            Header
          </Draggable>
          <div class="content" style="background-color: {randomCssColor()};">
            {key}
          </div>
        </svelte:component>
      {/await}
    </Chunked>

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

<script lang="ts">
  import { getContext, onMount } from "svelte";
  import Chunk from "./Chunk.svelte";
  import { derived, get, writable, type Writable } from "svelte/store";
  import type { IPositionable } from "./Positionable.svelte";
  import type { IBoard, IBoardSettings } from "./index.ts";

  export let chunks: Writable<Map<string, Writable<IPositionable[]>>>;
  export let lazy = true;

  let element: HTMLDivElement;

  const board = getContext<IBoard>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");

  const chunkComponent = import("./Chunk.svelte");

  let state = board.state;
  $: ({ viewPort } = $state);
  // $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: viewX = $state.viewOffset.x;
  $: viewY = $state.viewOffset.y;
  $: ({ zoom } = $state);

  let prevViewChunkX = 0;
  let prevViewChunkY = 0;
  let viewChunkX = writable(0);
  let viewChunkY = writable(0);

  // overcomplicated perf optimization -> todo: extract to custom "remembering" store
  let _viewChunkX = derived($state.viewOffset.x, (e) => Math.floor($viewX / $settings.CHUNK_SIZE));
  let _viewChunkY = derived($state.viewOffset.y, (e) => Math.floor($viewY / $settings.CHUNK_SIZE));
  _viewChunkX.subscribe((v) => {
    if (prevViewChunkX !== v) {
      prevViewChunkX = v;
      viewChunkX.set(v);
    }
  });
  _viewChunkY.subscribe((v) => {
    if (prevViewChunkY !== v) {
      prevViewChunkY = v;
      viewChunkY.set(v);
    }
  });

  function chunkInView(xChunk: number, yChunk: number, viewChunkX: number, viewChunkY: number) {
    return (
      xChunk + 1 + $settings.CHUNK_CULL_MARGIN / $settings.CHUNK_SIZE >= viewChunkX &&
      yChunk + 1 + $settings.CHUNK_CULL_MARGIN / $settings.CHUNK_SIZE >= viewChunkY &&
      xChunk * $settings.CHUNK_SIZE - $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN <=
        $viewX + viewPort.w / $zoom &&
      yChunk * $settings.CHUNK_SIZE - $settings.CHUNK_SIZE - $settings.CHUNK_CULL_MARGIN <=
        $viewY + viewPort.h / $zoom
    );
  }

  // Handlers
  function onPositionableChunkChanged(e: CustomEvent<{ key: string, initChunk: { x: number, y: number }, newChunk: { x: number, y: number }, newPos: { x: number, y: number } }>) {
    const { key, initChunk, newChunk, newPos } = e.detail;

    chunks.update(cks => {
      const initCk = cks.get(`${initChunk.x}:${initChunk.y}`);
      if (!initCk) return cks; // todo: warn? dont rly need cuz if !chunked positionable should be fine.

      // Extract positionable & remove init chunk if empty.
      let positionable: IPositionable | undefined;
      initCk.update(ck => {
        positionable = ck.find(p => p.key === key);
        ck = ck.filter(p => p.key !== key);
        return ck;
      });
      if (!positionable) return cks; // todo: warn? dont rly need cuz if !chunked positionable should be fine.
      if (get(initCk).length <= 0) {
        cks.delete(`${initChunk.x}:${initChunk.y}`);
      }

      // Update positionable.
      positionable.posX = newPos.x;
      positionable.posY = newPos.y;

      // Add positionable to new chunk.
      if (!cks.has(`${newChunk.x}:${newChunk.y}`)) {
        cks.set(`${newChunk.x}:${newChunk.y}`, writable([]));
      }
      cks.get(`${newChunk.x}:${newChunk.y}`)!.update(s => {
        s.push(positionable!);
        return s;
      });

      return cks;
    });
  }

  onMount(() => element.addEventListener("positionableChunkChanged", onPositionableChunkChanged))
</script>

<div class="chunked" bind:this={element}>
<!-- {#key $chunksUpdate} -->
  {#each $chunks.entries() as [k, v] (k)}
    {@const cX = parseInt(k.split(":")[0])}
    {@const cY = parseInt(k.split(":")[1])}
    {#if chunkInView(cX, cY, $viewChunkX, $viewChunkY)}
      {#if lazy}
      {#await chunkComponent then c}
        <svelte:component
          this={c.default}
          {board}
          positionables={v}
          chunkX={cX}
          chunkY={cY}
          let:item
        >
          <slot {item}/>
        </svelte:component>
      {/await}
      {:else}
      <Chunk
          {board}
            positionables={v}
            chunkX={cX}
            chunkY={cY}
            let:item
          >
            <slot {item}/>
          </Chunk>
      {/if}
    {/if}
  {/each}
<!-- {/key} -->
</div>

<style>
  .chunked {
    display: contents;
  }
</style>
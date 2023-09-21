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
      const oldChunk = get(cks.get(`${initChunk.x}:${initChunk.y}`)!);
      const p = oldChunk.find(p => p.key === key);
      p!.posX = newPos.x;
      p!.posY = newPos.y;
      (cks.get(`${initChunk.x}:${initChunk.y}`)!).update(mmm => {
        mmm = mmm.filter(p => p.key !== key);
        return mmm;
      });
      if (get(cks.get(`${initChunk.x}:${initChunk.y}`)!).length <= 0) {
        cks.delete(`${initChunk.x}:${initChunk.y}`);
      }

      if (!cks.has(`${newChunk.x}:${newChunk.y}`)) {
        cks.set(`${newChunk.x}:${newChunk.y}`, writable([]));
      }
      console.log("cks", cks)
      cks.get(`${newChunk.x}:${newChunk.y}`)!.update(s => {
        s.push(p!);
        return s;
      });
      return cks;
    });

    // const oldChunk = get($chunks.get(`${initChunk.x}:${initChunk.y}`)!);
    // const positionable = oldChunk.find((p) => p.key === key);
    // if (!positionable) throw "positionable not found in chunk"; // todo: throw handle error
    // if (!$chunks.has(`${newChunk.x}:${newChunk.y}`)) {
    //   $chunks.set(`${newChunk.x}:${newChunk.y}`, writable([positionable]));
    // }
    // else {
    //   $chunks.get(`${newChunk.x}:${newChunk.y}`)!.update((s) => {
    //     s.push(positionable);
    //     return s;
    //   });
    // }
    // if (oldChunk.length - 1 <= 0) {
    //   $chunks.delete(`${initChunk.x}:${initChunk.y}`);
    // }
    // else {
    //   $chunks.get(`${initChunk.x}:${initChunk.y}`)!.update((s) => {
    //     s.splice(s.indexOf(positionable), 1);
    //     return s;
    //   });
    // }
    for (let [k,v] of $chunks.entries()) {
      console.log("chunk", k, get(v))
    }
  }

  onMount(() => element.addEventListener("positionableChunkChanged", onPositionableChunkChanged))
</script>

<div style="display: content;" bind:this={element}>
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
          let:key
          let:x
          let:y
          let:width
          let:height
        >
          <slot {key} posX={x} posY={y} width={width} height={height} />
        </svelte:component>
      {/await}
      {:else}
      <Chunk
          {board}
            positionables={v}
            chunkX={cX}
            chunkY={cY}
            let:key
            let:x
            let:y
          >
            <slot {key} posX={x} posY={y} width={width} height={height}/>
          </Chunk>
      {/if}
    {/if}
  {/each}
<!-- {/key} -->
</div>

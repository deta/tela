<script context="module" lang="ts">
  // /**
  //  * Bit merge two numbers together.
  //  * @param x
  //  * @param y
  //  */
  // export function makeCompositChunkPos(x: number, y: number) {
  //   return (x << 4) | y;
  // }
  // /**
  //  * Bit mask to get x component.
  //  * @param pos
  //  */
  // export function compositChunkPosX(pos: number) {
  //   return ((pos & 0b11110000) >> 4);
  // }
  // /**
  //  * Bit mask to get y component.
  //  * @param pos
  //  */
  // export function compositChunkPosY(pos: number) {
  //   return (pos & 0b00001111);
  // }
  // export function absToChunkIndex(x: number, y: number, chunkSize: number) {
  //   return makeCompositChunkPos(
  //     Math.floor(x / chunkSize),
  //     Math.floor(y / chunkSize)
  //   )
  // }
  export function absToChunkIndex(x: number, y: number, chunkSize: number) {
    return [
      Math.floor(x / chunkSize),
      Math.floor(y / chunkSize)
    ];
  }
</script>
<script lang="ts">
  import { getContext } from "svelte";
  import type { Board, TBoardSettings } from "./types/Board.type.js";
    import type { derived, writable, Writable } from "svelte/store";
  import type { IPositionable } from "./Positionable.svelte";

  export let positionables: Writable<IPositionable[]>;

  export let chunkX: number;
  export let chunkY: number;
    export let board: Board;
  //const board = getContext<Board>("board");
  const settings = getContext<Writable<TBoardSettings>>("settings");
  const state = board.state;
  $: ({ viewPort } = $state);
  $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: ({ zoom } = $state);

  // let prevViewChunkX = 0;
  // let prevViewChunkY = 0;
  // let viewChunkX = writable(0);
  // let viewChunkY = writable(0);

  // let _viewChunkX = derived(viewX, (e) => Math.floor($viewX / $settings.CHUNK_SIZE));
  // let _viewChunkY = derived(viewY, (e) => Math.floor($viewY / $settings.CHUNK_SIZE));
  // _viewChunkX.subscribe((v) => {
  //   if (prevViewChunkX !== v) {
  //     prevViewChunkX = v;
  //     viewChunkX.set(v);
  //   }
  // });
  // _viewChunkY.subscribe((v) => {
  //   if (prevViewChunkY !== v) {
  //     prevViewChunkY = v;
  //     viewChunkY.set(v);
  //   }
  // });

  const randCol = () => {
    let r = Math.floor(Math.random() * 256); // Random between 0-255
    let g = Math.floor(Math.random() * 256); // Random between 0-255
    let b = Math.floor(Math.random() * 256); // Random between 0-255
    return 'rgba(' + r + ',' + g + ',' + b + ', 0.4)';
  };

  function positionableInView(posX: number, posY: number, width: number, height: number, vX: number, vY: number) {
    return (
      posX + width + $settings.CULL_MARGIN > vX &&
      posY + height + $settings.CULL_MARGIN > vY &&
      posX - $settings.CULL_MARGIN < vX + viewPort.w / $zoom &&
      posY - $settings.CULL_MARGIN < vY + viewPort.h / $zoom
    );
  }

</script>

<div
  class="chunk"
  style="transform: translate({chunkX * $settings.CHUNK_SIZE}px, {chunkY *
    $settings.CHUNK_SIZE}px); width: {$settings.CHUNK_SIZE}px; height: {$settings.CHUNK_SIZE}px; background-color: {randCol()};"
>
  <span style="font-size: 4rem;"
    >{`${chunkX} : ${chunkY}`}</span
  >
  {$viewX}
  {#if $zoom > 0.2}
    {#each $positionables as positionable, i (positionable.key)}
      {#if positionableInView(positionable.posX, positionable.posY, positionable.width, positionable.height, $viewX, $viewY)}
        <slot key={positionable.key} x={positionable.posX} y={positionable.posY} width={positionable.width} height={positionable.height}/>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .chunk {
    position: absolute;
    top: 0;
    left: 0;
    z-index:10;
    will-change: transform;
  }
</style>
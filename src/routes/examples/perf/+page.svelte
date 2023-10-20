<script lang="ts">
    import LazyCard from "./LazyCard.svelte";
    import Card from "./Card.svelte";
  import { writable } from "svelte/store";
  import "html-gl/dist/htmlgl.js"

  interface ICard {
    key: string;
    pos_x: number;
    pos_y: number;
    width: number;
    height: number;
  }

  const cards: ICard[] = Array.from({ length: 1000 }, (_, i) => ({
    key: i.toString(),
    pos_x: Math.random() * 500,
    pos_y: Math.random() * 500,
    width: 120,
    height: 100,
  }));

  let pan_x = writable(0);
  let pan_y = 0;
  // $: boardCss = `transform: translate(${$pan_x}px, ${pan_y}px);`;
  // $: boardCss = `left: ${pan_x}px; top: ${pan_y}px;`;

  function onWheel(e: WheelEvent) {
    pan_x.update(_x => {
      _x -= e.deltaX;
      return _x;
    })
    pan_y -= e.deltaY;
  }

  const cardComp = () => Card//import("./Card.svelte");

  function isVisible(x: number, y: number, panX: number, panY: number) {
    return x + panX > 0 && panX + x < 1000 && y + panY > 0 && y + panY < 1000;
  }

</script>

<main on:wheel|capture={onWheel}>
  <html-gl class="board">
    {#each cards as card, i (card.key)}
    {#if isVisible(card.pos_x, card.pos_y, $pan_x, pan_y)}
    <!-- <LazyCard component={Card} {...card} pos_x={$pan_x + card.pos_x} pos_y={pan_y + card.pos_y}>
      <img src="https://source.unsplash.com/random/200x200?sig={i}" alt="">
    </LazyCard> -->
    <Card {...card} pos_x={$pan_x + card.pos_x} pos_y={pan_y + card.pos_y}>
      <img src="https://source.unsplash.com/random/200x200?sig={i}" alt="">
    </Card>
    {/if}
    {/each}
  </html-gl>
</main>

<style>
  :global(html, body) {
    overscroll-behavior: none;
  }
  main {
    background: rgb(239, 240, 214);
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .board {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
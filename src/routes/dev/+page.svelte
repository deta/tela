<script lang="ts">
  import { derived, get, writable, type Writable } from "svelte/store";
  import LazyComponent from "../v3/test/LazyComponent.svelte";
  import type { IPositionable } from "$lib/Positionable.svelte";
  import { fastFilter, isInsideViewport } from "$lib/utils.js";

  let cards: Writable<Writable<IPositionable<"key">>[]> = writable(
    Array.from({ length: 4500 }, (_, i) => {
      let x = {
        key: crypto.randomUUID() + i,
        x: Math.random() * 12000,
        y: Math.random() * 12000,
        width: 240,
        height: 100
      };
      let p = writable(x);
      return p;
    })
  );

  const offset = writable({ x: 0, y: 0 });
  const zoom = writable(0.6);

  let targetOffsetX = 0;
  let targetOffsetY = 0;

  const transformCSS = derived(offset, (_offset) => {
    return `transform-origin: top left; transform: scale(${$zoom * 100}%) translate3d(${
      _offset.x
    }px, ${_offset.y}px, 0px);`;
  });

  const visibleCards = derived([cards, offset, zoom], ([_cards, _offset, _zoom]) => {
    return fastFilter((_card) => {
      const card = get(_card);
      return isInsideViewport(
        card.x,
        card.y,
        card.width,
        card.height,
        -_offset.x,
        -_offset.y,
        { w: window.innerWidth, h: window.innerHeight, x: 0, y: 0 },
        _zoom,
        0,
        0
      );
    }, _cards);
  });

  let animationFrame: number | null = null;

  function onWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      zoom.update((_zoom) => {
        _zoom += e.deltaY * -0.01;
        if (_zoom < 0.1) _zoom = 0.1;
        if (_zoom > 10) _zoom = 10;
        return _zoom;
      });
    } else {
      e.preventDefault();
      targetOffsetX -= e.deltaX;
      targetOffsetY -= e.deltaY;
      // offset.update((_offset) => {
      //   _offset.x = targetOffsetX;
      //   _offset.y = targetOffsetY;
      //   return _offset;
      // });

      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(() => {
          $offset = { x: targetOffsetX, y: targetOffsetY };
          // offset.update((_offset) => {
          //   _offset.x = targetOffsetX;
          //   _offset.y = targetOffsetY;
          //   return _offset;
          // });
          animationFrame = null;
        });
      }
    }
  }
</script>

<div style="position: fixed; top: 0; right: 0;z-index: 200;">
  <ul>
    <li><small>visible P: {$visibleCards.length}</small></li>
  </ul>
</div>

<main on:wheel={onWheel}>
  <div class="board" style={$transformCSS}>
    {#each $visibleCards as card (get(card).key)}
      <LazyComponent this={() => import("./Card.svelte")}>
        <svelte:fragment slot="component" let:Component>
          <Component {card} />
        </svelte:fragment>
      </LazyComponent>
    {/each}
  </div>
</main>

<style>
  :global(body) {
    overflow: hidden;
  }
  main {
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }
  .board {
    backface-visibility: hidden;
    /* will-change: transform; */
  }
</style>

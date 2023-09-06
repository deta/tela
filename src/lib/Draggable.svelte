<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Vec2 } from "./types/Utils.type.js";
  import type { Writable } from "svelte/store";
  import type { TBoard } from "./types/Board.type.js";

  export let pos: Vec2;

  const dispatch = createEventDispatcher();

  const board = getContext<Writable<TBoard>>("board");

  let dragState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  };

  // UI Handlers
  function onMouseDown(e: MouseEvent) {
    dragState.init = { x: e.clientX, y: e.clientY };
    dragState.curr = { x: e.clientX, y: e.clientY };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    dragState.offset = {
      x: (e.clientX - dragState.curr.x) / $board.zoom,
      y: (e.clientY - dragState.curr.y) / $board.zoom
    };

    dragState.curr = { x: e.clientX, y: e.clientY };

    pos.x += dragState.offset.x;
    pos.y += dragState.offset.y;
  }

  function onMouseUp(e: MouseEvent) {
    document.removeEventListener('mousemove', onMouseMove);
  }

</script>

<svelte:element this="div"
  {...$$restProps}
  class="draggable no-pan {$$restProps.class || ''}"
  on:mousedown={onMouseDown}
  >
  <slot/>
</svelte:element>
<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Vec2 } from "./types/Utils.type.js";
  import type { Writable } from "svelte/store";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";
  import { snapToGrid } from "./utils.js";

  export let pos: Vec2;

  const dispatch = createEventDispatcher();

  const board = getContext<Writable<TBoard>>("board");
  const settings = getContext<Writable<TBoardSettings>>("settings");

  let dragState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  };

  // UI Handlers
  function onMouseDown(e: MouseEvent) {
    e.stopPropagation();
    document.body.classList.add("dragging");
    let cX = e.clientX;
    let cY = e.clientY;
    // todo: handle touch

    const x = $settings.SNAP_TO_GRID ? snapToGrid(cX, $settings.GRID_SIZE!) : cX;
    const y = $settings.SNAP_TO_GRID ? snapToGrid(cY, $settings.GRID_SIZE!) : cY;

    dragState.init = { x, y };
    dragState.curr = { x, y };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });

    dispatch("dragStart", { pos });
  }

  function onMouseMove(e: MouseEvent) {
    let cX = e.clientX;
    let cY = e.clientY;

    dragState.offset = {
      x: (cX - dragState.curr.x) / $board.zoom,
      y: (cY - dragState.curr.y) / $board.zoom
    };

    dragState.curr = { x: e.clientX, y: e.clientY };

      // todo: optimize setting pos?
    pos.x += dragState.offset.x;
    pos.y += dragState.offset.y;
  }

  function onMouseUp(e: MouseEvent) {
    document.body.classList.remove("dragging");
    document.removeEventListener("mousemove", onMouseMove);
    dispatch("dragEnd", { pos });
  }
</script>

<svelte:element
  this="div"
  {...$$restProps}
  class="draggable {$$restProps.class || ''}"
  on:mousedown={onMouseDown}
>
  <slot />
</svelte:element>

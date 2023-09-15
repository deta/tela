<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Vec2 } from "./types/Utils.type.js";
  import type { Writable } from "svelte/store";
  import type { TBoard, TBoardSettings } from "./types/Board.type.js";
  import { hasClassOrParentWithClass, snapToGrid } from "./utils.js";

  export let pos: Vec2;
  export let size: Vec2;

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
    if (hasClassOrParentWithClass(e.target as HTMLElement, "tela-ignore")) return;
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

      const newX = pos.x + dragState.offset.x;
      const newY = pos.y + dragState.offset.y;

      if ($settings.BOUNDS?.minX !== null && newX < $settings.BOUNDS!.minX) {
        pos.x = $settings.BOUNDS!.minX;
      }
      else if ($settings.BOUNDS?.maxX !== null && newX + size.x > $settings.BOUNDS!.maxX) {
        pos.x = $settings.BOUNDS!.maxX - size.x;
      }
      else {
        pos.x += dragState.offset.x;
      }

      if ($settings.BOUNDS?.minY !== null && newY < $settings.BOUNDS!.minY) {
        pos.y = $settings.BOUNDS!.minY;
      }
      else if ($settings.BOUNDS?.maxY !== null && newY + size.y > $settings.BOUNDS!.maxY) {
        pos.y = $settings.BOUNDS!.maxY - size.y;
      }
      else {
        pos.y += dragState.offset.y;
      }

      dispatch("dragMove", { pos, offset: dragState.offset });
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

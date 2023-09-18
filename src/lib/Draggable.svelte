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

  // Utils
  function posToViewportPos(x: number, y: number) {
    return {
      x: x - $board.viewPort.x,
      y: y - $board.viewPort.y + window.scrollY
    };
  }

  // UI Handlers
  function onMouseDown(e: MouseEvent | TouchEvent) {
    const target = (e as TouchEvent).targetTouches?.item(0)?.target || (e as MouseEvent).target;
    const { x: clientX, y: clientY } = posToViewportPos(
      (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX,
      (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY
    );

    if (hasClassOrParentWithClass(target as HTMLElement, "tela-ignore")) return;
    e.stopPropagation();
    document.body.classList.add("dragging");
    // let cX = e.clientX;
    // let cY = e.clientY;
    // todo: handle touch

    const x = $settings.SNAP_TO_GRID ? snapToGrid(clientX, $settings.GRID_SIZE!) : clientX;
    const y = $settings.SNAP_TO_GRID ? snapToGrid(clientY, $settings.GRID_SIZE!) : clientY;

    dragState.init = { x, y };
    dragState.curr = { x, y };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp, { once: true });

    dispatch("dragStart", { pos });
  }

  function onMouseMove(e: MouseEvent | TouchEvent) {
    const { x: clientX, y: clientY } = posToViewportPos(
      (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX,
      (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY
    );

    dragState.offset = {
      x: (clientX - dragState.curr.x) / $board.zoom,
      y: (clientY - dragState.curr.y) / $board.zoom
    };

    dragState.curr = { x: clientX, y: clientY };

    // todo: optimize setting pos?

    const newX = pos.x + dragState.offset.x;
    const newY = pos.y + dragState.offset.y;

    if ($settings.BOUNDS?.minX !== null && newX < $settings.BOUNDS!.minX) {
      pos.x = $settings.BOUNDS!.minX;
    } else if ($settings.BOUNDS?.maxX !== null && newX + size.x > $settings.BOUNDS!.maxX) {
      pos.x = $settings.BOUNDS!.maxX - size.x;
    } else {
      pos.x += dragState.offset.x;
    }

    if ($settings.BOUNDS?.minY !== null && newY < $settings.BOUNDS!.minY) {
      pos.y = $settings.BOUNDS!.minY;
    } else if ($settings.BOUNDS?.maxY !== null && newY + size.y > $settings.BOUNDS!.maxY) {
      pos.y = $settings.BOUNDS!.maxY - size.y;
    } else {
      pos.y += dragState.offset.y;
    }

    dispatch("dragMove", { pos, offset: dragState.offset });
  }

  function onMouseUp(e: MouseEvent | TouchEvent) {
    document.body.classList.remove("dragging");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onMouseMove);
    dispatch("dragEnd", { pos });
  }
</script>

<svelte:element
  this="div"
  {...$$restProps}
  class="draggable {$$restProps.class || ''}"
  on:mousedown={onMouseDown}
  on:touchstart|nonpassive={onMouseDown}
>
  <slot />
</svelte:element>

<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Vec2 } from "./types/Utils.type.js";
  import type { Writable } from "svelte/store";
  import type { IBoard, IBoardSettings } from "./types/Board.type.js";
  import { hasClassOrParentWithClass, snapToGrid } from "./utils.js";
  import { moveToStackingTop } from "./Board.svelte";

  /**
   * Events:
   * - positionableChunkChanged<key, initChunk: dragState.initChunk, newChunk: { x: currChunkX, y: currChunkY }>
   */

  export let key: string;
  export let posX: number;
  export let posY: number;
  export let size: Vec2<number>;

  const dispatch = createEventDispatcher();

  const board = getContext<IBoard>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");
  const stackingOrder = getContext<Writable<string[]>>("stackingOrder");

  let htmlEl: HTMLDivElement;
  let state = board.state;
  $: ({ viewPort } = $state);
  $: ({ x: viewX, y: viewY } = $state.viewOffset);
  $: ({ zoom } = $state);

  let dragState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    initChunk: { x: 0, y: 0 }
  };

  // Utils
  /**
   * Converts window position to board position.
   * @param x
   * @param y
   */
  function posToViewportPos(x: number, y: number) {
    return {
      x: x - $viewX - viewPort.x,
      y: y - $viewY + window.scrollY - viewPort.y
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
    dragState.initChunk = {
      x: Math.floor(posX / $settings.CHUNK_SIZE),
      y: Math.floor(posY / $settings.CHUNK_SIZE)
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp, { once: true });

    // Move to stack top.
    moveToStackingTop(stackingOrder, key);

    dispatch("dragStart", { x: posX, y: posY });
  }

  function onMouseMove(e: MouseEvent | TouchEvent) {
    const { x: clientX, y: clientY } = posToViewportPos(
      (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX,
      (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY
    );

    dragState.offset = {
      x: (clientX - dragState.curr.x) / $zoom,
      y: (clientY - dragState.curr.y) / $zoom
    };

    dragState.curr = { x: clientX, y: clientY };

    // todo: optimize setting pos?

    const newX = posX + dragState.offset.x;
    const newY = posY + dragState.offset.y;

    if ($settings.BOUNDS?.minX !== null && newX < $settings.BOUNDS!.minX) {
      posX = $settings.BOUNDS!.minX;
    } else if ($settings.BOUNDS?.maxX !== null && newX + size.x > $settings.BOUNDS!.maxX) {
      posX = $settings.BOUNDS!.maxX - size.x;
    } else {
      posX += dragState.offset.x;
    }

    if ($settings.BOUNDS?.minY !== null && newY < $settings.BOUNDS!.minY) {
      posY = $settings.BOUNDS!.minY;
    } else if ($settings.BOUNDS?.maxY !== null && newY + size.y > $settings.BOUNDS!.maxY) {
      posY = $settings.BOUNDS!.maxY - size.y;
    } else {
      posY += dragState.offset.y;
    }

    dispatch("dragMove", { key, posX, posY, offset: dragState.offset });
    htmlEl.dispatchEvent(
      new CustomEvent("dragMove", {
        detail: { key, posX, posY, offset: dragState.offset },
        bubbles: true
      })
    );
  }

  function onMouseUp(e: MouseEvent | TouchEvent) {
    // Calculate if moved between chunks.
    const currChunkX = Math.floor(posX / $settings.CHUNK_SIZE);
    const currChunkY = Math.floor(posY / $settings.CHUNK_SIZE);

    if (dragState.initChunk.x !== currChunkX || dragState.initChunk.y !== currChunkY) {
      // dispatch("chunkChange", { key, initChunkX, initChunkY, currChunkX, currChunkY });
      htmlEl.dispatchEvent(
        new CustomEvent("positionableChunkChanged", {
          detail: {
            key,
            initChunk:
            dragState.initChunk,
            newChunk: { x: currChunkX, y: currChunkY },
            newPos: { x: posX, y: posY }
          },
          bubbles: true
        })
      );
    }

    document.body.classList.remove("dragging");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onMouseMove);
    dispatch("dragEnd", { posX, posY });
  }
</script>

<svelte:element
  this="div"
  {...$$restProps}
  class="draggable {$$restProps.class || ''}"
  on:mousedown={onMouseDown}
  on:touchstart|nonpassive={onMouseDown}
  bind:this={htmlEl}
>
  <slot />
</svelte:element>

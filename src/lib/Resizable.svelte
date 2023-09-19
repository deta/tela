<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Vec2 } from "./types/Utils.type.js";
  import { hasClassOrParentWithClass, snapToGrid } from "./utils.js";
  import type { Writable } from "svelte/store";
  import type { TBoard, IBoardSettings } from "./types/Board.type.js";

  export let size: Vec2;

  const board = getContext<Writable<TBoard>>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");

  const dispatch = createEventDispatcher();

  let resizeState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  };

  // UI Handlers
  function onMouseDown(e: MouseEvent) {
    if (hasClassOrParentWithClass(e.target as HTMLElement, "tela-ignore")) return;
    e.stopPropagation();
    document.body.classList.add("resizing");

    let cX = e.clientX;
    let cY = e.clientY;
    // todo: handle touch

    const x = $settings.SNAP_TO_GRID ? snapToGrid(cX, $settings.GRID_SIZE!) : cX;
    const y = $settings.SNAP_TO_GRID ? snapToGrid(cY, $settings.GRID_SIZE!) : cY;

    resizeState.init = { x, y };
    resizeState.curr = { x, y };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });

    dispatch("resizeStart", { size });
  }

  function onMouseMove(e: MouseEvent) {
    let cX = e.clientX;
    let cY = e.clientY;

    resizeState.offset = {
      x: (cX - resizeState.curr.x) / $board.zoom,
      y: (cY - resizeState.curr.y) / $board.zoom
    };

    resizeState.curr = { x: e.clientX, y: e.clientY };

      // todo: optimize setting pos?
    size.x += resizeState.offset.x;
    size.y += resizeState.offset.y;
  }

  function onMouseUp(e: MouseEvent) {
    document.body.classList.remove("resizing");
    document.removeEventListener("mousemove", onMouseMove);
    dispatch("resizeEnd", { size });
  }
</script>

<svelte:element
  this="div"
  {...$$restProps}
  class="resizable {$$restProps.class || ''}"
  on:mousedown={onMouseDown}
>
  <slot />
</svelte:element>

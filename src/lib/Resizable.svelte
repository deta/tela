<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import type { Vec2 } from "./types/Utils.type.js";
  import { hasClassOrParentWithClass, snapToGrid } from "./utils.js";
  import type { Writable } from "svelte/store";
  import type { IBoard, IBoardSettings } from "./types/Board.type.js";
  import type { IPositionable } from "./Positionable.svelte";

  export let positionable: IPositionable;
  export let direction: "wn" | "ne" | "es" | "sw";

  const board = getContext<IBoard>("board");
  const settings = getContext<Writable<IBoardSettings>>("settings");
  let state = board.state;
  $: ({ zoom } = $state);

  const dispatch = createEventDispatcher();
  let htmlEl: HTMLDivElement;

  let resizeState = {
    init: { x: 0, y: 0 },
    curr: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  };

  // UI Handlers
  function onMouseDown(e: MouseEvent) {
    if (hasClassOrParentWithClass(e.target as HTMLElement, "tela-ignore")) return;
    e.stopPropagation();

    let cX = e.clientX;
    let cY = e.clientY;
    // todo: handle touch

    const x = $settings.SNAP_TO_GRID ? snapToGrid(cX, $settings.GRID_SIZE!) : cX;
    const y = $settings.SNAP_TO_GRID ? snapToGrid(cY, $settings.GRID_SIZE!) : cY;

    resizeState.init = { x, y };
    resizeState.curr = { x, y };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });

    $state.mode = "resizing";

    dispatch("resizeStart", { positionable });
  }

  function onMouseMove(e: MouseEvent) {
    let cX = e.clientX;
    let cY = e.clientY;

    resizeState.offset = {
      x: (cX - resizeState.curr.x) / $zoom,
      y: (cY - resizeState.curr.y) / $zoom
    };

    resizeState.curr = { x: e.clientX, y: e.clientY };

    if (direction === "wn") {
      // todo: optimize setting pos?
      positionable.width += resizeState.offset.x;
      positionable.height += resizeState.offset.y;
    }
    else if (direction === "ne") {
      positionable.width -= resizeState.offset.x;
      positionable.height += resizeState.offset.y;
      positionable.posX += resizeState.offset.x;
    }
    else if (direction === "es") {
      positionable.width -= resizeState.offset.x;
      positionable.height -= resizeState.offset.y;
      positionable.posY += resizeState.offset.y;
      positionable.posX += resizeState.offset.x;
    }
    else if (direction === "sw") {
      positionable.width += resizeState.offset.x;
      positionable.height -= resizeState.offset.y;
      positionable.posY += resizeState.offset.y;
    }

      htmlEl.dispatchEvent(
        new CustomEvent("resizable_change", {
          detail: { positionable },
          bubbles: true
        })
      );
      dispatch("resize", { positionable });
    }

  function onMouseUp(e: MouseEvent) {
    $state.mode = "draw";
    document.removeEventListener("mousemove", onMouseMove);
    htmlEl.dispatchEvent(
        new CustomEvent("resizable_change", {
          detail: { positionable },
          bubbles: true
        })
      );
    dispatch("resizeEnd", { positionable });
  }
</script>

<svelte:element
  this="div"
  {...$$restProps}
  class="resizable {$$restProps.class || ''}"
  on:mousedown={onMouseDown}
    bind:this={htmlEl}
>
  <slot />
</svelte:element>

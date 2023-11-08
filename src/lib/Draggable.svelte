<script lang="ts">
  import { isTagsOrParentWithTags } from "./utils.js";
  import type { Writable } from "svelte/store";
  import type { IPositionable } from "./Positionable.svelte";

  export let positionable: Writable<IPositionable<any>>;

  let el: HTMLDivElement;
  let dragging = false;

  // TODO: ignore input, button, textarea, select, option, a, iframe

  // UI Handlers
  function onMouseDown(e: MouseEvent | TouchEvent) {
    const target = (e as TouchEvent).targetTouches?.item(0)?.target || (e as MouseEvent).target;

    if (isTagsOrParentWithTags(target as HTMLElement, [
      "INPUT",
      "BUTTON",
      "TEXTAREA",
      "SELECT",
      "OPTION",
      "A",
      "IFRAME"
    ])) return;

    const clientX = (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX;
    const clientY = (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY;

    el.dispatchEvent(new CustomEvent("draggable_onMouseDown", { bubbles: true, detail: { event: e, positionable, clientX, clientY } }));
    // TODO: check if event canceled, if not:
    dragging = true;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp, { once: true });
  }

  function onMouseMove(e: MouseEvent | TouchEvent) {
    const target = (e as TouchEvent).targetTouches?.item(0)?.target || (e as MouseEvent).target;
    const clientX = (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX;
    const clientY = (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY;
    el.dispatchEvent(new CustomEvent("draggable_onMouseMove", { bubbles: true, detail: { event: e, positionable, clientX, clientY } }));
  }

  function onMouseUp(e: MouseEvent | TouchEvent) {
    const target = (e as TouchEvent).targetTouches?.item(0)?.target || (e as MouseEvent).target;
    const clientX = (e as TouchEvent).targetTouches?.item(0)?.clientX || (e as MouseEvent).clientX;
    const clientY = (e as TouchEvent).targetTouches?.item(0)?.clientY || (e as MouseEvent).clientY;

    el.dispatchEvent(new CustomEvent("draggable_onMouseUp", { bubbles: true, detail: { event: e, positionable, clientX, clientY } }));

    dragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("touchmove", onMouseMove);
    document.removeEventListener("touchend", onMouseUp);
  }
</script>

<svelte:options immutable={true} />

<div
  class="draggable {$$restProps.class || ''}"
  class:dragging
  on:mousedown={onMouseDown}
  on:touchstart={onMouseDown}
  bind:this={el}
>
  <slot />
</div>

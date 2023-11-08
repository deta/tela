<script lang="ts">
  import Draggable from "$lib/Draggable.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { IPositionable } from "$lib/Positionable.svelte";
  import Resizable from "$lib/Resizable.svelte";
  import type { Writable } from "svelte/store";

  export let card: Writable<IPositionable<"key">>;
</script>

<svelte:options immutable={true} />

<Positionable positionable={card}>
  <!-- TODO: Switch to mouse logic only -->
  <Resizable positionable={card} direction="top"/>
  <Resizable positionable={card} direction="right" />
  <Resizable positionable={card} direction="bottom" />
  <Resizable positionable={card} direction="left" />
  <Resizable positionable={card} direction="top-right" />
  <Resizable positionable={card} direction="top-left" />
  <Resizable positionable={card} direction="bottom-right" />
  <Resizable positionable={card} direction="bottom-left" />
  <Draggable positionable={card}>
    card
    <input type="range" min="0" max="2000" />
    <textarea rows="3" />
    <br />
    <div contenteditable="true">fio bar test asf</div>
  </Draggable>
</Positionable>

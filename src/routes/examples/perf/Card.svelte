<script lang="ts">
    export let key: string;
    export let pos_x: number;
    export let pos_y: number;
    export let width: number;
    export let height: number;

    $: posCSS = `left: ${pos_x}%; top: ${pos_y}%; width: ${width}px; height: ${height}px;`;
    // $: posCSS = `transform: translate(${pos_x}px, ${pos_y}px); width: ${width}px; height: ${height}px;`;
</script>
<html-gl class="card" style={posCSS}>
  <slot/>
</html-gl>

<style>
  .card {
    position: absolute;
    top: 0;
    left: 0;
    background:rgba(98, 95, 112, 0.547);
    padding: 10px;
    border: 1px solid rgba(52, 34, 132, 0.793);
  }

  :global(.card img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
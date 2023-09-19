import{j as e}from"./jsx-runtime-6aff1e10.js";import{M as n,b as a}from"./index-dd04b6e9.js";import{D as r}from"./Draggable.stories-a0a02e29.js";import{u as s}from"./index-ce5b6162.js";import"./iframe-5d73ace0.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";import"./index-76d2f1d2.js";import"./Positionable-6a060a99.js";import"./spread-8a54911c.js";function i(o){const t=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",blockquote:"blockquote"},s(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(n,{of:r,name:"Example"}),`
`,e.jsx(t.h1,{id:"draggable",children:"Draggable"}),`
`,e.jsxs(t.p,{children:["A draggable element can be used inside of a ",e.jsx(t.code,{children:"Positionable"})," element to enable moving it around the board."]}),`
`,e.jsx(t.h2,{id:"usage",children:"Usage"}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:["💡 Notice, that we need to use the ",e.jsx(t.code,{children:"bind:"})," directive for the pos & size props, as the changes handled inside the Draggable component need to be applied to the state of the Positionable component as well."]}),`
`]}),`
`,e.jsx(a,{language:"html",code:`
<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import Draggable from "$lib/Draggable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings); // <- used to configure the board
  const board = writable({ viewOffset: { x: 0, y: 0 }, zoom: 1 } satisfies TBoard); // <- determines the initial state of the board

  const element = { pos: { x: 0, y: 0 }, size: { x: 150, y: 150} };
<\/script>

<main>
  <Board {settings} {board}>
    <Positionable pos={element.pos} size={element.size} z={1}>
      <Draggable bind:pos={element.pos} bind:size={element.size}>
      drag here.
      </Draggable>
      I am a positionable element.
    </Positionable>
  </Board>
</main>

<style>
  main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
`})]})}function w(o={}){const{wrapper:t}=Object.assign({},s(),o.components);return t?e.jsx(t,Object.assign({},o,{children:e.jsx(i,o)})):i(o)}export{w as default};
//# sourceMappingURL=draggable-d093ba39.js.map

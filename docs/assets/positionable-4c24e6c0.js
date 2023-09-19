import{j as e}from"./jsx-runtime-6aff1e10.js";import{M as a,b as i}from"./index-dd04b6e9.js";import{P as r}from"./Positionable.stories-d6ea4aea.js";import{u as n}from"./index-ce5b6162.js";import"./iframe-5d73ace0.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";import"./index-76d2f1d2.js";import"./Positionable-6a060a99.js";import"./spread-8a54911c.js";function s(o){const t=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",a:"a"},n(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(a,{of:r,name:"Example"}),`
`,e.jsx(t.h1,{id:"positionable",children:"Positionable"}),`
`,e.jsxs(t.p,{children:["Any element placed on the board must be wrapped in a ",e.jsx(t.code,{children:"Positionable"})," component. This component handles the positioning of the element on the board whilst panning and zooming."]}),`
`,e.jsx(t.h2,{id:"usage",children:"Usage"}),`
`,e.jsxs(t.p,{children:["The example below illustrates how a ",e.jsx(t.code,{children:"Positionable"})," component can be used to place an element on the board."]}),`
`,e.jsx(i,{language:"html",code:`
<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings); // <- used to configure the board
  const board = writable({ viewOffset: { x: 0, y: 0 }, zoom: 1 } satisfies TBoard); // <- determines the initial state of the board
<\/script>

<main>
  <Board {settings} {board}>
    <Positionable pos={{ x: 0, y: 0 }} size={{ x: 0, y: 0}} z={1}>
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
`}),`
`,e.jsxs(t.p,{children:["If you want to dynamically render multiple elements on the board, you can simply store their state in some array and use svelte's ",e.jsx(t.code,{children:"each"})," directive:"]}),`
`,e.jsx(i,{language:"html",code:`
<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings); // <- used to configure the board
  const board = writable({ viewOffset: { x: 0, y: 0 }, zoom: 1 } satisfies TBoard); // <- determines the initial state of the board

  const elements: { pos: { x: number, y: number }, size: { x: number, y: number} }[] = [
    { pos: { x: 0, y: 0 }, size: { x: 150, y: 150} },
    { pos: { x: 400, y: 400 }, size: { x: 400, y: 300} }
  ];
<\/script>

<main>
  <Board {settings} {board}>
    {#each elements as element}
      <Positionable pos={element.pos} size={element.size} z={1}>
        I am a positionable element.
      </Positionable>
    {/each}
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
`}),`
`,e.jsx(t.h2,{id:"interactivity",children:"Interactivity"}),`
`,e.jsxs(t.p,{children:["See ",e.jsx(t.a,{href:"/?path=/docs/components-draggable--example",children:"Draggable"})," and ",e.jsx(t.a,{href:"/?path=/docs/components-resizable--example",children:"Resizable"})]})]})}function w(o={}){const{wrapper:t}=Object.assign({},n(),o.components);return t?e.jsx(t,Object.assign({},o,{children:e.jsx(s,o)})):s(o)}export{w as default};
//# sourceMappingURL=positionable-4c24e6c0.js.map

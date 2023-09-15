import{j as e}from"./jsx-runtime-e47f94a1.js";import{M as a,b as r}from"./index-5d5b8708.js";import{B as s}from"./Board.stories-7cc992aa.js";import{u as i}from"./index-5e05b1fe.js";import"./iframe-ba774db5.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";import"./index-eaaa2899.js";import"./Board-b886af08.js";import"./Positionable-51bce168.js";import"./spread-8a54911c.js";import"./Grid-2a71ea5b.js";function n(o){const t=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",blockquote:"blockquote"},i(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(a,{of:s,name:"Guide"}),`
`,e.jsx(t.h1,{id:"board",children:"Board"}),`
`,e.jsxs(t.p,{children:[`The board is the main component of tela. It is the container for all other components and handles all the logic for panning, zooming etc.
It can be configured using the `,e.jsx(t.code,{children:"settings"})," prop, and exposes a ",e.jsx(t.code,{children:"board"})," prop, which contains all the information about the current state of the board like the zoom factor or the view offset."]}),`
`,e.jsx(t.h2,{id:"creating-a-board",children:"Creating a board"}),`
`,e.jsx(t.p,{children:`To get a board up and running you need to create two writable stores which will be passed into the board. They can be empty to use the defaults or already provide a state to the board.
This can be used to save the state of the board to local storage or in a database so that the user can continue where they left off.`}),`
`,e.jsx(t.p,{children:"In this example we also wrap the board in an element that takes up the whole screen, but it would also be possible to just embedd the board in the normal flow of a html page."}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:"💡 The board itself does not have a set dimensions. It tries to take up 100% of the available height & width. If you don't see your board, try setting a specific height on its container element."}),`
`]}),`
`,e.jsx(r,{language:"html",code:`
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
`,e.jsx(t.h2,{id:"placing-elements",children:"Placing elements"})]})}function v(o={}){const{wrapper:t}=Object.assign({},i(),o.components);return t?e.jsx(t,Object.assign({},o,{children:e.jsx(n,o)})):n(o)}export{v as default};
//# sourceMappingURL=board-41251ab6.js.map

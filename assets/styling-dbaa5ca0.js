import{j as e}from"./jsx-runtime-e47f94a1.js";import{M as o,b as t,C as a}from"./index-5d5b8708.js";import{Default as r}from"./StylingExample.stories-6703ad2c.js";import{u as i}from"./index-5e05b1fe.js";import"./iframe-ba774db5.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";import"./index-eaaa2899.js";import"./Board-b886af08.js";import"./Positionable-51bce168.js";import"./spread-8a54911c.js";function l(n){const s=Object.assign({h1:"h1",p:"p",ol:"ol",li:"li",code:"code",blockquote:"blockquote",h2:"h2",ul:"ul"},i(),n.components);return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Styling"}),`
`,e.jsx(s.h1,{id:"styling",children:"Styling"}),`
`,e.jsx(s.p,{children:"Styling tela components can be done in 3 different ways (example code below):"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Style the default tela class (e.g. ",e.jsx(s.code,{children:".positionable"})," for positionable elements)."]}),`
`,e.jsx(s.li,{children:"Add a custom class to the element and style it in the css style block."}),`
`,e.jsx(s.li,{children:"Add inline styles to the element."}),`
`]}),`
`,e.jsxs(s.blockquote,{children:[`
`,e.jsxs(s.p,{children:["💡 If you are using classes for styling, make sure to either use the ",e.jsx(s.code,{children:":global(.yourClassName) {}"})," selector or an external stylesheet. Otherwise, the styles will be scoped to your component and will not be applied to the actual tela element underneath."]}),`
`]}),`
`,e.jsx(s.p,{children:`Tela also provides a default stylesheet which you can import into your project. This stylesheet contains some sensible default like mouse cursors indicating the current mode, or the selection rectangle.
You can use this stylesheet by importing it into your project (todo: adjust path):`}),`
`,e.jsx(t,{language:"ts",code:`
import "@deta/tela/dist/tela.css";
`}),`
`,e.jsx("br",{}),`
`,e.jsx(s.h2,{id:"global-classes",children:"Global classes"}),`
`,e.jsx(s.p,{children:"Tela adds a few default classes to its elements, so you can start styling them right away. These classes are:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"tela-container"}),": The container element of a board."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"board"}),": The board element inside the container."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"positionable"}),": A positionable element inside the board."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"draggable"}),": A draggable element inside the board."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"resizable"}),": A resizable element inside the board."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"selection-rect"}),": the rectangle beeing drawn whilst dragging in the ",e.jsx(s.code,{children:"draw"})," or ",e.jsx(s.code,{children:"selecting"})," mode."]}),`
`]}),`
`]}),`
`,e.jsx(s.p,{children:"Some additional classes are added to the body, which can be used to apply styling depending on the current state (e.g. mouse cursor). These are:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"body.drawing"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"body.panning"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"body.selecting"})}),`
`]}),`
`,e.jsx("br",{}),`
`,e.jsx(s.h2,{id:"example",children:"Example"}),`
`,e.jsx(s.p,{children:"This example code displays the various ways to style elements."}),`
`,e.jsx(a,{of:r,layout:"fullscreen"}),`
`,e.jsx(t,{language:"html",code:`
<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings);
  const board = writable({} satisfies TBoard);
<\/script>

<main class="stylingExample">
  <Board {settings} {board}>
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      <header>
        <span>Tela class styling</span>
      </header>
      <p>
        This card uses the default 'positionable' class provided by tela to style it.
        Note: These styles will automatically apply to all other positionables as well.
      </p>
    </Positionable>

    <Positionable class="card" pos={{ x: 420, y: 400 }} size={{ x: 400, y: 300 }} z={1}>
      <header>
        <span>Class styling</span>
      </header>
      <p>
        This card adds a 'card' class to the positionable and styles it inside the css
        Style block.
      </p>
    </Positionable>

    <Positionable
      style="background: #fefe;"
      pos={{ x: 400, y: 250 }}
      size={{ x: 300, y: 40 }}
      z={1}
    >
      <span>Styled using inline style tag. </span>
    </Positionable>
  </Board>
</main>

<style>
  main.stylingExample {
    height: 500px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  :global(.stylingExample .positionable) {
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 2ch;
  }

  :global(.stylingExample .card) {
    background: floralwhite;
  }
  :global(.stylingExample .card > header) {
    font-weight: 600;
    font-size: 1.3em;
  }
</style>

`})]})}function S(n={}){const{wrapper:s}=Object.assign({},i(),n.components);return s?e.jsx(s,Object.assign({},n,{children:e.jsx(l,n)})):l(n)}export{S as default};
//# sourceMappingURL=styling-dbaa5ca0.js.map

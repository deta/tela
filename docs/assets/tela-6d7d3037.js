import{j as e}from"./jsx-runtime-6aff1e10.js";import{M as a,b as n}from"./index-dd04b6e9.js";import{u as s}from"./index-ce5b6162.js";import"./iframe-5d73ace0.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";function i(o){const t=Object.assign({p:"p",h2:"h2",a:"a",code:"code",blockquote:"blockquote",strong:"strong",h3:"h3",h4:"h4",h5:"h5",ul:"ul",li:"li",ol:"ol"},s(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(a,{title:"Tela"}),`
`,e.jsxs("p",{align:"center",children:[e.jsx("a",{href:"https://github.com/deta/tela",children:e.jsx("img",{src:"https://github.com/deta/tela/blob/main/dingo.png?raw=true",alt:"Tela Logo",width:"80",height:"80"})}),e.jsx("h1",{align:"center",children:e.jsx("i",{children:"Tela"})}),e.jsx("p",{align:"center",children:e.jsx(t.p,{children:"A declarative, easy to use, infinite canvas library for svelte using native DOM elements."})})]}),`
`,e.jsx("br",{}),`
`,e.jsx("br",{}),`
`,e.jsx(t.h2,{id:"️-tldr",children:"⚡️ TL;DR"}),`
`,e.jsx(t.p,{children:`Tela is a declarative svelte library for creating infinite canvases, positioning elements on them, and handling all canvas related logic like moving elements, dragging, panning etc.
This is achieved using only native DOM elements so that you can use any existing HTML, CSS, JS component inside a canvas.`}),`
`,e.jsxs(t.p,{children:["To get started, follow the steps below or checkout the ",e.jsx(t.a,{href:"src/routes/examples",children:"examples"})," under ",e.jsx(t.code,{children:"/src/routes/examples"})," to see how tela integrates in a real app."]}),`
`,e.jsx(t.h2,{id:"getting-started",children:"Getting Started"}),`
`,e.jsx(t.p,{children:"Add the package to your project:"}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:e.jsxs(t.strong,{children:["‼️ If you are using ",e.jsx(t.code,{children:"npm"})," the installation might take a very long time for some reason."]})}),`
`]}),`
`,e.jsx(n,{language:"bash",code:`
npm i deta/tela

pnpm i deta/tela

yarn add deta/tela

bun i deta/tela
`}),`
`,e.jsx(t.p,{children:"Import the components & setup the board data:"}),`
`,e.jsx(n,{language:"html",code:`
<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings);
  const board = writable({} satisfies TBoard);
<\/script>
`}),`
`,e.jsx(t.p,{children:"Create a fullscreen board & place some items on it:"}),`
`,e.jsx(n,{language:"html",code:`
<main>
  <Board {settings} {board}>
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      Hello, I am tela.
    </Positionable>

    <Positionable pos={{ x: 200, y: 150 }} size={{ x: 400, y: 300 }} z={1}>
      Try moving the canvas around with the trackpad or by using META + Left Mouse.
    </Positionable>
  </Board>
</main>

<style>
  main {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
`}),`
`,e.jsx(t.h2,{id:"components",children:"Components"}),`
`,e.jsx(t.h3,{id:"board",children:"Board"}),`
`,e.jsx(t.p,{children:"The board is the main component of tela. It is the container for all other components and handles all the logic for panning, zooming etc. It can be configured using the settings prop, and exposes a board prop, which contains all the information about the current state of the board like the zoom factor or the view offset."}),`
`,e.jsx(t.p,{children:"To get a board up and running you need to create two writable stores which will be passed into the board. They can be empty to use the defaults or already provide a state to the board. This can be used to save the state of the board to local storage or in a database so that the user can continue where they left off."}),`
`,e.jsx(t.p,{children:"In this example we also wrap the board in an element that takes up the whole screen, but it would also be possible to just embedd the board in the normal flow of a html page."}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:"💡 The board itself does not have a set dimensions. It tries to take up 100% of the available height & width. If you don't see your board, try setting a specific height on its container element."}),`
`]}),`
`,e.jsx(n,{language:"html",code:`
<script lang="ts">
  import Board from "$lib/Board.svelte";
  import Positionable from "$lib/Positionable.svelte";
  import type { TBoard, TBoardSettings } from "$lib/index.js";
  import { writable } from "svelte/store";

  const settings = writable({} satisfies TBoardSettings); // <- used to configure the board
  const board = writable({ viewOffset: { x: 0, y: 0 }, zoom: 1 } satisfies TBoard); // <- determines the initial state of the board
<\/script>

<main>
  <Board {settings} {board}> </Board>
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
`,e.jsx(t.h4,{id:"board-props",children:"Board Props"}),`
`,e.jsx(t.h5,{id:"settings",children:e.jsx(t.code,{children:"settings"})}),`
`,e.jsx(n,{language:"typescript",code:`
{
  // Whether users can draw on the board.
  CAN_DRAW?: boolean;
  // Whether users can select on the board.
  CAN_SELECT?: boolean;
  // Whether users can pan the board manually.
  CAN_PAN?: boolean;
  // Whether users can zoom.
  CAN_ZOOM?: boolean;

  // Whether Positionables should snap to the grid.
  SNAP_TO_GRID?: boolean;
  // Grid size for snapping
  GRID_SIZE?: number;

  BOUNDS?: {
    // null: no boundary | n: boundary at n
    minX: number | null;
    // null: no boundary | n: boundary at n
    maxX: number | null;
    // null: no boundary | n: boundary at n
    minY: number | null;
    // null: no boundary | n: boundary at n
    maxY: number | null;
    // null: minZoom = 0 | n: minZoom at n
    minZoom: number | null;
    // null: maxZoom = 0 | n: maxZoom at n
    maxZoom: number | null;
    // hard: movement will be blocked past boundary | soft: movement will be allowed past boundary, but position will be snapped to boundary on end of drag
    limit: "hard" | "soft";
  };

  // Whether to only render positionables in viewport (set to false if you have issue with component lifecycle)
  CULL?: boolean;
  // Margin around viewport to make panning smooth
  CULL_MARGIN?: number;

  // Dev / debug overlays
  DEV: {
    SHOW_POS: boolean;
    SHOW_MODE: boolean;
  };
}
`}),`
`,e.jsx(t.h5,{id:"board-1",children:e.jsx(t.code,{children:"board"})}),`
`,e.jsx(t.p,{children:"Initial state of the board."}),`
`,e.jsx(n,{language:"typescript",code:`
{
  // X, Y offset on the board
  viewOffset: Vec2;
  // Size -> Currently mostly irreleant
  viewSize: Vec2;
  // Store viewport position in case container el is not full window
  viewPort: Vec4;
  // Current zoom factor
  zoom: number;
}
`}),`
`,e.jsx(t.h3,{id:"positionable",children:"Positionable"}),`
`,e.jsx(t.p,{children:"Any element placed on the board must be wrapped in a Positionable component. This component handles the positioning of the element on the board whilst panning and zooming."}),`
`,e.jsx(t.p,{children:"The example below illustrates how a Positionable component can be used to place an element on the board:"}),`
`,e.jsx(n,{language:"html",code:`
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
`,e.jsx(t.p,{children:"If you want to dynamically render multiple elements on the board, you can simply store their state in some array and use svelte's each directive:"}),`
`,e.jsx(n,{language:"html",code:`
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
`,e.jsx(t.h3,{id:"draggable",children:"Draggable"}),`
`,e.jsx(t.p,{children:"A draggable element can be used inside of a Positionable element to enable moving it around the board:"}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:"💡 Notice, that we need to use the bind: directive for the pos & size props, as the changes handled inside the Draggable component need to be applied to the state of the Positionable component as well."}),`
`]}),`
`,e.jsx(n,{language:"html",code:`
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
`}),`
`,e.jsx(t.h3,{id:"resizable",children:"Resizable"}),`
`,e.jsx(t.p,{children:"todo"}),`
`,e.jsx(t.h3,{id:"grid",children:"Grid"}),`
`,e.jsx(t.p,{children:"The Grid component can be placed inside a board to display an infinite background grid. Just place the Grid component inside a Board component and use the props to adjust the stlying."}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:"💡 The grid gap itself is derived from the board's GRID_SIZE setting."}),`
`]}),`
`,e.jsx(n,{language:"html",code:`
...
<Board ...>
  <Grid dotColor="black" dotOpacity={30} dotSize={1}/>
</Board>
...
`}),`
`,e.jsx(t.h4,{id:"grid-props",children:"Grid Props"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"dotColor"}),": string    | css color for dots."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"dotOpacity"}),": number  | opacity (0-100)"]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"dotSize"}),": number     | size"]}),`
`]}),`
`,e.jsx(t.h2,{id:"styling",children:"Styling"}),`
`,e.jsx(t.p,{children:"Styling tela components can be done in 3 different ways (example code below):"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Style the default tela class (e.g. ",e.jsx(t.code,{children:".positionable"})," for positionable elements)."]}),`
`,e.jsx(t.li,{children:"Add a custom class to the element and style it in the css style block."}),`
`,e.jsx(t.li,{children:"Add inline styles to the element."}),`
`]}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:["💡 If you are using classes for styling, make sure to either use the ",e.jsx(t.code,{children:":global(.yourClassName) {}"})," selector or an external stylesheet. Otherwise, the styles will be scoped to your component and will not be applied to the actual tela element underneath."]}),`
`]}),`
`,e.jsx(t.p,{children:`Tela also provides a default stylesheet which you can import into your project. This stylesheet contains some sensible default like mouse cursors indicating the current mode, or the selection rectangle.
You can use this stylesheet by importing it into your svelte file (todo: adjust path):`}),`
`,e.jsx(n,{language:"html",code:`
<script>
  import "@deta/tela/dist/tela.css";
  ...
<\/script>
`}),`
`,e.jsx(t.h3,{id:"global-classes",children:"Global classes"}),`
`,e.jsx(t.p,{children:"Tela adds a few default classes to its elements, so you can start styling them right away. These classes are:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"tela-container"}),": The container element of a board."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"board"}),": The board element inside the container."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"positionable"}),": A positionable element inside the board."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"draggable"}),": A draggable element inside the board."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"resizable"}),": A resizable element inside the board."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"selection-rect"}),": the rectangle beeing drawn whilst dragging in the ",e.jsx(t.code,{children:"draw"})," or ",e.jsx(t.code,{children:"selecting"})," mode."]}),`
`]}),`
`]}),`
`,e.jsx(t.p,{children:"Some additional classes are added to the body, which can be used to apply styling depending on the current state (e.g. mouse cursor). These are:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:e.jsx(t.code,{children:"body.drawing"})}),`
`,e.jsx(t.li,{children:e.jsx(t.code,{children:"body.panning"})}),`
`,e.jsx(t.li,{children:e.jsx(t.code,{children:"body.selecting"})}),`
`]}),`
`,e.jsxs(t.p,{children:["View the ",e.jsx(t.a,{href:"/todo",children:"Styling example"})," for a complete example."]})]})}function u(o={}){const{wrapper:t}=Object.assign({},s(),o.components);return t?e.jsx(t,Object.assign({},o,{children:e.jsx(i,o)})):i(o)}export{u as default};
//# sourceMappingURL=tela-6d7d3037.js.map

import{j as e}from"./jsx-runtime-cd63fa74.js";import{M as o,b as a,C as l,A as r}from"./index-348d61cc.js";import{Default as d}from"./IntroBoard.stories-8f0b453d.js";import"./Board.stories-7cc992aa.js";import{P as c}from"./Positionable.stories-b3cfcf5e.js";import{u as t}from"./index-63af7c1d.js";import"./iframe-ca4d4c04.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";import"./index-eaaa2899.js";import"./Board-b886af08.js";import"./Positionable-51bce168.js";import"./spread-8a54911c.js";import"./Grid-2a71ea5b.js";function s(i){const n=Object.assign({h1:"h1",p:"p",h2:"h2",a:"a",h3:"h3",code:"code",blockquote:"blockquote",ul:"ul",li:"li"},t(),i.components);return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Get Started"}),`
`,e.jsx(n.h1,{id:"get-started",children:"Get Started"}),`
`,e.jsx(n.p,{children:`Tela is a declarative svelte library for creating infinite canvases, positioning elements on them, and handling all canvas related logic like moving elements, dragging, panning etc.
Using tela, the example code below is all you need to get an infinite canvas up and running, position elements on it.`}),`
`,e.jsx(a,{language:"jsx",code:`
<main>
  <Board {settings} {board}>
    <Positionable pos={{ x: 10, y: 10 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Hello, I am tela.</span>
    </Positionable>

    <Positionable pos={{ x: 200, y: 150 }} size={{ x: 400, y: 300 }} z={1}>
      <span>Try moving the canvas around with the trackpad or by using META + Left Mouse.</span>
    </Positionable>
  </Board>
</main>
`}),`
`,e.jsx(l,{of:d,layout:"fullscreen"}),`
`,e.jsx(n.h2,{id:"how-it-works",children:"How it works."}),`
`,e.jsxs(n.p,{children:[`The general usage idea is that you declare your board and the elements it contains in your markup, whilst binding properties like position and size to some external data source like a store.
Some real life examples on how this works and how you can integrate tela into your application can be found in the `,e.jsx(n.a,{href:"/examples",children:"examples"})," folder."]}),`
`,e.jsx(n.h2,{id:"components",children:"Components"}),`
`,e.jsx(n.h3,{id:"board",children:"Board"}),`
`,e.jsxs(n.p,{children:[`The board is the main component of tela. It is the container for all other components and handles all the logic for panning, zooming etc.
It can be configured using the `,e.jsx(n.code,{children:"settings"})," prop, and exposes the ",e.jsx(n.code,{children:"board"})," store, which contains all the information about the current state of the board like the zoom factor or the view offset."]}),`
`,e.jsx(n.p,{children:"todo: story"}),`
`,`
`,`
`,e.jsx(n.h3,{id:"positionable",children:"Positionable"}),`
`,e.jsxs(n.p,{children:["Any element on the board must be wrapped in a ",e.jsx(n.code,{children:"Positionable"})," component. This component handles the positioning of the element on the board whilst panning and zooming."]}),`
`,e.jsx(n.p,{children:"todo: story"}),`
`,e.jsx(r,{of:c}),`
`,e.jsx(n.h3,{id:"draggable",children:"Draggable"}),`
`,e.jsxs(n.p,{children:["These components can be used to make a specific area draggable by holding down the left mouse button on them. The ",e.jsx(n.code,{children:"pos"})," prop needs to be a svelte binding so the component can update the source value on change."]}),`
`,e.jsx(n.h3,{id:"resizable",children:"Resizable"}),`
`,e.jsx(n.p,{children:"These components create an element which acts as a handle for resizing."}),`
`,e.jsx(n.p,{children:"todo: direction prop"}),`
`,e.jsx(n.h3,{id:"grid",children:"Grid"}),`
`,e.jsxs(n.p,{children:["In case you want an infinite grid as the board background, which moves with the board, you can use the ",e.jsx(n.code,{children:"Grid"}),` component.
The styling of the grid dot's can be changed while the gap is determined by the `,e.jsx(n.code,{children:"GRID_SIZE"})," property of the board's settings."]}),`
`,e.jsx(n.p,{children:"todo: story"}),`
`,e.jsx(n.h2,{id:"styling",children:"Styling"}),`
`,e.jsxs(n.p,{children:["Each component in tela passes down its props to the underlying DOM element. This means that you can style them as you would any other Svelte component, either by adding a custom class or by directly using the html ",e.jsx(n.code,{children:"style"})," attribute."]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["💡 If you are using classes for styling, make sure to either use the ",e.jsx(n.code,{children:":global(.yourClassName) {}"})," selector or an external stylesheet. Otherwise, the styles will be scoped to your component and will not be applied to the actual tela element underneath."]}),`
`]}),`
`,e.jsx(n.h3,{id:"global-classes",children:"Global classes"}),`
`,e.jsx(n.p,{children:"Tela adds a few default classes to its elements, so you can start styling them right away. These classes are:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"tela-container"}),": The container element of a board."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"board"}),": The board element inside the container."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"positionable"}),": A positionable element inside the board."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"draggable"}),": A draggable element inside the board."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"resizable"}),": A resizable element inside the board."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"selection-rect"}),": the rectangle beeing drawn whilst dragging in the ",e.jsx(n.code,{children:"draw"})," or ",e.jsx(n.code,{children:"selecting"})," mode."]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:"Some additional classes are added to the body, which can be used to apply styling depending on the current state (e.g. mouse cursor). These are:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"body.drawing"})}),`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"body.panning"})}),`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"body.selecting"})}),`
`]}),`
`,e.jsx(n.h3,{id:"example",children:"Example"}),`
`,e.jsx(n.h2,{id:"utilities",children:"Utilities"}),`
`,e.jsx(n.h3,{id:"tela-ignore",children:e.jsx(n.code,{children:".tela-ignore"})}),`
`,e.jsx(n.p,{children:"Add this class to any element inside a board to make it ignore all tela events like dragging, moving etc."})]})}function A(i={}){const{wrapper:n}=Object.assign({},t(),i.components);return n?e.jsx(n,Object.assign({},i,{children:e.jsx(s,i)})):s(i)}export{A as default};
//# sourceMappingURL=getting-started-d9f06ec5.js.map

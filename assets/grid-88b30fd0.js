import{j as o}from"./jsx-runtime-6aff1e10.js";import{M as r,b as s}from"./index-dd04b6e9.js";import{G as d}from"./Grid.stories-1903100b.js";import{u as i}from"./index-ce5b6162.js";import"./iframe-5d73ace0.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-de833af9.js";import"./index-d37d4223.js";import"./index-e04ae519.js";import"./index-356e4a49.js";import"./index-76d2f1d2.js";import"./Positionable-6a060a99.js";import"./spread-8a54911c.js";import"./Grid-1a07993f.js";function n(t){const e=Object.assign({h1:"h1",p:"p",h2:"h2",blockquote:"blockquote",code:"code"},i(),t.components);return o.jsxs(o.Fragment,{children:[o.jsx(r,{of:d,name:"Example"}),`
`,o.jsx(e.h1,{id:"grid",children:"Grid"}),`
`,o.jsx(e.p,{children:"The Grid component can be placed inside a board to display an infinite background grid."}),`
`,o.jsx(e.h2,{id:"usage",children:"Usage"}),`
`,o.jsx(e.p,{children:"Just place the Grid component inside a Board component and use the props to adjust the stlying."}),`
`,o.jsxs(e.blockquote,{children:[`
`,o.jsxs(e.p,{children:["💡 The grid gap itself is derived from the board's ",o.jsx(e.code,{children:"GRID_SIZE"})," setting."]}),`
`]}),`
`,o.jsx(s,{language:"html",code:`
...
<Board ...>
  <Grid dotColor="black" dotOpacity={30} dotSize={1}/>
</Board>
...
`})]})}function k(t={}){const{wrapper:e}=Object.assign({},i(),t.components);return e?o.jsx(e,Object.assign({},t,{children:o.jsx(n,t)})):n(t)}export{k as default};
//# sourceMappingURL=grid-88b30fd0.js.map

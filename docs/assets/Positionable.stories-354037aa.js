import{S,i as k,s as w,e as x,p as d,c as j,b as C,q as b,f as c,h as O,j as _,r as y,m as g,t as z,v as h,w as T,x as q}from"./index-6ddd88a4.js";import{B,P as D,w as m}from"./Positionable-25bab829.js";function E(a){let e;return{c(){e=T("Positionable")},l(s){e=q(s,"Positionable")},m(s,t){_(s,e,t)},d(s){s&&c(e)}}}function M(a){let e,s;return e=new D({props:{pos:a[0],size:a[1],z:a[2],$$slots:{default:[E]},$$scope:{ctx:a}}}),{c(){d(e.$$.fragment)},l(t){b(e.$$.fragment,t)},m(t,o){y(e,t,o),s=!0},p(t,o){const n={};o&1&&(n.pos=t[0]),o&2&&(n.size=t[1]),o&4&&(n.z=t[2]),o&32&&(n.$$scope={dirty:o,ctx:t}),e.$set(n)},i(t){s||(g(e.$$.fragment,t),s=!0)},o(t){z(e.$$.fragment,t),s=!1},d(t){h(e,t)}}}function A(a){let e,s,t;return s=new B({props:{settings:a[3],board:a[4],$$slots:{default:[M]},$$scope:{ctx:a}}}),{c(){e=x("main"),d(s.$$.fragment),this.h()},l(o){e=j(o,"MAIN",{class:!0});var n=C(e);b(s.$$.fragment,n),n.forEach(c),this.h()},h(){O(e,"class","svelte-t7bhmd")},m(o,n){_(o,e,n),y(s,e,null),t=!0},p(o,[n]){const l={};n&39&&(l.$$scope={dirty:n,ctx:o}),s.$set(l)},i(o){t||(g(s.$$.fragment,o),t=!0)},o(o){z(s.$$.fragment,o),t=!1},d(o){o&&c(e),h(s)}}}function I(a,e,s){let{pos:t={x:0,y:0}}=e,{size:o={x:100,y:100}}=e,{z:n=1}=e;const l=m({}),v=m({viewOffset:{x:0,y:0},zoom:1});return a.$$set=i=>{"pos"in i&&s(0,t=i.pos),"size"in i&&s(1,o=i.size),"z"in i&&s(2,n=i.z)},[t,o,n,l,v]}class $ extends S{constructor(e){super(),k(this,e,I,A,w,{pos:0,size:1,z:2})}}const P=$;$.__docgen={version:3,name:"PositionableStory.svelte",data:[{visibility:"public",description:null,keywords:[],name:"pos",kind:"let",static:!1,readonly:!1,type:{kind:"type",text:"object",type:"object"}},{visibility:"public",description:null,keywords:[],name:"size",kind:"let",static:!1,readonly:!1,type:{kind:"type",text:"object",type:"object"}},{visibility:"public",description:null,keywords:[],name:"z",kind:"let",static:!1,readonly:!1,type:{kind:"type",text:"number",type:"number"},defaultValue:1}],computed:[],methods:[],components:[],description:null,keywords:[],events:[],slots:[],refs:[]};const N={component:P,title:"Components/Positionable",tags:["autodocs"],argTypes:{pos:{x:{control:"number"},y:{control:"number"}},size:{x:{control:"number"},y:{control:"number"}},z:{control:"number",min:0}},args:{pos:{x:0,y:0},size:{x:0,y:0},z:0}},V=a=>({Component:P,props:a}),r=V.bind({});var u,p,f;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`args => ({
  Component: PositionableStory,
  props: args
})`,...(f=(p=r.parameters)==null?void 0:p.docs)==null?void 0:f.source}}};const F=["Default"],J=Object.freeze(Object.defineProperty({__proto__:null,Default:r,__namedExportsOrder:F,default:N},Symbol.toStringTag,{value:"Module"}));export{J as P};
//# sourceMappingURL=Positionable.stories-354037aa.js.map

"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const e=require("vue"),z={key:0,class:"loading"},E=["id"],T={class:"fixed-column"},R={key:1,class:"blank"},w=e.defineComponent({__name:"lerniz-table",props:{isLoadingTable:Boolean,tableID:{type:String,default:"table"},zoom:{type:[Number,String],default:100},height:{type:Number,default:0},showTable:{type:Boolean,default:!0}},setup(r){const l=r,i=e.ref(null),d=e.ref(null),u=e.ref(null),a=e.ref(null),f=e.ref(0),v=e.ref(0),h=e.ref(0),m=e.ref(0),b=e.ref(!1),p=e.ref(!1),n=e.ref(!1),s=e.ref(!1),k=e.computed(()=>{const o=Number(l.zoom);return o<25?25:o>200?200:o}),y=e.computed(()=>k.value*.9/100),B=e.computed(()=>l.height==0?f.value-v.value-h.value-m.value:l.height),c=()=>{var o,t;if(f.value=window.innerHeight,i.value){const S=i.value.getBoundingClientRect();v.value=S.top}h.value=((o=d.value)==null?void 0:o.offsetHeight)||0,m.value=((t=u.value)==null?void 0:t.offsetHeight)||0},g=()=>{if(!a.value)return;const{scrollTop:o,scrollLeft:t}=a.value;b.value=o>0,p.value=t>0,n.value=t>0,s.value=o>0};return e.onMounted(()=>{var o;c(),window.addEventListener("resize",c),(o=a.value)==null||o.addEventListener("scroll",g)}),e.onBeforeUnmount(()=>{var o;window.removeEventListener("resize",c),(o=a.value)==null||o.removeEventListener("scroll",g)}),(o,t)=>(e.openBlock(),e.createElementBlock("div",{ref_key:"boxRef",ref:i,class:"container"},[e.createElementVNode("div",{ref_key:"toolbarTopRef",ref:d,class:"toolbar"},[e.renderSlot(o.$slots,"toolbar-top")],512),e.createElementVNode("div",{ref_key:"tableWrapperRef",ref:a,class:"table-wrapper",style:e.normalizeStyle({height:B.value+"px"})},[l.isLoadingTable?(e.openBlock(),e.createElementBlock("div",z," Cargando... ")):(e.openBlock(),e.createElementBlock("div",{key:1,id:l.tableID},[r.showTable?(e.openBlock(),e.createElementBlock("table",{key:0,class:e.normalizeClass(["fixed-table",{"shadow-right-col":p.value}]),style:e.normalizeStyle({"font-size":y.value+"rem"})},[e.createElementVNode("thead",{class:e.normalizeClass(["fixed-thead",{"shadow-under":b.value}])},[e.createElementVNode("tr",null,[e.createElementVNode("th",{class:e.normalizeClass({"shadow-first-cell-right":n.value&&!s.value,"shadow-first-cell-bottom":s.value&&!n.value,"shadow-first-cell-all":s.value&&n.value})},[e.renderSlot(o.$slots,"first-cell")],2),e.renderSlot(o.$slots,"columns")])],2),e.createElementVNode("tbody",T,[e.renderSlot(o.$slots,"rows")])],6)):(e.openBlock(),e.createElementBlock("div",R,[e.renderSlot(o.$slots,"blank")]))],8,E))],4),e.createElementVNode("div",{ref_key:"toolbarBottomRef",ref:u,class:"toolbar"},[e.renderSlot(o.$slots,"toolbar-bottom")],512)],512))}}),_={install:r=>{r.component("LernizTable",w)}};exports.LernizTable=w;exports.default=_;

"use strict";var rt=Object.defineProperty;var mt=Object.getOwnPropertyDescriptor;var yt=Object.getOwnPropertyNames;var xt=Object.prototype.hasOwnProperty;var vt=(c,t)=>{for(var e in t)rt(c,e,{get:t[e],enumerable:!0})},wt=(c,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of yt(t))!xt.call(c,i)&&i!==e&&rt(c,i,{get:()=>t[i],enumerable:!(s=mt(t,i))||s.enumerable});return c};var bt=c=>wt(rt({},"__esModule",{value:!0}),c);var Pt={};vt(Pt,{BaseRenderer:()=>H,CanvasRenderer:()=>X,Minimap:()=>at,SVGRenderer:()=>j,SciFlow:()=>q,StateManager:()=>V,darkTheme:()=>Y,lightTheme:()=>F,mount:()=>Et});module.exports=bt(Pt);var F={name:"light",colors:{background:"#f8f9fa",gridDot:"#d7d9dd",nodeBackground:"#ffffff",nodeBorder:"#e2e8f0",nodeText:"#1e293b",edgeLine:"#94a3b8",edgeActive:"#3b82f6",edgeAnimated:"#3b82f6",portBackground:"#e2e8f0",portBorder:"#94a3b8",contextMenuBackground:"#ffffff",contextMenuText:"#1e293b",contextMenuHover:"#f1f5f9",selectionBoxBackground:"rgba(59, 130, 246, 0.1)",selectionBoxBorder:"rgba(59, 130, 246, 0.5)"}},Y={name:"dark",colors:{background:"#0f172a",gridDot:"#334155",nodeBackground:"#1e293b",nodeBorder:"#334155",nodeText:"#f8fafc",edgeLine:"#475569",edgeActive:"#60a5fa",edgeAnimated:"#60a5fa",portBackground:"#1e293b",portBorder:"#64748b",contextMenuBackground:"#1e293b",contextMenuText:"#f1f5f9",contextMenuHover:"#334155",selectionBoxBackground:"rgba(96, 165, 250, 0.1)",selectionBoxBorder:"rgba(96, 165, 250, 0.5)"}};var K=class{history=[];historyIndex=-1;maxHistory=50;isRestoringHistory=!1;constructor(){}saveSnapshot(t){if(this.isRestoringHistory)return;let e=JSON.stringify({nodes:Array.from(t.nodes.entries()),edges:Array.from(t.edges.entries())});this.historyIndex<this.history.length-1&&(this.history=this.history.slice(0,this.historyIndex+1)),!(this.history.length>0&&this.history[this.historyIndex]===e)&&(this.history.push(e),this.history.length>this.maxHistory?this.history.shift():this.historyIndex++)}undo(t){this.historyIndex>0&&(this.historyIndex--,this.performRestore(this.history[this.historyIndex],t))}redo(t){this.historyIndex<this.history.length-1&&(this.historyIndex++,this.performRestore(this.history[this.historyIndex],t))}performRestore(t,e){this.isRestoringHistory=!0,e(t),this.isRestoringHistory=!1}};var U=class{registry=new Map;register(t){this.registry.set(t.type,t)}get(t){return this.registry.get(t)}getAllTypes(){return Array.from(this.registry.keys())}getFullRegistry(){return this.registry}};var V=class{state;listeners=new Set;id;history=new K;registry=new U;onNodesChange;onEdgesChange;onConnect;onNodeMount;onNodeUnmount;onNodeContextMenu;onEdgeContextMenu;onPaneContextMenu;constructor(t){this.id=Math.random().toString(36).substring(2,9),this.state={nodes:new Map,edges:new Map,viewport:{x:0,y:0,zoom:1},defaultEdgeType:"bezier",defaultEdgeStyle:{lineStyle:"solid"},...t}}registerNodeType(t){this.registry.register(t)}getNodeDefinition(t){return this.registry.get(t)}getRegisteredNodeTypes(){return this.registry.getAllTypes()}getNodeRegistry(){return this.registry.getFullRegistry()}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){this.listeners.forEach(t=>t(this.state))}forceUpdate(){this.notify()}setNodes(t){this.state.nodes.clear(),t.forEach(e=>this.state.nodes.set(e.id,e)),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values()))}setEdges(t){this.state.edges.clear(),t.forEach(e=>this.state.edges.set(e.id,e)),this.notify(),this.onEdgesChange?.(Array.from(this.state.edges.values()))}setSelection(t,e){this.state.nodes.forEach(s=>s.selected=t.includes(s.id)),this.state.edges.forEach(s=>s.selected=e.includes(s.id)),this.notify()}appendSelection(t,e){if(t){let s=this.state.nodes.get(t);s&&(s.selected=!0)}if(e){let s=this.state.edges.get(e);s&&(s.selected=!0)}this.notify()}addNode(t){this.state.nodes.set(t.id,t),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values()))}setDraftEdge(t,e,s){this.state.draftEdge={sourceNodeId:t,sourcePortId:e,targetPosition:s},this.notify()}clearDraftEdge(){this.state.draftEdge=void 0,this.notify()}removeNode(t){let e=this.getDescendantsLocal([t]),s=new Set([t,...e]);for(let i of s){this.state.nodes.delete(i);for(let[o,r]of this.state.edges.entries())(r.source===i||r.target===i)&&this.state.edges.delete(o)}this.notify(),this.saveSnapshot(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}getDescendantsLocal(t){let e=new Set,s=[...t];for(;s.length>0;){let i=s.pop();for(let[o,r]of this.state.nodes.entries())r.parentId===i&&!e.has(o)&&(e.add(o),s.push(o))}return Array.from(e)}updateNodePosition(t,e,s,i=!1){let o=this.state.nodes.get(t);o&&(o.position={x:e,y:s},this.notify(),i||this.onNodesChange?.(Array.from(this.state.nodes.values())))}addEdge(t){this.state.edges.set(t.id,t),this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.onConnect?.({source:t.source,sourceHandle:t.sourceHandle,target:t.target,targetHandle:t.targetHandle})}removeEdge(t){this.state.edges.delete(t)&&(this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values())))}saveSnapshot(){this.history.saveSnapshot(this.state)}undo(){this.history.undo(t=>this.restoreSnapshot(t))}redo(){this.history.redo(t=>this.restoreSnapshot(t))}restoreSnapshot(t){let e=JSON.parse(t);this.state.nodes=new Map(e.nodes),this.state.edges=new Map(e.edges),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}setDefaultEdgeType(t){this.state.defaultEdgeType=t,this.notify()}setDefaultEdgeStyle(t){this.state.defaultEdgeStyle={...this.state.defaultEdgeStyle,...t},this.notify()}toJSON(){return JSON.stringify({version:"sci-flow-1.0",nodes:Array.from(this.state.nodes.values()),edges:Array.from(this.state.edges.values()),viewport:this.state.viewport})}fromJSON(t){try{let e=JSON.parse(t);this.state.nodes.clear(),Array.isArray(e.nodes)&&e.nodes.forEach(s=>this.state.nodes.set(s.id,s)),this.state.edges.clear(),Array.isArray(e.edges)&&e.edges.forEach(s=>this.state.edges.set(s.id,s)),e.viewport&&(this.state.viewport=e.viewport),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.saveSnapshot()}catch(e){console.error("Failed to parse SciFlow JSON",e)}}setViewport(t){this.state.viewport=t,this.notify()}setSmartGuides(t){this.state.smartGuides=t,this.notify()}clearSmartGuides(){this.state.smartGuides=void 0,this.notify()}commitNodePositions(){this.onNodesChange?.(Array.from(this.state.nodes.values()))}};var H=class{container;stateManager;constructor(t){this.container=t.container}};function dt(c,t,e,s=20){let i=new Set,o=new Set,r=c.x,a=c.y,n=t.x,d=t.y;i.add(r),i.add(n),o.add(a),o.add(d),i.add(r+(n-r)/2),o.add(a+(d-a)/2),i.add(r+s),i.add(r-s),o.add(a+s),o.add(a-s),i.add(n+s),i.add(n-s),o.add(d+s),o.add(d-s);for(let g of e)i.add(g.x),i.add(g.x+g.width),i.add(g.x-s),i.add(g.x+g.width+s),o.add(g.y),o.add(g.y+g.height),o.add(g.y-s),o.add(g.y+g.height+s);let l=Array.from(i).sort((g,N)=>g-N),p=Array.from(o).sort((g,N)=>g-N),f=(g,N)=>{for(let M of e){let P=M.x-1,G=M.x+M.width+1,k=M.y-1,u=M.y+M.height+1;if(g.x===N.x){if(g.x>P&&g.x<G){let C=Math.min(g.y,N.y),L=Math.max(g.y,N.y);if(C<u&&L>k)return!0}}else if(g.y>k&&g.y<u){let C=Math.min(g.x,N.x),L=Math.max(g.x,N.x);if(C<G&&L>P)return!0}}return!1},y=(g,N)=>N*l.length+g,v=g=>({xi:g%l.length,yi:Math.floor(g/l.length)}),S=p.indexOf(a),A=p.indexOf(d),T=l.indexOf(r),D=l.indexOf(n),h=(g,N)=>{let M=g.x+(N.x-g.x)/2;return`M ${g.x},${g.y} L ${M},${g.y} L ${M},${N.y} L ${N.x},${N.y}`};if(T===-1||S===-1||D===-1||A===-1)return h(c,t);let w=y(T,S),I=y(D,A),x=new Set([w]),E=new Set,b=new Map,m=new Map,R=new Map;for(b.set(w,0),m.set(w,Math.abs(t.x-c.x)+Math.abs(t.y-c.y));x.size>0;){let g=-1,N=1/0;for(let u of x){let C=m.get(u)??1/0;C<N&&(N=C,g=u)}if(g===I){let u=[],C=g;for(;C!==w;){let{xi:$,yi:B}=v(C);u.unshift({x:l[$],y:p[B]}),C=R.get(C)}u.unshift({x:c.x,y:c.y});let L=[u[0]];for(let $=1;$<u.length-1;$++){let B=u[$-1],O=u[$+1],z=u[$];B.x===z.x&&z.x===O.x||B.y===z.y&&z.y===O.y||L.push(z)}return L.push(u[u.length-1]),`M ${L.map($=>`${$.x},${$.y}`).join(" L ")}`}x.delete(g),E.add(g);let{xi:M,yi:P}=v(g),G={x:l[M],y:p[P]},k=[];M>0&&k.push({xi:M-1,yi:P}),M<l.length-1&&k.push({xi:M+1,yi:P}),P>0&&k.push({xi:M,yi:P-1}),P<p.length-1&&k.push({xi:M,yi:P+1});for(let u of k){let C=y(u.xi,u.yi);if(E.has(C))continue;let L={x:l[u.xi],y:p[u.yi]};if(f(G,L))continue;let $=0;if(R.has(g)){let z=R.get(g),ft=v(z).yi===P,ut=u.yi===P;ft!==ut&&($+=100)}let B=Math.abs(L.x-G.x)+Math.abs(L.y-G.y),O=(b.get(g)??0)+B+$;(!x.has(C)||O<(b.get(C)??1/0))&&(R.set(C,g),b.set(C,O),m.set(C,O+Math.abs(t.x-L.x)+Math.abs(t.y-L.y)),x.add(C))}}return h(c,t)}var St=(c,t,e=.25)=>{let s=(t.x-c.x)*e;return`M ${c.x},${c.y} C ${c.x+s},${c.y} ${t.x-s},${t.y} ${t.x},${t.y}`},Mt=(c,t)=>`M ${c.x},${c.y} L ${t.x},${t.y}`,ct=(c,t,e=0)=>{let s=t.x-c.x,i=c.x+s/2;if(e<=0)return`M ${c.x},${c.y} L ${i},${c.y} L ${i},${t.y} L ${t.x},${t.y}`;let o=t.y-c.y,r=Math.min(e,Math.abs(s/2),Math.abs(o/2));if(r<=1)return`M ${c.x},${c.y} L ${i},${c.y} L ${i},${t.y} L ${t.x},${t.y}`;let a=Math.sign(s),n=Math.sign(o),d=i-r*a,l=c.y+r*n,p=i+r*a,f=t.y-r*n,y=a*n>0?1:0,v=a*n>0?0:1;return`M ${c.x},${c.y} L ${d},${c.y} A ${r},${r} 0 0 ${y} ${i},${l} L ${i},${f} A ${r},${r} 0 0 ${v} ${p},${t.y} L ${t.x},${t.y}`},W=({source:c,target:t,mode:e="bezier",curvature:s=.5,obstacles:i=[]})=>{switch(e){case"straight":return Mt(c,t);case"step":return ct(c,t,0);case"smooth-step":return ct(c,t,8);case"smart":return dt(c,t,i);default:return St(c,t,s)}};var lt=`
  :root {
    --sf-node-bg: #282828;
    --sf-node-border: #141414;
    --sf-node-header-ops: #3f3f3f;
    --sf-node-header-input: #e38634;
    --sf-node-header-output: #b33939;
    --sf-node-header-text: #ffffff;
    --sf-node-selected: #ffffff;
    --sf-port-bg: #808080;
    --sf-port-active: #ffffff;
    --sf-edge-line: #808080;
    --sf-edge-active: #ffffff;
    --sf-grid-dot: #2c2e33;
    --sf-bg: #121417;
  }

  .sci-flow-svg-renderer {
    user-select: none;
    -webkit-user-select: none;
    background-color: transparent;
  }

  /* Main background should be on the container or a separate layer */
  .sci-flow-container {
    background-color: #121417;
    position: relative;
    overflow: hidden;
  }

  .sci-flow-node-wrapper {
    position: relative;
    display: inline-block;
    background-color: var(--sf-node-bg);
    border: 1px solid var(--sf-node-border);
    border-radius: 6px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    transition: box-shadow 0.2s ease;
    min-width: 140px;
    /* Removed overflow: hidden to allow ports to be visible outside */
  }

  .sci-flow-node-selected .sci-flow-node-wrapper {
    border-color: var(--sf-node-selected);
    box-shadow: 0 0 0 1px var(--sf-node-selected), 0 8px 16px rgba(0,0,0,0.5);
  }

  .sci-flow-node-header {
    height: 32px;
    box-sizing: border-box;
    padding: 6px 10px;
    background-color: var(--sf-node-header-ops);
    color: var(--sf-node-header-text);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .sci-flow-node-wrapper[data-type="math-node"] .sci-flow-node-header {
    background-color: var(--sf-node-header-input);
  }

  .sci-flow-node-wrapper[data-type="basic"] .sci-flow-node-header {
    background-color: var(--sf-node-header-output);
  }

  .sci-flow-node-main {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 140px;
  }

  .sci-flow-node-body {
    padding: 1px 7px 5px;
    color: #eee;
    font-size: 12px;
    line-height: 1.4;
    min-height: 20px;
  }

  .sci-flow-node-ports-area {
    position: relative;
    width: 100%;
    background: rgba(0,0,0,0.1);
    box-sizing: border-box;
  }

  .sci-flow-node-actions {
    padding: 8px 10px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sci-flow-node-id {
    opacity: 0.4;
    font-size: 10px;
    font-weight: normal;
  }

  .sci-flow-node-fallback {
    padding: 20px 10px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .sci-flow-port {
    cursor: crosshair;
    z-index: 20;
    fill: var(--sf-port-bg);
    stroke: var(--sf-node-bg);
    stroke-width: 1.5px;
    transition: transform 0.15s ease, fill 0.2s ease, filter 0.2s ease, r 0.2s ease;
    transform-box: fill-box;
    transform-origin: center;
    /* Ensure ports are always on top of edges */
    position: relative;
    /* Add a subtle glow to make ports more visible */
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.8));
  }

  /* Data type specific colors (Blender-inspired) */
  .sci-flow-port[data-data-type="number"] { fill: #a1a1a1; }
  .sci-flow-port[data-data-type="string"] { fill: #45a3e5; }
  .sci-flow-port[data-data-type="boolean"] { fill: #cc7070; }
  .sci-flow-port[data-data-type="any"] { fill: #e3b034; }
  .sci-flow-port[data-data-type="object"] { fill: #8b5cf6; }

  .sci-flow-port:hover {
    transform: scale(1.5);
    filter: brightness(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.6));
  }

  /* Connection Highlighting */
  .sci-flow-dragging-edge .sci-flow-port {
    opacity: 0.4;
    transition: opacity 0.3s ease;
  }

  .sci-flow-port-target-valid {
    opacity: 1 !important;
    r: 7 !important;
    fill: var(--sf-port-active) !important;
    filter: drop-shadow(0 0 8px var(--sf-port-active));
  }

  .sci-flow-port-target-invalid {
    opacity: 0.1 !important;
    cursor: not-allowed;
  }

  .sci-flow-port-label {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    font-size: 10px;
    font-weight: 500;
    fill: #aaaaaa;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    pointer-events: none;
    transition: fill 0.2s ease, opacity 0.2s ease;
  }

  /* Highlight labels on node hover */
  .sci-flow-node-selected .sci-flow-port-label,
  .sci-flow-node:hover .sci-flow-port-label {
    fill: #fff;
    opacity: 1;
  }

  /* Emphasize ports on node hover */
  .sci-flow-node-selected .sci-flow-port,
  .sci-flow-node:hover .sci-flow-port {
    filter: brightness(1.1);
  }

  /* Edge port indicators - should be subtle */
  .sci-flow-port-source,
  .sci-flow-port-target {
    fill: var(--sf-bg);
    stroke: var(--sf-edge-line);
    stroke-width: 2px;
    opacity: 0.8;
    pointer-events: none;
  }

  .sci-flow-edge-fg {
    fill: none;
    pointer-events: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sci-flow-edge-bg {
    fill: none;
    pointer-events: stroke;
    stroke: transparent;
    stroke-width: 15px;
    cursor: pointer;
  }

  .sci-flow-edge-animated-pulse {
    animation: sf-blink 1s ease-in-out infinite;
  }

  .sci-flow-edge-animated-arrows {
    stroke-dasharray: 10, 5;
    animation: sf-dash-anim 0.5s linear infinite;
  }

  .sci-flow-edge-animated-symbols {
    /* Base style for symbols, actual pattern set in JS */
    animation: sf-dash-anim 1s linear infinite;
  }

  .sci-flow-edge-symbols {
    pointer-events: none;
    fill: var(--sf-edge-line);
    font-family: 'Inter', sans-serif;
    letter-spacing: 2px;
  }

  @keyframes sf-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  @keyframes sf-dash-anim {
    from {
      stroke-dashoffset: 30;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes sf-text-flow {
    from {
      startOffset: -10%;
    }
    to {
      startOffset: 100%;
    }
  }
`;function ht(c,t,e){let s=e||document,i="getElementById"in s?s.getElementById(`node-${c.id}`):s.querySelector(`#node-${c.id}`);if(i){let w=i.querySelector(`[data-portid="${t}"]`);if(w){let I=w.getAttribute("cx"),x=w.getAttribute("cy");if(I!==null&&x!==null){let E=parseFloat(I),b=parseFloat(x);if(E!==0||b!==0||t.endsWith("0"))return{x:c.position.x+E,y:c.position.y+b}}}}let o=c.style?.width||140,r=c.style?.height||100,a=c.portConfig||"left-right",n=Object.keys(c.inputs||{}),d=Object.keys(c.outputs||{}),l=32,p=26,f="left",y=0,v=!!c.inputs[t],S=!!c.outputs[t];v?(y=n.indexOf(t),y===-1&&n.length>0&&(y=0),a==="top-bottom"||a==="top-in-bottom-out"?f="top":a==="bottom-top"||a==="bottom-in-top-out"?f="bottom":a==="right-in-left-out"?f="right":a==="left-top-in-bottom-right-out"?f="top-left":a==="bottom-right-in-left-top-out"?f="bottom-right":f="left"):S&&(y=d.indexOf(t),y===-1&&d.length>0&&(y=0),a==="top-bottom"||a==="bottom-in-top-out"?f="bottom":a==="bottom-top"||a==="top-in-bottom-out"?f="top":a==="left-in-right-out"?f="right":a==="right-in-left-out"?f="left":a==="left-top-in-bottom-right-out"?f="bottom-right":a==="bottom-right-in-left-top-out"?f="top-left":f="right");let T=l+60,D=Math.max(0,y),h=T+13+D*p;switch(f){case"top":return{x:c.position.x+o/2,y:c.position.y};case"bottom":return{x:c.position.x+o/2,y:c.position.y+r};case"left":return{x:c.position.x-6,y:c.position.y+h};case"right":return{x:c.position.x+o+6,y:c.position.y+h};case"top-left":return{x:c.position.x-6,y:c.position.y+h};case"bottom-right":return{x:c.position.x+o+6,y:c.position.y+h};default:return{x:c.position.x-6,y:c.position.y+h}}}var Z=class{constructor(t){this.nodesGroup=t}reconcile(t,e,s,i){t.forEach(o=>{let r=document.getElementById(`node-${o.id}`);if(r){let a=r.querySelector(".sci-flow-node-wrapper"),n=i.get(o.type),d=a?.dataset.isDefaultPreview==="true";if(a&&(a.dataset.type!==o.type||d&&n)&&(this.nodesGroup.removeChild(r),r=this.createNodeElement(o,s,i),this.nodesGroup.appendChild(r),s?.onNodeMount)){let l=r.querySelector(".sci-flow-node-wrapper"),p=r.querySelector(".sci-flow-node-body");s.onNodeMount(o.id,p||l)}}else if(r=this.createNodeElement(o,s,i),this.nodesGroup.appendChild(r),s?.onNodeMount){let a=r.querySelector(".sci-flow-node-wrapper"),n=r.querySelector(".sci-flow-node-body");s.onNodeMount(o.id,n||a)}r.setAttribute("transform",`translate(${o.position.x}, ${o.position.y})`),o.selected?r.classList.add("sci-flow-node-selected"):r.classList.remove("sci-flow-node-selected"),e.delete(`node-${o.id}`)})}createNodeElement(t,e,s){let i=document.createElementNS("http://www.w3.org/2000/svg","g");i.id=`node-${t.id}`,i.setAttribute("class","sci-flow-node");let o=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),r=t.style?.width||140,a=t.style?.height||100;o.setAttribute("width",r.toString()),o.setAttribute("height",a.toString()),o.style.overflow="visible";let n=document.createElement("div");n.className="sci-flow-node-wrapper",n.dataset.type=t.type;let d=s.get(t.type);n.dataset.isDefaultPreview=d?"false":"true";let l=Object.keys(t.inputs||{}),p=Object.keys(t.outputs||{}),f=32,y=26;n.innerHTML=`
            <div class="sci-flow-node-header">
                <strong>${d&&t.data?.title||t.type}</strong>
                <span class="sci-flow-node-id">${t.id.slice(0,4)}</span>
            </div>
            <div class="sci-flow-node-main">
                <div class="sci-flow-node-body"></div>
                <div class="sci-flow-node-ports-area"></div>
                <div class="sci-flow-node-actions"></div>
            </div>
        `;let v=n.querySelector(".sci-flow-node-body"),S=n.querySelector(".sci-flow-node-ports-area");d?.renderHTML?v.appendChild(d.renderHTML(t)):d||(v.innerHTML='<div class="sci-flow-node-fallback">Default Node Content</div>');let A=Math.max(l.length,p.length);A>0?(S.style.height=`${A*26}px`,S.style.minHeight="20px"):S.style.display="none",o.appendChild(n),i.appendChild(o);let T=(x,E,b)=>{let m=document.createElementNS("http://www.w3.org/2000/svg","circle");return m.setAttribute("class","sci-flow-port"),m.setAttribute("r","5"),m.dataset.nodeid=t.id,m.dataset.portid=x,m.dataset.portType=E,m.dataset.dataType=b,i.appendChild(m),m},D=l.map((x,E)=>{let b=T(x,"in",t.inputs[x]?.dataType||"any"),m=f+60+13+E*y;return b.setAttribute("cy",m.toString()),b.setAttribute("cx","-6"),b}),h=p.map((x,E)=>{let b=T(x,"out",t.outputs[x]?.dataType||"any"),m=f+60+13+E*y;return b.setAttribute("cy",m.toString()),b.setAttribute("cx",String(r+6)),b}),w;return new ResizeObserver(()=>{w&&cancelAnimationFrame(w),w=requestAnimationFrame(()=>{let x=n.offsetWidth,E=n.offsetHeight;if(x===0||E===0)return;o.setAttribute("width",x.toString()),o.setAttribute("height",E.toString());let b=n.querySelector(".sci-flow-node-ports-area"),m=b?b.offsetTop:f,R=e?.getState().nodes.get(t.id),g=R&&(Math.abs((R.style?.width||0)-x)>1||Math.abs((R.style?.height||0)-E)>1);g&&(R.style={...R.style,width:x,height:E}),D.forEach((M,P)=>{let G=m+13+P*y;M.setAttribute("cy",G.toString()),M.setAttribute("cx","-6");let k=`label-in-${t.id}-${l[P]}`,u=document.getElementById(k);u||(u=document.createElementNS("http://www.w3.org/2000/svg","text"),u.id=k,u.setAttribute("class","sci-flow-port-label"),u.setAttribute("x","12"),u.style.pointerEvents="none",i.appendChild(u)),u&&(u.setAttribute("y",(G+4).toString()),u.textContent=t.inputs[l[P]]?.label||l[P])}),h.forEach((M,P)=>{let G=m+13+P*y;M.setAttribute("cy",G.toString()),M.setAttribute("cx",String(x+6));let k=`label-out-${t.id}-${p[P]}`,u=document.getElementById(k);u||(u=document.createElementNS("http://www.w3.org/2000/svg","text"),u.id=k,u.setAttribute("class","sci-flow-port-label"),u.setAttribute("text-anchor","end"),u.style.pointerEvents="none",i.appendChild(u)),u&&(u.setAttribute("x",(x-12).toString()),u.setAttribute("y",(G+4).toString()),u.textContent=t.outputs[p[P]]?.label||p[P])}),(!n.dataset.layoutSettled||g)&&(n.dataset.layoutSettled="true",e?.forceUpdate())})}).observe(n),i}};var J=class{constructor(t,e,s,i,o,r,a){this.edgesGroup=t;this.routerWorker=e;this.routeCache=s;this.routingHashCache=i;this.pendingRoutes=o;this.routerIdCounter=r;this.getPortAnchorFn=a}reconcile(t,e,s){t.edges.forEach(i=>{let o=t.nodes.get(i.source),r=t.nodes.get(i.target);if(!o||!r)return;let a=this.getPortAnchorFn(o,i.sourceHandle),n=this.getPortAnchorFn(r,i.targetHandle),d=i.type||"bezier",l=document.getElementById(`edge-group-${i.id}`);l||(l=this.createEdgeElement(i),this.edgesGroup.appendChild(l));let p=s.filter(f=>f.id!==i.source&&f.id!==i.target);this.updateEdgeVisuals(l,i,a,n,d,p),e.delete(`edge-group-${i.id}`)})}createEdgeElement(t){let e=document.createElementNS("http://www.w3.org/2000/svg","g");e.id=`edge-group-${t.id}`,e.setAttribute("class","sci-flow-edge-group");let s=document.createElementNS("http://www.w3.org/2000/svg","path");s.setAttribute("class","sci-flow-edge-bg"),s.setAttribute("fill","none"),s.style.stroke="transparent",s.style.strokeWidth="20px",s.style.cursor="pointer",s.style.pointerEvents="stroke";let i=document.createElementNS("http://www.w3.org/2000/svg","path");i.id=`edge-path-${t.id}`,i.setAttribute("class","sci-flow-edge-fg"),i.setAttribute("fill","none"),i.style.pointerEvents="none";let o=document.createElementNS("http://www.w3.org/2000/svg","path");o.setAttribute("class","sci-flow-edge-overlay"),o.setAttribute("fill","none"),o.style.pointerEvents="none",o.style.display="none";let r=document.createElementNS("http://www.w3.org/2000/svg","text");r.setAttribute("class","sci-flow-edge-symbols"),r.style.display="none",r.style.pointerEvents="none";let a=document.createElementNS("http://www.w3.org/2000/svg","textPath");a.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",`#edge-path-${t.id}`),a.setAttribute("startOffset","0%"),a.textContent="\xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB",r.appendChild(a);let n=document.createElementNS("http://www.w3.org/2000/svg","circle");n.setAttribute("class","sci-flow-port-source"),n.setAttribute("r","3"),n.style.pointerEvents="none";let d=document.createElementNS("http://www.w3.org/2000/svg","circle");return d.setAttribute("class","sci-flow-port-target"),d.setAttribute("r","3"),d.style.pointerEvents="none",e.appendChild(s),e.appendChild(i),e.appendChild(o),e.appendChild(r),e.appendChild(n),e.appendChild(d),e}updateEdgeVisuals(t,e,s,i,o,r){let a=t.querySelector(".sci-flow-edge-bg"),n=t.querySelector(".sci-flow-edge-fg"),d=t.querySelector(".sci-flow-edge-overlay"),l=t.querySelector(".sci-flow-edge-symbols"),p=t.querySelector(".sci-flow-port-source"),f=t.querySelector(".sci-flow-port-target");[p,f].forEach(h=>{h.style.fill="var(--sf-bg)",h.style.stroke=e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)",h.style.strokeWidth="1.5px",h.style.opacity="0.6"}),p.setAttribute("cx",`${s.x}`),p.setAttribute("cy",`${s.y}`),f.setAttribute("cx",`${i.x}`),f.setAttribute("cy",`${i.y}`);let y=e.style?.lineStyle||"solid",v=e.style?.stroke,S=e.style?.strokeWidth,A=e.style?.animationType||"dash";if(n.style.stroke=v||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),n.style.strokeWidth=S?`${S}px`:e.selected?"3px":"2px",n.classList.remove("sci-flow-edge-animated-pulse","sci-flow-edge-animated-arrows","sci-flow-edge-animated-symbols"),d.style.display="none",l&&(l.style.display="none",l.setAttribute("dominant-baseline","middle"),l.setAttribute("alignment-baseline","middle")),n.style.animation="",e.animated)if(A==="pulse")n.classList.add("sci-flow-edge-animated-pulse"),n.style.strokeDasharray="none";else if(A==="arrows")n.classList.add("sci-flow-edge-animated-arrows");else if(A==="symbols"){if(l){l.style.display="block",l.style.fill=v||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),l.style.fontSize="12px",l.style.fontWeight="bold";let h=l.querySelector("textPath");if(h){for(;h.firstChild;)h.removeChild(h.firstChild);h.textContent="\xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB";let w=document.createElementNS("http://www.w3.org/2000/svg","animate");w.setAttribute("attributeName","startOffset"),w.setAttribute("from","-20%"),w.setAttribute("to","100%"),w.setAttribute("dur","3s"),w.setAttribute("repeatCount","indefinite"),h.appendChild(w)}}n.style.strokeDasharray="none"}else n.style.strokeDasharray="5, 5",n.style.animation="sf-dash-anim 1s linear infinite";else n.style.animation="none",y==="dashed"?n.style.strokeDasharray="8, 8":y==="dotted"?n.style.strokeDasharray="2, 4":n.style.strokeDasharray="none";let T=`${s.x},${s.y}|${i.x},${i.y}|${o}|${r.length}`,D=h=>{a.setAttribute("d",h),n.setAttribute("d",h)};if(o==="smart")if(this.routeCache.has(e.id)&&this.routingHashCache.get(e.id)===T)D(this.routeCache.get(e.id));else{let h=W({source:s,target:i,mode:"step"});D(h);let w=`job-${this.routerIdCounter.value++}`;this.pendingRoutes.set(w,I=>{this.routeCache.set(e.id,I),this.routingHashCache.set(e.id,T);let x=document.getElementById(`edge-group-${e.id}`);if(x){let E=x.querySelector(".sci-flow-edge-bg"),b=x.querySelector(".sci-flow-edge-fg"),m=x.querySelector(".sci-flow-edge-overlay");E&&b&&(E.setAttribute("d",I),b.setAttribute("d",I),m&&m.setAttribute("d",I))}}),this.routerWorker.postMessage({id:w,source:s,target:i,obstacles:r,padding:20})}else{let h=W({source:s,target:i,mode:o,obstacles:r});D(h),d.setAttribute("d",h),this.routeCache.set(e.id,h),this.routingHashCache.set(e.id,T)}}};function pt(){let c=`
    const isLineBlocked = (p1, p2, obstacles) => {
        for (const obs of obstacles) {
            const ox1 = obs.x - 1; const ox2 = obs.x + obs.width + 1;
            const oy1 = obs.y - 1; const oy2 = obs.y + obs.height + 1;
            if (p1.x === p2.x) { 
                if (p1.x > ox1 && p1.x < ox2) {
                    const minY = Math.min(p1.y, p2.y);
                    const maxY = Math.max(p1.y, p2.y);
                    if (minY < oy2 && maxY > oy1) return true;
                }
            } else { 
                if (p1.y > oy1 && p1.y < oy2) {
                    const minX = Math.min(p1.x, p2.x);
                    const maxX = Math.max(p1.x, p2.x);
                    if (minX < ox2 && maxX > ox1) return true;
                }
            }
        }
        return false;
    };
    
    function getSmartOrthogonalPath(source, target, obstacles, padding = 20) {
        const xs = new Set(); const ys = new Set();
        const startX = source.x + padding; const endX = target.x - padding;
        xs.add(source.x); xs.add(startX); xs.add(target.x); xs.add(endX);
        ys.add(source.y); ys.add(target.y);
        
        for (const obs of obstacles) {
            xs.add(obs.x - padding); xs.add(obs.x + obs.width + padding);
            ys.add(obs.y - padding); ys.add(obs.y + obs.height + padding);
        }
        
        const xGrid = Array.from(xs).sort((a, b) => a - b);
        const yGrid = Array.from(ys).sort((a, b) => a - b);
        
        const getIdx = (xi, yi) => yi * xGrid.length + xi;
        const getCoords = (idx) => ({ xi: idx % xGrid.length, yi: Math.floor(idx / xGrid.length) });
        
        let startIdx = 0; let endIdx = 0;
        for(let i=0; i<xGrid.length; i++) {
            if (xGrid[i] === source.x) startIdx = getIdx(i, yGrid.indexOf(source.y));
            if (xGrid[i] === target.x) endIdx = getIdx(i, yGrid.indexOf(target.y));
        }

        const openSet = new Set([startIdx]);
        const closedSet = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const cameFrom = new Map();
        
        gScore.set(startIdx, 0);
        fScore.set(startIdx, Math.abs(target.x - source.x) + Math.abs(target.y - source.y));

        while (openSet.size > 0) {
            let current = -1; lowestF = Infinity;
            for (const node of openSet) {
                const f = fScore.get(node) ?? Infinity;
                if (f < lowestF) { lowestF = f; current = node; }
            }

            if (current === endIdx) {
                const path = [];
                let curr = current;
                while (cameFrom.has(curr)) {
                    const { xi, yi } = getCoords(curr);
                    path.unshift({ x: xGrid[xi], y: yGrid[yi] });
                    curr = cameFrom.get(curr);
                }
                path.unshift({ x: source.x, y: source.y });
                
                const cleanPath = [path[0]];
                for (let i = 1; i < path.length - 1; i++) {
                    const prev = path[i-1]; const next = path[i+1]; const p = path[i];
                    if ((prev.x === p.x && p.x === next.x) || (prev.y === p.y && p.y === next.y)) continue;
                    cleanPath.push(p);
                }
                cleanPath.push(path[path.length - 1]);
                return 'M ' + cleanPath.map(p => p.x + ',' + p.y).join(' L ');
            }

            openSet.delete(current); closedSet.add(current);
            const { xi, yi } = getCoords(current);
            const p1 = { x: xGrid[xi], y: yGrid[yi] };

            const neighbors = [];
            if (xi > 0) neighbors.push({ xi: xi - 1, yi });
            if (xi < xGrid.length - 1) neighbors.push({ xi: xi + 1, yi });
            if (yi > 0) neighbors.push({ xi, yi: yi - 1 });
            if (yi < yGrid.length - 1) neighbors.push({ xi, yi: yi + 1 });

            for (const neighbor of neighbors) {
                const nIdx = getIdx(neighbor.xi, neighbor.yi);
                if (closedSet.has(nIdx)) continue;
                
                const p2 = { x: xGrid[neighbor.xi], y: yGrid[neighbor.yi] };
                if (isLineBlocked(p1, p2, obstacles)) continue;
                
                const dist = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
                const tentativeG = (gScore.get(current) ?? Infinity) + dist;
                
                if (!openSet.has(nIdx)) openSet.add(nIdx);
                else if (tentativeG >= (gScore.get(nIdx) ?? Infinity)) continue;
                
                cameFrom.set(nIdx, current);
                gScore.set(nIdx, tentativeG);
                fScore.set(nIdx, tentativeG + Math.abs(target.x - p2.x) + Math.abs(target.y - p2.y));
            }
        }
        return 'M ' + source.x + ',' + source.y + ' L ' + target.x + ',' + target.y;
    }

    self.onmessage = function(e) {
        const { id, source, target, obstacles, padding } = e.data;
        const path = getSmartOrthogonalPath(source, target, obstacles, padding);
        self.postMessage({ id, path });
    };
    `,t=new Blob([c],{type:"application/javascript"});return new Worker(URL.createObjectURL(t))}var j=class extends H{svg;nodesGroup;edgesGroup;styleEl;routerWorker;pendingRoutes=new Map;routerIdCounter=0;routeCache=new Map;routingHashCache=new Map;nodeManager;edgeManager;constructor(t){super(t),this.container.classList.add("sci-flow-container"),this.routerWorker=pt(),this.routerWorker.onmessage=s=>{let{id:i,path:o}=s.data;this.pendingRoutes.has(i)&&(this.pendingRoutes.get(i)(o),this.pendingRoutes.delete(i))},this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.style.width="100%",this.svg.style.height="100%",this.svg.style.display="block",this.svg.style.position="absolute",this.svg.style.top="0",this.svg.style.left="0",this.svg.style.zIndex="1",this.svg.setAttribute("class","sci-flow-svg-renderer"),this.styleEl=document.createElement("style"),this.styleEl.textContent=lt,document.head.appendChild(this.styleEl),this.edgesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.edgesGroup.setAttribute("class","sci-flow-edges"),this.edgesGroup.style.transformOrigin="0 0",this.nodesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.nodesGroup.setAttribute("class","sci-flow-nodes"),this.nodesGroup.style.transformOrigin="0 0",this.svg.appendChild(this.edgesGroup),this.svg.appendChild(this.nodesGroup),this.container.appendChild(this.svg),this.nodeManager=new Z(this.nodesGroup);let e=this;this.edgeManager=new J(this.edgesGroup,this.routerWorker,this.routeCache,this.routingHashCache,this.pendingRoutes,{get value(){return e.routerIdCounter},set value(s){e.routerIdCounter=s}},this.getPortAnchor.bind(this))}render(t,e){let s=`translate(${t.viewport.x}, ${t.viewport.y}) scale(${t.viewport.zoom})`;this.edgesGroup.setAttribute("transform",s),this.nodesGroup.setAttribute("transform",s);let i=new Set(Array.from(this.nodesGroup.children).map(a=>a.id));this.nodeManager.reconcile(t.nodes,i,this.stateManager,e),i.forEach(a=>{document.getElementById(a)?.remove();let n=this.stateManager,d=a.replace("node-","");n?.onNodeUnmount&&n.onNodeUnmount(d)});let o=Array.from(t.nodes.values()).map(a=>({id:a.id,x:a.position.x,y:a.position.y,width:a.style?.width||140,height:a.style?.height||100})),r=new Set(Array.from(this.edgesGroup.children).map(a=>a.id));this.edgeManager.reconcile(t,r,o),r.forEach(a=>{document.getElementById(a)?.remove()}),this.renderDraftEdge(t,o)}renderDraftEdge(t,e){let s=document.getElementById("sci-flow-draft-edge");if(t.draftEdge){s||(s=document.createElementNS("http://www.w3.org/2000/svg","path"),s.id="sci-flow-draft-edge",s.setAttribute("class","sci-flow-edge sci-flow-draft-edge"),s.setAttribute("fill","none"),s.setAttribute("stroke","var(--sf-edge-animated)"),s.setAttribute("stroke-width","3"),s.setAttribute("stroke-dasharray","5, 5"),s.style.pointerEvents="none",this.edgesGroup.firstChild?this.edgesGroup.insertBefore(s,this.edgesGroup.firstChild):this.edgesGroup.appendChild(s));let i=t.nodes.get(t.draftEdge.sourceNodeId);if(i){let o=this.getPortAnchor(i,t.draftEdge.sourcePortId),r=t.draftEdge.targetPosition,a=e.filter(l=>l.id!==t.draftEdge?.sourceNodeId),n=t.defaultEdgeType||"bezier",d=W({source:o,target:r,mode:n,obstacles:a});s.setAttribute("d",d)}}else s&&s.remove()}getPortAnchor(t,e){return ht(t,e,this.nodesGroup)}getViewportElement(){return this.svg}destroy(){this.svg.remove(),this.styleEl.remove(),this.routerWorker.terminate()}};var X=class extends H{canvas;ctx;animationFrameId=null;state=null;registry=new Map;constructor(t){super(t),this.canvas=document.createElement("canvas"),this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.display="block",this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.zIndex="1",this.canvas.classList.add("sci-flow-canvas-renderer"),this.ctx=this.canvas.getContext("2d"),this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e),this.state&&this.render(this.state,this.registry)};render(t,e){this.state=t,this.registry=e,this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.animationFrameId=requestAnimationFrame(()=>this.draw(t,e))}draw(t,e){if(!this.ctx)return;let s=this.canvas.getBoundingClientRect();if(this.ctx.clearRect(0,0,s.width,s.height),this.ctx.save(),this.ctx.translate(t.viewport.x,t.viewport.y),this.ctx.scale(t.viewport.zoom,t.viewport.zoom),t.smartGuides&&t.smartGuides.length>0){this.ctx.strokeStyle="#e20f86",this.ctx.lineWidth=1/t.viewport.zoom,this.ctx.setLineDash([4/t.viewport.zoom,4/t.viewport.zoom]);for(let i of t.smartGuides)this.ctx.beginPath(),i.x!==void 0&&(this.ctx.moveTo(i.x,-1e5),this.ctx.lineTo(i.x,1e5)),i.y!==void 0&&(this.ctx.moveTo(-1e5,i.y),this.ctx.lineTo(1e5,i.y)),this.ctx.stroke()}this.ctx.restore()}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.canvas.remove()}};var _=class extends H{canvas;ctx;options;constructor(t){super(t),this.options={gridSize:t.gridSize||20,gridColor:t.gridColor||"rgba(100, 100, 100, 0.2)"},this.canvas=document.createElement("canvas"),this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.pointerEvents="none",this.canvas.style.zIndex="0",this.canvas.classList.add("sci-flow-grid"),this.ctx=this.canvas.getContext("2d"),this.container.firstChild?this.container.insertBefore(this.canvas,this.container.firstChild):this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e)};render(t){if(!this.ctx)return;let{x:e,y:s,zoom:i}=t.viewport,o=this.canvas.getBoundingClientRect();this.ctx.clearRect(0,0,o.width,o.height);let r=1;for(;this.options.gridSize*i*r<15;)r*=2;let a=this.options.gridSize*i*r,n=getComputedStyle(this.container).getPropertyValue("--sf-grid-dot").trim()||"#555";this.ctx.fillStyle=n;let d=1.5,l=e%a,p=s%a;for(let f=l;f<o.width;f+=a)for(let y=p;y<o.height;y+=a)this.ctx.fillRect(f,y,d,d)}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.canvas.remove()}};var Q=class{constructor(t){this.stateManager=t}handleWheel(t){t.preventDefault();let e=this.stateManager.getState(),{x:s,y:i,zoom:o}=e.viewport,a=-t.deltaY*.001,n=Math.min(Math.max(o+a,.1),5),d=t.currentTarget.getBoundingClientRect(),l=t.clientX-d.left,p=t.clientY-d.top,f=(l-s)/o,y=(p-i)/o,v=l-f*n,S=p-y*n;this.stateManager.setViewport({x:v,y:S,zoom:n})}handlePan(t,e){let s=t.clientX-e.x,i=t.clientY-e.y,o=this.stateManager.getState();return this.stateManager.setViewport({...o.viewport,x:o.viewport.x+s,y:o.viewport.y+i}),{x:t.clientX,y:t.clientY}}};var tt=class{constructor(t,e){this.container=t;this.stateManager=e}selectionBoxEl=null;selectionStart=null;startSelection(t){this.selectionStart=t,this.selectionBoxEl=document.createElement("div"),this.selectionBoxEl.style.position="absolute",this.selectionBoxEl.style.border="1px solid var(--sf-edge-active, #00f2ff)",this.selectionBoxEl.style.backgroundColor="rgba(0, 242, 255, 0.1)",this.selectionBoxEl.style.pointerEvents="none",this.selectionBoxEl.style.zIndex="1000",this.container.appendChild(this.selectionBoxEl)}updateSelection(t,e){if(!this.selectionStart||!this.selectionBoxEl)return;let s=Math.min(this.selectionStart.x,t.x),i=Math.min(this.selectionStart.y,t.y),o=Math.abs(this.selectionStart.x-t.x),r=Math.abs(this.selectionStart.y-t.y);this.selectionBoxEl.style.left=`${s}px`,this.selectionBoxEl.style.top=`${i}px`,this.selectionBoxEl.style.width=`${o}px`,this.selectionBoxEl.style.height=`${r}px`;let a=this.container.getBoundingClientRect(),n=this.screenToFlow(this.selectionStart,e,a),d=this.screenToFlow(t,e,a),l=Math.min(n.x,d.x),p=Math.min(n.y,d.y),f=Math.max(n.x,d.x),y=Math.max(n.y,d.y);this.performSelection(l,p,f,y)}endSelection(){this.selectionBoxEl&&(this.selectionBoxEl.remove(),this.selectionBoxEl=null),this.selectionStart=null}performSelection(t,e,s,i){let o=this.stateManager.getState(),r=[],a=[];o.nodes.forEach(n=>{let d=n.style?.width||200,l=n.style?.height||150;n.position.x>=t&&n.position.x+d<=s&&n.position.y>=e&&n.position.y+l<=i&&r.push(n.id)}),o.edges.forEach(n=>{let d=o.nodes.get(n.source),l=o.nodes.get(n.target);d&&l&&d.position.x>=t&&d.position.x<=s&&d.position.y>=e&&d.position.y<=i&&l.position.x>=t&&l.position.x<=s&&l.position.y>=e&&l.position.y<=i&&a.push(n.id)}),this.stateManager.setSelection(r,a)}screenToFlow(t,e,s){return{x:(t.x-s.left-e.x)/e.zoom,y:(t.y-s.top-e.y)/e.zoom}}};var et=class{constructor(t,e){this.container=t;this.stateManager=e}draftSourceNodeId=null;draftSourcePortId=null;startDraft(t,e,s){this.draftSourceNodeId=t,this.draftSourcePortId=e,this.container.setPointerCapture(s),this.container.classList.add("sci-flow-dragging-edge"),this.highlightValidPorts()}highlightValidPorts(){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let t=this.container.querySelectorAll(".sci-flow-port"),e=Array.from(t).find(o=>o.dataset.nodeid===this.draftSourceNodeId&&o.dataset.portid===this.draftSourcePortId),s=e?.dataset.dataType||"any",i=e?.dataset.portType;t.forEach(o=>{let r=o,a=r.dataset.nodeid,n=r.dataset.portid,d=r.dataset.dataType||"any",l=r.dataset.portType;if(a===this.draftSourceNodeId&&n===this.draftSourcePortId){r.classList.add("sci-flow-port-target-valid");return}a!==this.draftSourceNodeId&&i!==l&&(s==="any"||d==="any"||s===d)?r.classList.add("sci-flow-port-target-valid"):r.classList.add("sci-flow-port-target-invalid")})}clearPortHighlights(){this.container.querySelectorAll(".sci-flow-port").forEach(e=>{e.classList.remove("sci-flow-port-target-valid","sci-flow-port-target-invalid")})}updateDraft(t){!this.draftSourceNodeId||!this.draftSourcePortId||this.stateManager.setDraftEdge(this.draftSourceNodeId,this.draftSourcePortId,t)}endDraft(t){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let i=document.elementsFromPoint(t.clientX,t.clientY).find(o=>o.closest(".sci-flow-port"))?.closest(".sci-flow-port");if(i&&i.dataset.nodeid&&i.dataset.portid){let o=i.classList.contains("sci-flow-port-target-valid"),r=i.dataset.nodeid,a=i.dataset.portid;if(o&&r!==this.draftSourceNodeId){let n=this.stateManager.getState(),d=!1;for(let l of n.edges.values())if(l.source===this.draftSourceNodeId&&l.target===r&&l.sourceHandle===this.draftSourcePortId&&l.targetHandle===a){d=!0;break}d||this.stateManager.addEdge({id:`edge-${Date.now()}`,source:this.draftSourceNodeId,sourceHandle:this.draftSourcePortId,target:r,targetHandle:a,type:n.defaultEdgeType,style:n.defaultEdgeStyle?{...n.defaultEdgeStyle}:void 0})}}this.draftSourceNodeId=null,this.draftSourcePortId=null,this.stateManager.clearDraftEdge(),this.container.classList.remove("sci-flow-dragging-edge"),this.clearPortHighlights()}isDrafting(){return!!this.draftSourceNodeId}};function gt(c,t){let e=new Set,s=[...t];for(;s.length>0;){let i=s.pop();for(let[o,r]of c.entries())r.parentId===i&&!e.has(o)&&(e.add(o),s.push(o))}return Array.from(e)}var st=class{constructor(t,e,s){this.container=t;this.stateManager=e;this.options=s}isDraggingNodes=!1;draggedNodeIds=[];lastDragPos=null;startDrag(t,e,s){this.isDraggingNodes=!0,this.draggedNodeIds=t,this.lastDragPos=e,this.container.setPointerCapture(s),this.container.classList.add("sci-flow-dragging")}updateDrag(t,e){if(!this.isDraggingNodes||!this.lastDragPos)return;let s=this.stateManager.getState(),i=t.x-this.lastDragPos.x,o=t.y-this.lastDragPos.y,r=[];if(this.draggedNodeIds.length===1&&!e.altKey){let a=this.draggedNodeIds[0],n=s.nodes.get(a);if(n){let d=n.position.x+i,l=n.position.y+o,p=n.style?.width||200,f=n.style?.height||150,y=!1,v=!1,S=10/s.viewport.zoom;if(this.options.showSmartGuides){let A=d+p/2,T=l+f/2;for(let[D,h]of s.nodes.entries()){if(D===a)continue;let w=h.style?.width||200,I=h.style?.height||150,x=h.position.x+w/2,E=h.position.y+I/2;if(!y){let b=[{target:h.position.x,guide:h.position.x},{target:x,guide:x},{target:h.position.x+w,guide:h.position.x+w}];for(let m of b){if(Math.abs(d-m.target)<S){d=m.target,y=!0,r.push({x:m.guide});break}if(Math.abs(A-m.target)<S){d=m.target-p/2,y=!0,r.push({x:m.guide});break}if(Math.abs(d+p-m.target)<S){d=m.target-p,y=!0,r.push({x:m.guide});break}}}if(!v){let b=[{target:h.position.y,guide:h.position.y},{target:E,guide:E},{target:h.position.y+I,guide:h.position.y+I}];for(let m of b){if(Math.abs(l-m.target)<S){l=m.target,v=!0,r.push({y:m.guide});break}if(Math.abs(T-m.target)<S){l=m.target-f/2,v=!0,r.push({y:m.guide});break}if(Math.abs(l+f-m.target)<S){l=m.target-f,v=!0,r.push({y:m.guide});break}}}}}this.options.snapToGrid&&!y&&(d=Math.round(d/this.options.gridSize)*this.options.gridSize),this.options.snapToGrid&&!v&&(l=Math.round(l/this.options.gridSize)*this.options.gridSize),i=d-n.position.x,o=l-n.position.y}}else this.options.snapToGrid&&!e.altKey&&(i=Math.round(i/this.options.gridSize)*this.options.gridSize,o=Math.round(o/this.options.gridSize)*this.options.gridSize);this.stateManager.setSmartGuides(r.length>0?r:void 0),(i!==0||o!==0)&&(new Set([...this.draggedNodeIds,...gt(s.nodes,this.draggedNodeIds)]).forEach(n=>{let d=s.nodes.get(n);d&&this.stateManager.updateNodePosition(n,d.position.x+i,d.position.y+o,!0)}),this.lastDragPos={x:this.lastDragPos.x+i,y:this.lastDragPos.y+o})}endDrag(t){this.isDraggingNodes&&(this.isDraggingNodes=!1,this.container.classList.remove("sci-flow-dragging"),this.lastDragPos&&(this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot()),this.lastDragPos=null,this.stateManager.clearSmartGuides(),this.container.hasPointerCapture(t)&&this.container.releasePointerCapture(t))}isDragging(){return this.isDraggingNodes}};var it=class{constructor(t){this.stateManager=t}handleKeyDown(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState();if((t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="a"){t.preventDefault(),this.stateManager.setSelection(Array.from(e.nodes.keys()),[]);return}if(t.key==="Delete"||t.key==="Backspace"){t.preventDefault();let a=Array.from(e.nodes.values()).filter(d=>d.selected).map(d=>d.id),n=Array.from(e.edges.values()).filter(d=>d.selected).map(d=>d.id);a.forEach(d=>this.stateManager.removeNode(d)),n.forEach(d=>this.stateManager.removeEdge(d));return}let s=navigator.platform.toUpperCase().indexOf("MAC")>=0,i=s&&t.metaKey&&t.shiftKey&&t.code==="KeyZ"||!s&&t.ctrlKey&&t.code==="KeyY";if((t.metaKey||t.ctrlKey)&&t.code==="KeyZ"&&!i){t.preventDefault(),this.stateManager.undo();return}else if(i){t.preventDefault(),this.stateManager.redo();return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(t.key)){let a=Array.from(e.nodes.values()).filter(n=>n.selected);if(a.length>0){t.preventDefault();let n=t.shiftKey?10:1;a.forEach(d=>{let l=d.position.x,p=d.position.y;t.key==="ArrowUp"&&(p-=n),t.key==="ArrowDown"&&(p+=n),t.key==="ArrowLeft"&&(l-=n),t.key==="ArrowRight"&&(l+=n),this.stateManager.updateNodePosition(d.id,l,p,!0)}),this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot();return}}}handleCopy(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState(),s=Array.from(e.nodes.values()).filter(r=>r.selected),i=Array.from(e.edges.values()).filter(r=>r.selected);if(s.length===0)return;let o={version:"sci-flow-1.0",nodes:s,edges:i};t.clipboardData&&(t.clipboardData.setData("application/json",JSON.stringify(o)),t.preventDefault())}handlePaste(t){if(!(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)&&t.clipboardData)try{let e=t.clipboardData.getData("application/json");if(!e)return;let s=JSON.parse(e);if(s.version==="sci-flow-1.0"){t.preventDefault();let i=30,o=[],r=new Map;s.nodes.forEach(n=>{let d=`${n.id}-copy-${Date.now()}`;r.set(n.id,d),o.push({...n,id:d,position:{x:n.position.x+i,y:n.position.y+i},selected:!0})}),this.stateManager.setSelection([],[]),o.forEach(n=>this.stateManager.addNode(n));let a=o.map(n=>n.id);this.stateManager.setSelection(a,[]),this.stateManager.saveSnapshot()}}catch(e){console.error("Paste failed",e)}}};var ot=class{container;stateManager;panZoom;selection;connection;drag;shortcuts;isPanning=!1;lastPointerPos={x:0,y:0};isSpacePressed=!1;cleanupEvents=[];constructor({container:t,stateManager:e,snapToGrid:s=!0,gridSize:i=20,showSmartGuides:o=!0}){this.container=t,this.stateManager=e,this.panZoom=new Q(e),this.selection=new tt(t,e),this.connection=new et(t,e),this.drag=new st(t,e,{snapToGrid:s,gridSize:i,showSmartGuides:o}),this.shortcuts=new it(e),this.bindEvents()}bindEvents(){this.container.style.touchAction="none";let t=n=>this.panZoom.handleWheel(n),e=this.handlePointerDown.bind(this),s=this.handlePointerMove.bind(this),i=this.handlePointerUp.bind(this),o=n=>{n.code==="Space"&&(this.isSpacePressed=!0,this.container.style.cursor="grab"),this.shortcuts.handleKeyDown(n)},r=n=>{n.code==="Space"&&(this.isSpacePressed=!1,this.container.style.cursor="default")},a=n=>n.preventDefault();this.container.addEventListener("wheel",t,{passive:!1}),this.container.addEventListener("pointerdown",e),this.container.addEventListener("contextmenu",a),window.addEventListener("pointermove",s),window.addEventListener("pointerup",i),window.addEventListener("keydown",o),window.addEventListener("keyup",r),window.addEventListener("copy",n=>this.shortcuts.handleCopy(n)),window.addEventListener("paste",n=>this.shortcuts.handlePaste(n)),this.cleanupEvents=[()=>this.container.removeEventListener("wheel",t),()=>this.container.removeEventListener("pointerdown",e),()=>this.container.removeEventListener("contextmenu",a),()=>window.removeEventListener("pointermove",s),()=>window.removeEventListener("pointerup",i),()=>window.removeEventListener("keydown",o),()=>window.removeEventListener("keyup",r)]}handlePointerDown(t){let e=t.target,s=e.closest(".sci-flow-port");if(s?.dataset.nodeid&&s?.dataset.portid){this.connection.startDraft(s.dataset.nodeid,s.dataset.portid,t.pointerId);return}let i=this.stateManager.getState(),o=this.container.getBoundingClientRect(),r=this.screenToFlow({x:t.clientX,y:t.clientY},i.viewport,o),a=this.findNodeAt(r);if(a){let d=i.nodes.get(a),l=d?.selected?Array.from(i.nodes.values()).filter(p=>p.selected).map(p=>p.id):[a];!d?.selected&&!t.shiftKey?this.stateManager.setSelection([a],[]):t.shiftKey&&this.stateManager.appendSelection(a),this.drag.startDrag(l,r,t.pointerId);return}let n=e.closest(".sci-flow-edge-bg, .sci-flow-edge-fg");if(n&&n.parentElement&&n.parentElement.id.startsWith("edge-group-")){let d=n.parentElement.id.replace("edge-group-","");t.shiftKey?this.stateManager.appendSelection(void 0,d):this.stateManager.setSelection([],[d]);return}if(t.button===1||t.button===2||t.button===0&&this.isSpacePressed){this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing";return}t.button===0&&!this.isSpacePressed&&(t.shiftKey?this.selection.startSelection({x:t.clientX,y:t.clientY}):(this.stateManager.setSelection([],[]),this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing"))}handlePointerMove(t){let e=this.stateManager.getState(),s=this.container.getBoundingClientRect(),i=this.screenToFlow({x:t.clientX,y:t.clientY},e.viewport,s);this.connection.isDrafting()?this.connection.updateDraft(i):this.drag.isDragging()?this.drag.updateDrag(i,t):this.isPanning?this.lastPointerPos=this.panZoom.handlePan(t,this.lastPointerPos):this.selection.updateSelection({x:t.clientX,y:t.clientY},e.viewport)}handlePointerUp(t){this.connection.endDraft(t),this.drag.endDrag(t.pointerId),this.selection.endSelection(),this.isPanning=!1,this.container.style.cursor=this.isSpacePressed?"grab":"default",this.container.hasPointerCapture(t.pointerId)&&this.container.releasePointerCapture(t.pointerId)}findNodeAt(t){let e=this.stateManager.getState(),s=Array.from(e.nodes.values()).reverse();for(let i of s){let o=i.style?.width||200,r=i.style?.height||150;if(t.x>=i.position.x&&t.x<=i.position.x+o&&t.y>=i.position.y&&t.y<=i.position.y+r)return i.id}return null}screenToFlow(t,e,s){return{x:(t.x-s.left-e.x)/e.zoom,y:(t.y-s.top-e.y)/e.zoom}}destroy(){this.cleanupEvents.forEach(t=>t())}};var nt=class{constructor(t,e){this.container=t;this.stateManagerId=e;this.styleInjector=document.createElement("style"),this.styleInjector.id="sci-flow-theme-injector",this.container.appendChild(this.styleInjector)}currentTheme=F;styleInjector;setTheme(t){let e=F;t==="dark"?e=Y:t==="system"?e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?Y:F:typeof t=="object"&&(e=t.name==="dark"?Y:F),this.currentTheme=typeof t=="object"?{name:t.name||e.name,colors:{...e.colors,...t.colors||{}}}:e,this.applyThemeVariables()}applyThemeVariables(){if(!this.styleInjector)return;let t=this.currentTheme.colors,e=`
          .sci-flow-container-${this.stateManagerId} {
              --sf-bg: ${t.background};
              --sf-grid-dot: ${t.gridDot};
              --sf-node-bg: ${t.nodeBackground};
              --sf-node-border: ${t.nodeBorder};
              --sf-node-text: ${t.nodeText};
              --sf-edge-line: ${t.edgeLine};
              --sf-edge-active: ${t.edgeActive};
              --sf-edge-animated: ${t.edgeAnimated};
              --sf-port-bg: ${t.portBackground};
              --sf-port-border: ${t.portBorder};
              --sf-context-bg: ${t.contextMenuBackground};
              --sf-context-text: ${t.contextMenuText};
              --sf-context-hover: ${t.contextMenuHover};
              --sf-selection-bg: ${t.selectionBoxBackground};
              --sf-selection-border: ${t.selectionBoxBorder};
          }
          
          .sci-flow-container-${this.stateManagerId} .sci-flow-edge-bg:hover + .sci-flow-edge-fg {
              stroke: var(--sf-edge-active) !important;
              stroke-width: 3px !important;
          }
          
          .sci-flow-container-${this.stateManagerId} .sci-flow-edge-bg:hover ~ circle {
              stroke: var(--sf-edge-active) !important;
              stroke-width: 3px !important;
              transform: scale(1.5);
              transform-origin: center;
              transform-box: fill-box;
          }

          .sci-flow-container-${this.stateManagerId} .sci-flow-node:hover > foreignObject > div {
              box-shadow: 0 0 15px var(--sf-edge-active) !important;
              transition: box-shadow 0.2s ease;
          }

          .sci-flow-container-${this.stateManagerId}.sci-flow-dragging * {
              user-select: none !important;
              -webkit-user-select: none !important;
          }
        `;this.styleInjector.innerHTML=e,this.container.classList.add(`sci-flow-container-${this.stateManagerId}`)}destroy(){this.styleInjector.remove()}};var q=class{container;stateManager;interactionManager;renderer;gridRenderer;options;unsubscribe;themeManager;constructor(t){this.options={renderer:"auto",autoSwitchThreshold:1e3,theme:"light",...t},this.container=this.options.container,getComputedStyle(this.container).position==="static"&&(this.container.style.position="relative"),this.stateManager=new V,this.themeManager=new nt(this.container,this.stateManager.id),this.themeManager.setTheme(this.options.theme),this.interactionManager=new ot({container:this.container,stateManager:this.stateManager,minZoom:this.options.minZoom,maxZoom:this.options.maxZoom}),this.gridRenderer=new _({container:this.container});let e=this.options.renderer==="auto"?"svg":this.options.renderer||"svg";this.renderer=this.createRenderer(e),this.renderer.stateManager=this.stateManager,this.options.nodeTypes&&Array.isArray(this.options.nodeTypes)&&this.options.nodeTypes.forEach(s=>{let i=new Set,o=s;typeof o.nodeType=="string"&&i.add(o.nodeType),typeof o.type=="string"&&i.add(o.type),typeof o.name=="string"&&(i.add(o.name),i.add(o.name.toLowerCase().replace("node",""))),i.forEach(r=>{r&&this.stateManager.registerNodeType({type:r})})}),this.unsubscribe=this.stateManager.subscribe(s=>{this.gridRenderer.render(s),this.renderer.render(s,this.stateManager.getNodeRegistry()),this.checkRendererThreshold(s.nodes.size)})}createRenderer(t){return t==="svg"?new j({container:this.container}):new X({container:this.container})}checkRendererThreshold(t){if(this.options.renderer==="auto"){let e=this.options.autoSwitchThreshold||1e3,s=this.renderer instanceof X;t>e&&!s?this.switchRenderer("canvas"):t<=e&&s&&this.switchRenderer("svg")}}switchRenderer(t){this.renderer.destroy(),this.renderer=this.createRenderer(t),this.renderer.render(this.stateManager.getState(),this.stateManager.getNodeRegistry())}setTheme(t){this.themeManager.setTheme(t)}setNodes(t){this.stateManager.setNodes(t)}setEdges(t){this.stateManager.setEdges(t)}addNode(t){this.stateManager.addNode(t)}removeNode(t){this.stateManager.removeNode(t)}addEdge(t){this.stateManager.addEdge(t)}removeEdge(t){this.stateManager.removeEdge(t)}getState(){return this.stateManager.getState()}forceUpdate(){this.stateManager.forceUpdate()}setDefaultEdgeType(t){this.stateManager.setDefaultEdgeType(t)}setDefaultEdgeStyle(t){this.stateManager.setDefaultEdgeStyle(t)}subscribe(t){return this.stateManager.subscribe(t)}updateNodePosition(t,e,s){this.stateManager.updateNodePosition(t,e,s)}fitView(t=50){let e=this.stateManager.getState();if(e.nodes.size===0)return;let s=1/0,i=1/0,o=-1/0,r=-1/0;e.nodes.forEach(h=>{let w=h.style?.width||200,I=h.style?.height||150;h.position.x<s&&(s=h.position.x),h.position.y<i&&(i=h.position.y),h.position.x+w>o&&(o=h.position.x+w),h.position.y+I>r&&(r=h.position.y+I)});let a=o-s,n=r-i;if(a<=0||n<=0)return;let d=this.container.getBoundingClientRect(),l=d.width-t*2,p=d.height-t*2,f=l/a,y=p/n,v=Math.min(Math.max(Math.min(f,y),.1),2),S=s+a/2,A=i+n/2,T=d.width/2-S*v,D=d.height/2-A*v;this.stateManager.setViewport({x:T,y:D,zoom:v})}centerNode(t){let e=this.stateManager.getState(),s=e.nodes.get(t);if(!s)return;let i=s.style?.width||200,o=s.style?.height||150,r=s.position.x+i/2,a=s.position.y+o/2,n=this.container.getBoundingClientRect(),d=e.viewport.zoom,l=n.width/2-r*d,p=n.height/2-a*d;this.stateManager.setViewport({x:l,y:p,zoom:d})}toJSON(){return this.stateManager.toJSON()}fromJSON(t){this.stateManager.fromJSON(t)}destroy(){this.unsubscribe(),this.interactionManager.destroy(),this.themeManager.destroy(),this.gridRenderer.destroy(),this.renderer.destroy()}};var at=class{canvas;ctx;stateManager;options;isDragging=!1;unsubscribe;constructor(t){this.stateManager=t.stateManager,this.options={container:t.container,stateManager:t.stateManager,width:t.width||150,height:t.height||100,nodeColor:t.nodeColor||"#rgba(100, 100, 100, 0.5)",viewportColor:t.viewportColor||"rgba(0, 123, 255, 0.4)",backgroundColor:t.backgroundColor||"#111"},this.canvas=document.createElement("canvas"),this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.canvas.style.backgroundColor=this.options.backgroundColor,this.canvas.style.border="1px solid #333",this.canvas.style.borderRadius="4px",this.canvas.style.cursor="crosshair",this.options.container.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.unsubscribe=this.stateManager.subscribe(()=>this.render()),this.bindEvents(),this.render()}bindEvents(){this.canvas.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp)}unbindEvents(){this.canvas.removeEventListener("pointerdown",this.onPointerDown),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp)}onPointerDown=t=>{this.isDragging=!0,this.canvas.setPointerCapture(t.pointerId),this.panToEvent(t)};onPointerMove=t=>{this.isDragging&&this.panToEvent(t)};onPointerUp=t=>{this.isDragging=!1,this.canvas.hasPointerCapture(t.pointerId)&&this.canvas.releasePointerCapture(t.pointerId)};panToEvent(t){let e=this.stateManager.getState(),s=this.canvas.getBoundingClientRect(),i=(t.clientX-s.left)/s.width,o=(t.clientY-s.top)/s.height;i=Math.max(0,Math.min(1,i)),o=Math.max(0,Math.min(1,o));let r=this.getWorldBounds(e),a=r.minX+i*r.width,n=r.minY+o*r.height,d=window.innerWidth,l=window.innerHeight,p=-a*e.viewport.zoom+d/2,f=-n*e.viewport.zoom+l/2;this.stateManager.setViewport({x:p,y:f,zoom:e.viewport.zoom})}getWorldBounds(t){if(t.nodes.size===0)return{minX:0,minY:0,maxX:1e3,maxY:1e3,width:1e3,height:1e3};let e=1/0,s=1/0,i=-1/0,o=-1/0;return t.nodes.forEach(r=>{let a=r.style?.width||200,n=r.style?.height||150;e=Math.min(e,r.position.x),s=Math.min(s,r.position.y),i=Math.max(i,r.position.x+a),o=Math.max(o,r.position.y+n)}),e-=500,s-=500,i+=500,o+=500,{minX:e,minY:s,maxX:i,maxY:o,width:i-e,height:o-s}}render(){if(!this.ctx)return;let t=this.stateManager.getState();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let e=this.getWorldBounds(t);if(e.width===0||e.height===0)return;let s=this.canvas.width/e.width,i=this.canvas.height/e.height,o=Math.min(s,i),r=(this.canvas.width-e.width*o)/2,a=(this.canvas.height-e.height*o)/2;this.ctx.save(),this.ctx.translate(r,a),this.ctx.scale(o,o),this.ctx.translate(-e.minX,-e.minY),this.ctx.fillStyle=this.options.nodeColor,t.nodes.forEach(v=>{let S=v.style?.width||200,A=v.style?.height||150;this.ctx.beginPath(),this.ctx.roundRect(v.position.x,v.position.y,S,A,10),this.ctx.fill()});let n=window.innerWidth,d=window.innerHeight,l=-t.viewport.x/t.viewport.zoom,p=-t.viewport.y/t.viewport.zoom,f=(n-t.viewport.x)/t.viewport.zoom,y=(d-t.viewport.y)/t.viewport.zoom;this.ctx.strokeStyle=this.options.viewportColor,this.ctx.lineWidth=2/o,this.ctx.fillStyle=this.options.viewportColor,this.ctx.beginPath(),this.ctx.rect(l,p,f-l,y-p),this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()}destroy(){this.unbindEvents(),this.unsubscribe(),this.canvas.remove()}};var Et=c=>new q(c);0&&(module.exports={BaseRenderer,CanvasRenderer,Minimap,SVGRenderer,SciFlow,StateManager,darkTheme,lightTheme,mount});
//# sourceMappingURL=index.cjs.map
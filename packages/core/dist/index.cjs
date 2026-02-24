"use strict";var nt=Object.defineProperty;var yt=Object.getOwnPropertyDescriptor;var mt=Object.getOwnPropertyNames;var vt=Object.prototype.hasOwnProperty;var xt=(l,t)=>{for(var e in t)nt(l,e,{get:t[e],enumerable:!0})},wt=(l,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of mt(t))!vt.call(l,i)&&i!==e&&nt(l,i,{get:()=>t[i],enumerable:!(s=yt(t,i))||s.enumerable});return l};var bt=l=>wt(nt({},"__esModule",{value:!0}),l);var Et={};xt(Et,{BaseRenderer:()=>H,CanvasRenderer:()=>X,Minimap:()=>at,SVGRenderer:()=>j,SciFlow:()=>rt,StateManager:()=>V,darkTheme:()=>Y,lightTheme:()=>O});module.exports=bt(Et);var O={name:"light",colors:{background:"#f8f9fa",gridDot:"#d7d9dd",nodeBackground:"#ffffff",nodeBorder:"#e2e8f0",nodeText:"#1e293b",edgeLine:"#94a3b8",edgeActive:"#3b82f6",edgeAnimated:"#3b82f6",portBackground:"#e2e8f0",portBorder:"#94a3b8",contextMenuBackground:"#ffffff",contextMenuText:"#1e293b",contextMenuHover:"#f1f5f9",selectionBoxBackground:"rgba(59, 130, 246, 0.1)",selectionBoxBorder:"rgba(59, 130, 246, 0.5)"}},Y={name:"dark",colors:{background:"#0f172a",gridDot:"#334155",nodeBackground:"#1e293b",nodeBorder:"#334155",nodeText:"#f8fafc",edgeLine:"#475569",edgeActive:"#60a5fa",edgeAnimated:"#60a5fa",portBackground:"#1e293b",portBorder:"#64748b",contextMenuBackground:"#1e293b",contextMenuText:"#f1f5f9",contextMenuHover:"#334155",selectionBoxBackground:"rgba(96, 165, 250, 0.1)",selectionBoxBorder:"rgba(96, 165, 250, 0.5)"}};var K=class{history=[];historyIndex=-1;maxHistory=50;isRestoringHistory=!1;constructor(){}saveSnapshot(t){if(this.isRestoringHistory)return;let e=JSON.stringify({nodes:Array.from(t.nodes.entries()),edges:Array.from(t.edges.entries())});this.historyIndex<this.history.length-1&&(this.history=this.history.slice(0,this.historyIndex+1)),!(this.history.length>0&&this.history[this.historyIndex]===e)&&(this.history.push(e),this.history.length>this.maxHistory?this.history.shift():this.historyIndex++)}undo(t){this.historyIndex>0&&(this.historyIndex--,this.performRestore(this.history[this.historyIndex],t))}redo(t){this.historyIndex<this.history.length-1&&(this.historyIndex++,this.performRestore(this.history[this.historyIndex],t))}performRestore(t,e){this.isRestoringHistory=!0,e(t),this.isRestoringHistory=!1}};var q=class{registry=new Map;register(t){this.registry.set(t.type,t)}get(t){return this.registry.get(t)}getAllTypes(){return Array.from(this.registry.keys())}getFullRegistry(){return this.registry}};var V=class{state;listeners=new Set;id;history=new K;registry=new q;onNodesChange;onEdgesChange;onConnect;onNodeMount;onNodeUnmount;constructor(t){this.id=Math.random().toString(36).substring(2,9),this.state={nodes:new Map,edges:new Map,viewport:{x:0,y:0,zoom:1},defaultEdgeType:"bezier",defaultEdgeStyle:{lineStyle:"solid"},...t}}registerNodeType(t){this.registry.register(t)}getNodeDefinition(t){return this.registry.get(t)}getRegisteredNodeTypes(){return this.registry.getAllTypes()}getNodeRegistry(){return this.registry.getFullRegistry()}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){this.listeners.forEach(t=>t(this.state))}forceUpdate(){this.notify()}setNodes(t){this.state.nodes.clear(),t.forEach(e=>this.state.nodes.set(e.id,e)),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values()))}setEdges(t){this.state.edges.clear(),t.forEach(e=>this.state.edges.set(e.id,e)),this.notify(),this.onEdgesChange?.(Array.from(this.state.edges.values()))}setSelection(t,e){this.state.nodes.forEach(s=>s.selected=t.includes(s.id)),this.state.edges.forEach(s=>s.selected=e.includes(s.id)),this.notify()}addNode(t){this.state.nodes.set(t.id,t),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values()))}setDraftEdge(t,e,s){this.state.draftEdge={sourceNodeId:t,sourcePortId:e,targetPosition:s},this.notify()}clearDraftEdge(){this.state.draftEdge=void 0,this.notify()}removeNode(t){let e=this.getDescendantsLocal([t]),s=new Set([t,...e]);for(let i of s){this.state.nodes.delete(i);for(let[o,r]of this.state.edges.entries())(r.source===i||r.target===i)&&this.state.edges.delete(o)}this.notify(),this.saveSnapshot(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}getDescendantsLocal(t){let e=new Set,s=[...t];for(;s.length>0;){let i=s.pop();for(let[o,r]of this.state.nodes.entries())r.parentId===i&&!e.has(o)&&(e.add(o),s.push(o))}return Array.from(e)}updateNodePosition(t,e,s,i=!1){let o=this.state.nodes.get(t);o&&(o.position={x:e,y:s},this.notify(),i||this.onNodesChange?.(Array.from(this.state.nodes.values())))}addEdge(t){this.state.edges.set(t.id,t),this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.onConnect?.({source:t.source,sourceHandle:t.sourceHandle,target:t.target,targetHandle:t.targetHandle})}removeEdge(t){this.state.edges.delete(t)&&(this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values())))}saveSnapshot(){this.history.saveSnapshot(this.state)}undo(){this.history.undo(t=>this.restoreSnapshot(t))}redo(){this.history.redo(t=>this.restoreSnapshot(t))}restoreSnapshot(t){let e=JSON.parse(t);this.state.nodes=new Map(e.nodes),this.state.edges=new Map(e.edges),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}setDefaultEdgeType(t){this.state.defaultEdgeType=t,this.notify()}setDefaultEdgeStyle(t){this.state.defaultEdgeStyle={...this.state.defaultEdgeStyle,...t},this.notify()}toJSON(){return JSON.stringify({version:"sci-flow-1.0",nodes:Array.from(this.state.nodes.values()),edges:Array.from(this.state.edges.values()),viewport:this.state.viewport})}fromJSON(t){try{let e=JSON.parse(t);this.state.nodes.clear(),Array.isArray(e.nodes)&&e.nodes.forEach(s=>this.state.nodes.set(s.id,s)),this.state.edges.clear(),Array.isArray(e.edges)&&e.edges.forEach(s=>this.state.edges.set(s.id,s)),e.viewport&&(this.state.viewport=e.viewport),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.saveSnapshot()}catch(e){console.error("Failed to parse SciFlow JSON",e)}}setViewport(t){this.state.viewport=t,this.notify()}setSmartGuides(t){this.state.smartGuides=t,this.notify()}clearSmartGuides(){this.state.smartGuides=void 0,this.notify()}commitNodePositions(){this.onNodesChange?.(Array.from(this.state.nodes.values()))}};var H=class{container;constructor(t){this.container=t.container}};function dt(l,t,e,s=20){let i=new Set,o=new Set,r=l.x,d=l.y,n=t.x,a=t.y;i.add(r),i.add(n),o.add(d),o.add(a),i.add(r+(n-r)/2),o.add(d+(a-d)/2),i.add(r+s),i.add(r-s),o.add(d+s),o.add(d-s),i.add(n+s),i.add(n-s),o.add(a+s),o.add(a-s);for(let g of e)i.add(g.x),i.add(g.x+g.width),i.add(g.x-s),i.add(g.x+g.width+s),o.add(g.y),o.add(g.y+g.height),o.add(g.y-s),o.add(g.y+g.height+s);let c=Array.from(i).sort((g,P)=>g-P),h=Array.from(o).sort((g,P)=>g-P),y=(g,P)=>{for(let M of e){let E=M.x-1,G=M.x+M.width+1,D=M.y-1,f=M.y+M.height+1;if(g.x===P.x){if(g.x>E&&g.x<G){let N=Math.min(g.y,P.y),L=Math.max(g.y,P.y);if(N<f&&L>D)return!0}}else if(g.y>D&&g.y<f){let N=Math.min(g.x,P.x),L=Math.max(g.x,P.x);if(N<G&&L>E)return!0}}return!1},m=(g,P)=>P*c.length+g,v=g=>({xi:g%c.length,yi:Math.floor(g/c.length)}),x=h.indexOf(d),I=h.indexOf(a),T=c.indexOf(r),A=c.indexOf(n),p=(g,P)=>{let M=g.x+(P.x-g.x)/2;return`M ${g.x},${g.y} L ${M},${g.y} L ${M},${P.y} L ${P.x},${P.y}`};if(T===-1||x===-1||A===-1||I===-1)return p(l,t);let w=m(T,x),k=m(A,I),b=new Set([w]),C=new Set,S=new Map,u=new Map,R=new Map;for(S.set(w,0),u.set(w,Math.abs(t.x-l.x)+Math.abs(t.y-l.y));b.size>0;){let g=-1,P=1/0;for(let f of b){let N=u.get(f)??1/0;N<P&&(P=N,g=f)}if(g===k){let f=[],N=g;for(;N!==w;){let{xi:$,yi:B}=v(N);f.unshift({x:c[$],y:h[B]}),N=R.get(N)}f.unshift({x:l.x,y:l.y});let L=[f[0]];for(let $=1;$<f.length-1;$++){let B=f[$-1],F=f[$+1],z=f[$];B.x===z.x&&z.x===F.x||B.y===z.y&&z.y===F.y||L.push(z)}return L.push(f[f.length-1]),`M ${L.map($=>`${$.x},${$.y}`).join(" L ")}`}b.delete(g),C.add(g);let{xi:M,yi:E}=v(g),G={x:c[M],y:h[E]},D=[];M>0&&D.push({xi:M-1,yi:E}),M<c.length-1&&D.push({xi:M+1,yi:E}),E>0&&D.push({xi:M,yi:E-1}),E<h.length-1&&D.push({xi:M,yi:E+1});for(let f of D){let N=m(f.xi,f.yi);if(C.has(N))continue;let L={x:c[f.xi],y:h[f.yi]};if(y(G,L))continue;let $=0;if(R.has(g)){let z=R.get(g),ft=v(z).yi===E,ut=f.yi===E;ft!==ut&&($+=100)}let B=Math.abs(L.x-G.x)+Math.abs(L.y-G.y),F=(S.get(g)??0)+B+$;(!b.has(N)||F<(S.get(N)??1/0))&&(R.set(N,g),S.set(N,F),u.set(N,F+Math.abs(t.x-L.x)+Math.abs(t.y-L.y)),b.add(N))}}return p(l,t)}var St=(l,t,e=.25)=>{let s=(t.x-l.x)*e;return`M ${l.x},${l.y} C ${l.x+s},${l.y} ${t.x-s},${t.y} ${t.x},${t.y}`},Mt=(l,t)=>`M ${l.x},${l.y} L ${t.x},${t.y}`,ct=(l,t,e=0)=>{let s=t.x-l.x,i=l.x+s/2;if(e<=0)return`M ${l.x},${l.y} L ${i},${l.y} L ${i},${t.y} L ${t.x},${t.y}`;let o=t.y-l.y,r=Math.min(e,Math.abs(s/2),Math.abs(o/2));if(r<=1)return`M ${l.x},${l.y} L ${i},${l.y} L ${i},${t.y} L ${t.x},${t.y}`;let d=Math.sign(s),n=Math.sign(o),a=i-r*d,c=l.y+r*n,h=i+r*d,y=t.y-r*n,m=d*n>0?1:0,v=d*n>0?0:1;return`M ${l.x},${l.y} L ${a},${l.y} A ${r},${r} 0 0 ${m} ${i},${c} L ${i},${y} A ${r},${r} 0 0 ${v} ${h},${t.y} L ${t.x},${t.y}`},W=({source:l,target:t,mode:e="bezier",curvature:s=.5,obstacles:i=[]})=>{switch(e){case"straight":return Mt(l,t);case"step":return ct(l,t,0);case"smooth-step":return ct(l,t,8);case"smart":return dt(l,t,i);default:return St(l,t,s)}};var lt=`
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
`;function ht(l,t){let e=document.getElementById(`node-${l.id}`);if(e){let I=e.querySelector(`[data-portid="${t}"]`);if(I){let T=I.getAttribute("cx"),A=I.getAttribute("cy");if(T!==null&&A!==null){let p=parseFloat(T),w=parseFloat(A);if(p!==0||w!==0||t.endsWith("0"))return{x:l.position.x+p,y:l.position.y+w}}}}let s=l.style?.width||140,i=l.style?.height||100,o=l.portConfig||"left-right",r=Object.keys(l.inputs||{}),d=Object.keys(l.outputs||{}),n=32,a=26,c="left",h=0,y=!!l.inputs[t],m=!!l.outputs[t];y?(h=r.indexOf(t),h===-1&&r.length>0&&(h=0),o==="top-bottom"||o==="top-in-bottom-out"?c="top":o==="bottom-top"||o==="bottom-in-top-out"?c="bottom":o==="right-in-left-out"?c="right":o==="left-top-in-bottom-right-out"?c="top-left":o==="bottom-right-in-left-top-out"?c="bottom-right":c="left"):m&&(h=d.indexOf(t),h===-1&&d.length>0&&(h=0),o==="top-bottom"||o==="bottom-in-top-out"?c="bottom":o==="bottom-top"||o==="top-in-bottom-out"?c="top":o==="left-in-right-out"?c="right":o==="right-in-left-out"?c="left":o==="left-top-in-bottom-right-out"?c="bottom-right":o==="bottom-right-in-left-top-out"?c="top-left":c="right");let v=Math.max(0,h),x=n+18+v*a;switch(c){case"top":return{x:l.position.x+s/2,y:l.position.y};case"bottom":return{x:l.position.x+s/2,y:l.position.y+i};case"left":return{x:l.position.x-6,y:l.position.y+x};case"right":return{x:l.position.x+s+6,y:l.position.y+x};case"top-left":return{x:l.position.x-6,y:l.position.y+x};case"bottom-right":return{x:l.position.x+s+6,y:l.position.y+x};default:return{x:l.position.x-6,y:l.position.y+x}}}var U=class{constructor(t){this.nodesGroup=t}reconcile(t,e,s,i){t.forEach(o=>{let r=document.getElementById(`node-${o.id}`);if(r){let d=r.querySelector(".sci-flow-node-wrapper"),n=i.get(o.type),a=d?.dataset.isDefaultPreview==="true";if(d&&(d.dataset.type!==o.type||a&&n)&&(this.nodesGroup.removeChild(r),r=this.createNodeElement(o,s,i),this.nodesGroup.appendChild(r),s?.onNodeMount)){let c=r.querySelector(".sci-flow-node-wrapper"),h=r.querySelector(".sci-flow-node-body");s.onNodeMount(o.id,h||c)}}else if(r=this.createNodeElement(o,s,i),this.nodesGroup.appendChild(r),s?.onNodeMount){let d=r.querySelector(".sci-flow-node-wrapper"),n=r.querySelector(".sci-flow-node-body");s.onNodeMount(o.id,n||d)}r.setAttribute("transform",`translate(${o.position.x}, ${o.position.y})`),o.selected?r.classList.add("sci-flow-node-selected"):r.classList.remove("sci-flow-node-selected"),e.delete(`node-${o.id}`)})}createNodeElement(t,e,s){let i=document.createElementNS("http://www.w3.org/2000/svg","g");i.id=`node-${t.id}`,i.setAttribute("class","sci-flow-node");let o=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),r=t.style?.width||140,d=t.style?.height||100;o.setAttribute("width",r.toString()),o.setAttribute("height",d.toString()),o.style.overflow="visible";let n=document.createElement("div");n.className="sci-flow-node-wrapper",n.dataset.type=t.type;let a=s.get(t.type);n.dataset.isDefaultPreview=a?"false":"true";let c=Object.keys(t.inputs||{}),h=Object.keys(t.outputs||{}),y=32,m=26;n.innerHTML=`
            <div class="sci-flow-node-header">
                <strong>${a&&t.data?.title||t.type}</strong>
                <span class="sci-flow-node-id">${t.id.slice(0,4)}</span>
            </div>
            <div class="sci-flow-node-main">
                <div class="sci-flow-node-body"></div>
                <div class="sci-flow-node-ports-area"></div>
                <div class="sci-flow-node-actions"></div>
            </div>
        `;let v=n.querySelector(".sci-flow-node-body"),x=n.querySelector(".sci-flow-node-ports-area");a?.renderHTML?v.appendChild(a.renderHTML(t)):a||(v.innerHTML='<div class="sci-flow-node-fallback">Default Node Content</div>');let I=Math.max(c.length,h.length);I>0?(x.style.height=`${I*26}px`,x.style.minHeight="20px"):x.style.display="none",o.appendChild(n),i.appendChild(o);let T=(b,C,S)=>{let u=document.createElementNS("http://www.w3.org/2000/svg","circle");return u.setAttribute("class","sci-flow-port"),u.setAttribute("r","5"),u.dataset.nodeid=t.id,u.dataset.portid=b,u.dataset.portType=C,u.dataset.dataType=S,i.appendChild(u),u},A=c.map((b,C)=>{let S=T(b,"in",t.inputs[b]?.dataType||"any"),u=y+18+C*m;return S.setAttribute("cy",u.toString()),S.setAttribute("cx","-6"),S}),p=h.map((b,C)=>{let S=T(b,"out",t.outputs[b]?.dataType||"any"),u=y+18+C*m;return S.setAttribute("cy",u.toString()),S.setAttribute("cx",String(r+6)),S}),w;return new ResizeObserver(()=>{w&&cancelAnimationFrame(w),w=requestAnimationFrame(()=>{let b=n.offsetWidth,C=n.offsetHeight;if(b===0||C===0)return;o.setAttribute("width",b.toString()),o.setAttribute("height",C.toString());let S=n.querySelector(".sci-flow-node-ports-area"),u=S?S.offsetTop:y,R=e?.getState().nodes.get(t.id),g=R&&(Math.abs((R.style?.width||0)-b)>1||Math.abs((R.style?.height||0)-C)>1);g&&(R.style={...R.style,width:b,height:C}),(!n.dataset.layoutSettled||g)&&(n.dataset.layoutSettled="true",e?.forceUpdate()),A.forEach((M,E)=>{let G=u+13+E*m;M.setAttribute("cy",G.toString()),M.setAttribute("cx","-6");let D=`label-in-${t.id}-${c[E]}`,f=document.getElementById(D);f||(f=document.createElementNS("http://www.w3.org/2000/svg","text"),f.id=D,f.setAttribute("class","sci-flow-port-label"),f.setAttribute("x","12"),f.style.pointerEvents="none",i.appendChild(f)),f&&(f.setAttribute("y",(G+4).toString()),f.textContent=t.inputs[c[E]]?.label||c[E])}),p.forEach((M,E)=>{let G=u+13+E*m;M.setAttribute("cy",G.toString()),M.setAttribute("cx",String(b+6));let D=`label-out-${t.id}-${h[E]}`,f=document.getElementById(D);f||(f=document.createElementNS("http://www.w3.org/2000/svg","text"),f.id=D,f.setAttribute("class","sci-flow-port-label"),f.setAttribute("text-anchor","end"),f.style.pointerEvents="none",i.appendChild(f)),f&&(f.setAttribute("x",(b-12).toString()),f.setAttribute("y",(G+4).toString()),f.textContent=t.outputs[h[E]]?.label||h[E])})})}).observe(n),i}};var Z=class{constructor(t,e,s,i,o,r,d){this.edgesGroup=t;this.routerWorker=e;this.routeCache=s;this.routingHashCache=i;this.pendingRoutes=o;this.routerIdCounter=r;this.getPortAnchorFn=d}reconcile(t,e,s){t.edges.forEach(i=>{let o=t.nodes.get(i.source),r=t.nodes.get(i.target);if(!o||!r)return;let d=this.getPortAnchorFn(o,i.sourceHandle),n=this.getPortAnchorFn(r,i.targetHandle),a=i.type||"bezier",c=document.getElementById(`edge-group-${i.id}`);c||(c=this.createEdgeElement(i),this.edgesGroup.appendChild(c));let h=s.filter(y=>y.id!==i.source&&y.id!==i.target);this.updateEdgeVisuals(c,i,d,n,a,h),e.delete(`edge-group-${i.id}`)})}createEdgeElement(t){let e=document.createElementNS("http://www.w3.org/2000/svg","g");e.id=`edge-group-${t.id}`,e.setAttribute("class","sci-flow-edge-group");let s=document.createElementNS("http://www.w3.org/2000/svg","path");s.setAttribute("class","sci-flow-edge-bg"),s.setAttribute("fill","none"),s.style.stroke="transparent",s.style.strokeWidth="20px",s.style.cursor="pointer",s.style.pointerEvents="stroke";let i=document.createElementNS("http://www.w3.org/2000/svg","path");i.id=`edge-path-${t.id}`,i.setAttribute("class","sci-flow-edge-fg"),i.setAttribute("fill","none"),i.style.pointerEvents="none";let o=document.createElementNS("http://www.w3.org/2000/svg","path");o.setAttribute("class","sci-flow-edge-overlay"),o.setAttribute("fill","none"),o.style.pointerEvents="none",o.style.display="none";let r=document.createElementNS("http://www.w3.org/2000/svg","text");r.setAttribute("class","sci-flow-edge-symbols"),r.style.display="none",r.style.pointerEvents="none";let d=document.createElementNS("http://www.w3.org/2000/svg","textPath");d.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",`#edge-path-${t.id}`),d.setAttribute("startOffset","0%"),d.textContent="\xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB",r.appendChild(d);let n=document.createElementNS("http://www.w3.org/2000/svg","circle");n.setAttribute("class","sci-flow-port-source"),n.setAttribute("r","3"),n.style.pointerEvents="none";let a=document.createElementNS("http://www.w3.org/2000/svg","circle");return a.setAttribute("class","sci-flow-port-target"),a.setAttribute("r","3"),a.style.pointerEvents="none",e.appendChild(s),e.appendChild(i),e.appendChild(o),e.appendChild(r),e.appendChild(n),e.appendChild(a),e}updateEdgeVisuals(t,e,s,i,o,r){let d=t.querySelector(".sci-flow-edge-bg"),n=t.querySelector(".sci-flow-edge-fg"),a=t.querySelector(".sci-flow-edge-overlay"),c=t.querySelector(".sci-flow-edge-symbols"),h=t.querySelector(".sci-flow-port-source"),y=t.querySelector(".sci-flow-port-target");[h,y].forEach(p=>{p.style.fill="var(--sf-bg)",p.style.stroke=e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)",p.style.strokeWidth="1.5px",p.style.opacity="0.6"}),h.setAttribute("cx",`${s.x}`),h.setAttribute("cy",`${s.y}`),y.setAttribute("cx",`${i.x}`),y.setAttribute("cy",`${i.y}`);let m=e.style?.lineStyle||"solid",v=e.style?.stroke,x=e.style?.strokeWidth,I=e.style?.animationType||"dash";if(n.style.stroke=v||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),n.style.strokeWidth=x?`${x}px`:e.selected?"3px":"2px",n.classList.remove("sci-flow-edge-animated-pulse","sci-flow-edge-animated-arrows","sci-flow-edge-animated-symbols"),a.style.display="none",c&&(c.style.display="none",c.setAttribute("dominant-baseline","middle"),c.setAttribute("alignment-baseline","middle")),n.style.animation="",e.animated)if(I==="pulse")n.classList.add("sci-flow-edge-animated-pulse"),n.style.strokeDasharray="none";else if(I==="arrows")n.classList.add("sci-flow-edge-animated-arrows");else if(I==="symbols"){if(c){c.style.display="block",c.style.fill=v||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),c.style.fontSize="12px",c.style.fontWeight="bold";let p=c.querySelector("textPath");if(p){for(;p.firstChild;)p.removeChild(p.firstChild);p.textContent="\xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB";let w=document.createElementNS("http://www.w3.org/2000/svg","animate");w.setAttribute("attributeName","startOffset"),w.setAttribute("from","-20%"),w.setAttribute("to","100%"),w.setAttribute("dur","3s"),w.setAttribute("repeatCount","indefinite"),p.appendChild(w)}}n.style.strokeDasharray="none"}else n.style.strokeDasharray="5, 5",n.style.animation="sf-dash-anim 1s linear infinite";else n.style.animation="none",m==="dashed"?n.style.strokeDasharray="8, 8":m==="dotted"?n.style.strokeDasharray="2, 4":n.style.strokeDasharray="none";let T=`${s.x},${s.y}|${i.x},${i.y}|${o}|${r.length}`,A=p=>{d.setAttribute("d",p),n.setAttribute("d",p)};if(o==="smart")if(this.routeCache.has(e.id)&&this.routingHashCache.get(e.id)===T)A(this.routeCache.get(e.id));else{let p=W({source:s,target:i,mode:"step"});A(p);let w=`job-${this.routerIdCounter.value++}`;this.pendingRoutes.set(w,k=>{this.routeCache.set(e.id,k),this.routingHashCache.set(e.id,T);let b=document.getElementById(`edge-group-${e.id}`);if(b){let C=b.querySelector(".sci-flow-edge-bg"),S=b.querySelector(".sci-flow-edge-fg"),u=b.querySelector(".sci-flow-edge-overlay");C&&S&&(C.setAttribute("d",k),S.setAttribute("d",k),u&&u.setAttribute("d",k))}}),this.routerWorker.postMessage({id:w,source:s,target:i,obstacles:r,padding:20})}else{let p=W({source:s,target:i,mode:o,obstacles:r});A(p),a.setAttribute("d",p),this.routeCache.set(e.id,p),this.routingHashCache.set(e.id,T)}}};function pt(){let l=`
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
    `,t=new Blob([l],{type:"application/javascript"});return new Worker(URL.createObjectURL(t))}var j=class extends H{svg;nodesGroup;edgesGroup;styleEl;routerWorker;pendingRoutes=new Map;routerIdCounter=0;routeCache=new Map;routingHashCache=new Map;nodeManager;edgeManager;constructor(t){super(t),this.container.classList.add("sci-flow-container"),this.routerWorker=pt(),this.routerWorker.onmessage=s=>{let{id:i,path:o}=s.data;this.pendingRoutes.has(i)&&(this.pendingRoutes.get(i)(o),this.pendingRoutes.delete(i))},this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.style.width="100%",this.svg.style.height="100%",this.svg.style.display="block",this.svg.style.position="absolute",this.svg.style.top="0",this.svg.style.left="0",this.svg.style.zIndex="1",this.svg.setAttribute("class","sci-flow-svg-renderer"),this.styleEl=document.createElement("style"),this.styleEl.textContent=lt,document.head.appendChild(this.styleEl),this.edgesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.edgesGroup.setAttribute("class","sci-flow-edges"),this.edgesGroup.style.transformOrigin="0 0",this.nodesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.nodesGroup.setAttribute("class","sci-flow-nodes"),this.nodesGroup.style.transformOrigin="0 0",this.svg.appendChild(this.edgesGroup),this.svg.appendChild(this.nodesGroup),this.container.appendChild(this.svg),this.nodeManager=new U(this.nodesGroup);let e=this;this.edgeManager=new Z(this.edgesGroup,this.routerWorker,this.routeCache,this.routingHashCache,this.pendingRoutes,{get value(){return e.routerIdCounter},set value(s){e.routerIdCounter=s}},this.getPortAnchor.bind(this))}render(t,e){let s=`translate(${t.viewport.x}, ${t.viewport.y}) scale(${t.viewport.zoom})`;this.edgesGroup.setAttribute("transform",s),this.nodesGroup.setAttribute("transform",s);let i=new Set(Array.from(this.nodesGroup.children).map(d=>d.id));this.nodeManager.reconcile(t.nodes,i,this.stateManager,e),i.forEach(d=>{document.getElementById(d)?.remove();let n=this.stateManager,a=d.replace("node-","");n?.onNodeUnmount&&n.onNodeUnmount(a)});let o=Array.from(t.nodes.values()).map(d=>({id:d.id,x:d.position.x,y:d.position.y,width:d.style?.width||140,height:d.style?.height||100})),r=new Set(Array.from(this.edgesGroup.children).map(d=>d.id));this.edgeManager.reconcile(t,r,o),r.forEach(d=>{document.getElementById(d)?.remove()}),this.renderDraftEdge(t,o)}renderDraftEdge(t,e){let s=document.getElementById("sci-flow-draft-edge");if(t.draftEdge){s||(s=document.createElementNS("http://www.w3.org/2000/svg","path"),s.id="sci-flow-draft-edge",s.setAttribute("class","sci-flow-edge sci-flow-draft-edge"),s.setAttribute("fill","none"),s.setAttribute("stroke","var(--sf-edge-animated)"),s.setAttribute("stroke-width","3"),s.setAttribute("stroke-dasharray","5, 5"),s.style.pointerEvents="none",this.edgesGroup.firstChild?this.edgesGroup.insertBefore(s,this.edgesGroup.firstChild):this.edgesGroup.appendChild(s));let i=t.nodes.get(t.draftEdge.sourceNodeId);if(i){let o=this.getPortAnchor(i,t.draftEdge.sourcePortId),r=t.draftEdge.targetPosition,d=e.filter(c=>c.id!==t.draftEdge?.sourceNodeId),n=t.defaultEdgeType||"bezier",a=W({source:o,target:r,mode:n,obstacles:d});s.setAttribute("d",a)}}else s&&s.remove()}getPortAnchor(t,e){return ht(t,e)}getViewportElement(){return this.svg}destroy(){this.svg.remove(),this.styleEl.remove(),this.routerWorker.terminate()}};var X=class extends H{canvas;ctx;animationFrameId=null;state=null;registry=new Map;constructor(t){super(t),this.canvas=document.createElement("canvas"),this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.display="block",this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.zIndex="1",this.canvas.classList.add("sci-flow-canvas-renderer"),this.ctx=this.canvas.getContext("2d"),this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e),this.state&&this.render(this.state,this.registry)};render(t,e){this.state=t,this.registry=e,this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.animationFrameId=requestAnimationFrame(()=>this.draw(t,e))}draw(t,e){if(!this.ctx)return;let s=this.canvas.getBoundingClientRect();if(this.ctx.clearRect(0,0,s.width,s.height),this.ctx.save(),this.ctx.translate(t.viewport.x,t.viewport.y),this.ctx.scale(t.viewport.zoom,t.viewport.zoom),t.smartGuides&&t.smartGuides.length>0){this.ctx.strokeStyle="#e20f86",this.ctx.lineWidth=1/t.viewport.zoom,this.ctx.setLineDash([4/t.viewport.zoom,4/t.viewport.zoom]);for(let i of t.smartGuides)this.ctx.beginPath(),i.x!==void 0&&(this.ctx.moveTo(i.x,-1e5),this.ctx.lineTo(i.x,1e5)),i.y!==void 0&&(this.ctx.moveTo(-1e5,i.y),this.ctx.lineTo(1e5,i.y)),this.ctx.stroke()}this.ctx.restore()}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.canvas.remove()}};var J=class extends H{canvas;ctx;options;constructor(t){super(t),this.options={gridSize:t.gridSize||20,gridColor:t.gridColor||"rgba(100, 100, 100, 0.2)"},this.canvas=document.createElement("canvas"),this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.pointerEvents="none",this.canvas.style.zIndex="0",this.canvas.classList.add("sci-flow-grid"),this.ctx=this.canvas.getContext("2d"),this.container.firstChild?this.container.insertBefore(this.canvas,this.container.firstChild):this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e)};render(t){if(!this.ctx)return;let{x:e,y:s,zoom:i}=t.viewport,o=this.canvas.getBoundingClientRect();this.ctx.clearRect(0,0,o.width,o.height);let r=1;for(;this.options.gridSize*i*r<15;)r*=2;let d=this.options.gridSize*i*r,n=getComputedStyle(this.container).getPropertyValue("--sf-grid-dot").trim()||"#555";this.ctx.fillStyle=n;let a=1.5,c=e%d,h=s%d;for(let y=c;y<o.width;y+=d)for(let m=h;m<o.height;m+=d)this.ctx.fillRect(y,m,a,a)}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.canvas.remove()}};var _=class{constructor(t){this.stateManager=t}handleWheel(t){t.preventDefault();let e=this.stateManager.getState(),{x:s,y:i,zoom:o}=e.viewport,d=-t.deltaY*.001,n=Math.min(Math.max(o+d,.1),5),a=t.currentTarget.getBoundingClientRect(),c=t.clientX-a.left,h=t.clientY-a.top,y=(c-s)/o,m=(h-i)/o,v=c-y*n,x=h-m*n;this.stateManager.setViewport({x:v,y:x,zoom:n})}handlePan(t,e){let s=t.clientX-e.x,i=t.clientY-e.y,o=this.stateManager.getState();return this.stateManager.setViewport({...o.viewport,x:o.viewport.x+s,y:o.viewport.y+i}),{x:t.clientX,y:t.clientY}}};var Q=class{constructor(t,e){this.container=t;this.stateManager=e}selectionBoxEl=null;selectionStart=null;startSelection(t){this.selectionStart=t,this.selectionBoxEl=document.createElement("div"),this.selectionBoxEl.style.position="absolute",this.selectionBoxEl.style.border="1px solid var(--sf-edge-active, #00f2ff)",this.selectionBoxEl.style.backgroundColor="rgba(0, 242, 255, 0.1)",this.selectionBoxEl.style.pointerEvents="none",this.selectionBoxEl.style.zIndex="1000",this.container.appendChild(this.selectionBoxEl)}updateSelection(t,e){if(!this.selectionStart||!this.selectionBoxEl)return;let s=Math.min(this.selectionStart.x,t.x),i=Math.min(this.selectionStart.y,t.y),o=Math.abs(this.selectionStart.x-t.x),r=Math.abs(this.selectionStart.y-t.y);this.selectionBoxEl.style.left=`${s}px`,this.selectionBoxEl.style.top=`${i}px`,this.selectionBoxEl.style.width=`${o}px`,this.selectionBoxEl.style.height=`${r}px`;let d=this.container.getBoundingClientRect(),n=this.screenToFlow(this.selectionStart,e,d),a=this.screenToFlow(t,e,d),c=Math.min(n.x,a.x),h=Math.min(n.y,a.y),y=Math.max(n.x,a.x),m=Math.max(n.y,a.y);this.performSelection(c,h,y,m)}endSelection(){this.selectionBoxEl&&(this.selectionBoxEl.remove(),this.selectionBoxEl=null),this.selectionStart=null}performSelection(t,e,s,i){let o=this.stateManager.getState(),r=[],d=[];o.nodes.forEach(n=>{let a=n.style?.width||200,c=n.style?.height||150;n.position.x>=t&&n.position.x+a<=s&&n.position.y>=e&&n.position.y+c<=i&&r.push(n.id)}),o.edges.forEach(n=>{let a=o.nodes.get(n.source),c=o.nodes.get(n.target);a&&c&&a.position.x>=t&&a.position.x<=s&&a.position.y>=e&&a.position.y<=i&&c.position.x>=t&&c.position.x<=s&&c.position.y>=e&&c.position.y<=i&&d.push(n.id)}),this.stateManager.setSelection(r,d)}screenToFlow(t,e,s){return{x:(t.x-s.left-e.x)/e.zoom,y:(t.y-s.top-e.y)/e.zoom}}};var tt=class{constructor(t,e){this.container=t;this.stateManager=e}draftSourceNodeId=null;draftSourcePortId=null;startDraft(t,e,s){this.draftSourceNodeId=t,this.draftSourcePortId=e,this.container.setPointerCapture(s),this.container.classList.add("sci-flow-dragging-edge"),this.highlightValidPorts()}highlightValidPorts(){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let t=this.container.querySelectorAll(".sci-flow-port"),e=Array.from(t).find(o=>o.dataset.nodeid===this.draftSourceNodeId&&o.dataset.portid===this.draftSourcePortId),s=e?.dataset.dataType||"any",i=e?.dataset.portType;t.forEach(o=>{let r=o,d=r.dataset.nodeid,n=r.dataset.portid,a=r.dataset.dataType||"any",c=r.dataset.portType;if(d===this.draftSourceNodeId&&n===this.draftSourcePortId){r.classList.add("sci-flow-port-target-valid");return}d!==this.draftSourceNodeId&&i!==c&&(s==="any"||a==="any"||s===a)?r.classList.add("sci-flow-port-target-valid"):r.classList.add("sci-flow-port-target-invalid")})}clearPortHighlights(){this.container.querySelectorAll(".sci-flow-port").forEach(e=>{e.classList.remove("sci-flow-port-target-valid","sci-flow-port-target-invalid")})}updateDraft(t){!this.draftSourceNodeId||!this.draftSourcePortId||this.stateManager.setDraftEdge(this.draftSourceNodeId,this.draftSourcePortId,t)}endDraft(t){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let i=document.elementsFromPoint(t.clientX,t.clientY).find(o=>o.closest(".sci-flow-port"))?.closest(".sci-flow-port");if(i&&i.dataset.nodeid&&i.dataset.portid){let o=i.classList.contains("sci-flow-port-target-valid"),r=i.dataset.nodeid,d=i.dataset.portid;if(o&&r!==this.draftSourceNodeId){let n=this.stateManager.getState(),a=!1;for(let c of n.edges.values())if(c.source===this.draftSourceNodeId&&c.target===r&&c.sourceHandle===this.draftSourcePortId&&c.targetHandle===d){a=!0;break}a||this.stateManager.addEdge({id:`edge-${Date.now()}`,source:this.draftSourceNodeId,sourceHandle:this.draftSourcePortId,target:r,targetHandle:d,type:n.defaultEdgeType,style:n.defaultEdgeStyle?{...n.defaultEdgeStyle}:void 0})}}this.draftSourceNodeId=null,this.draftSourcePortId=null,this.stateManager.clearDraftEdge(),this.container.classList.remove("sci-flow-dragging-edge"),this.clearPortHighlights()}isDrafting(){return!!this.draftSourceNodeId}};function gt(l,t){let e=new Set,s=[...t];for(;s.length>0;){let i=s.pop();for(let[o,r]of l.entries())r.parentId===i&&!e.has(o)&&(e.add(o),s.push(o))}return Array.from(e)}var et=class{constructor(t,e,s){this.container=t;this.stateManager=e;this.options=s}isDraggingNodes=!1;draggedNodeIds=[];lastDragPos=null;startDrag(t,e,s){this.isDraggingNodes=!0,this.draggedNodeIds=t,this.lastDragPos=e,this.container.setPointerCapture(s),this.container.classList.add("sci-flow-dragging")}updateDrag(t,e){if(!this.isDraggingNodes||!this.lastDragPos)return;let s=this.stateManager.getState(),i=t.x-this.lastDragPos.x,o=t.y-this.lastDragPos.y,r=[];if(this.draggedNodeIds.length===1&&!e.altKey){let d=this.draggedNodeIds[0],n=s.nodes.get(d);if(n){let a=n.position.x+i,c=n.position.y+o,h=n.style?.width||200,y=n.style?.height||150,m=!1,v=!1,x=10/s.viewport.zoom;if(this.options.showSmartGuides){let I=a+h/2,T=c+y/2;for(let[A,p]of s.nodes.entries()){if(A===d)continue;let w=p.style?.width||200,k=p.style?.height||150,b=p.position.x+w/2,C=p.position.y+k/2;if(!m){let S=[{target:p.position.x,guide:p.position.x},{target:b,guide:b},{target:p.position.x+w,guide:p.position.x+w}];for(let u of S){if(Math.abs(a-u.target)<x){a=u.target,m=!0,r.push({x:u.guide});break}if(Math.abs(I-u.target)<x){a=u.target-h/2,m=!0,r.push({x:u.guide});break}if(Math.abs(a+h-u.target)<x){a=u.target-h,m=!0,r.push({x:u.guide});break}}}if(!v){let S=[{target:p.position.y,guide:p.position.y},{target:C,guide:C},{target:p.position.y+k,guide:p.position.y+k}];for(let u of S){if(Math.abs(c-u.target)<x){c=u.target,v=!0,r.push({y:u.guide});break}if(Math.abs(T-u.target)<x){c=u.target-y/2,v=!0,r.push({y:u.guide});break}if(Math.abs(c+y-u.target)<x){c=u.target-y,v=!0,r.push({y:u.guide});break}}}}}this.options.snapToGrid&&!m&&(a=Math.round(a/this.options.gridSize)*this.options.gridSize),this.options.snapToGrid&&!v&&(c=Math.round(c/this.options.gridSize)*this.options.gridSize),i=a-n.position.x,o=c-n.position.y}}else this.options.snapToGrid&&!e.altKey&&(i=Math.round(i/this.options.gridSize)*this.options.gridSize,o=Math.round(o/this.options.gridSize)*this.options.gridSize);this.stateManager.setSmartGuides(r.length>0?r:void 0),(i!==0||o!==0)&&(new Set([...this.draggedNodeIds,...gt(s.nodes,this.draggedNodeIds)]).forEach(n=>{let a=s.nodes.get(n);a&&this.stateManager.updateNodePosition(n,a.position.x+i,a.position.y+o,!0)}),this.lastDragPos={x:this.lastDragPos.x+i,y:this.lastDragPos.y+o})}endDrag(t){this.isDraggingNodes&&(this.isDraggingNodes=!1,this.container.classList.remove("sci-flow-dragging"),this.lastDragPos&&(this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot()),this.lastDragPos=null,this.stateManager.clearSmartGuides(),this.container.hasPointerCapture(t)&&this.container.releasePointerCapture(t))}isDragging(){return this.isDraggingNodes}};var st=class{constructor(t){this.stateManager=t}handleKeyDown(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState();if((t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="a"){t.preventDefault(),this.stateManager.setSelection(Array.from(e.nodes.keys()),[]);return}if(t.key==="Delete"||t.key==="Backspace"){t.preventDefault();let d=Array.from(e.nodes.values()).filter(a=>a.selected).map(a=>a.id),n=Array.from(e.edges.values()).filter(a=>a.selected).map(a=>a.id);d.forEach(a=>this.stateManager.removeNode(a)),n.forEach(a=>this.stateManager.removeEdge(a));return}let s=navigator.platform.toUpperCase().indexOf("MAC")>=0,i=s&&t.metaKey&&t.shiftKey&&t.code==="KeyZ"||!s&&t.ctrlKey&&t.code==="KeyY";if((t.metaKey||t.ctrlKey)&&t.code==="KeyZ"&&!i){t.preventDefault(),this.stateManager.undo();return}else if(i){t.preventDefault(),this.stateManager.redo();return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(t.key)){let d=Array.from(e.nodes.values()).filter(n=>n.selected);if(d.length>0){t.preventDefault();let n=t.shiftKey?10:1;d.forEach(a=>{let c=a.position.x,h=a.position.y;t.key==="ArrowUp"&&(h-=n),t.key==="ArrowDown"&&(h+=n),t.key==="ArrowLeft"&&(c-=n),t.key==="ArrowRight"&&(c+=n),this.stateManager.updateNodePosition(a.id,c,h,!0)}),this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot();return}}}handleCopy(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState(),s=Array.from(e.nodes.values()).filter(r=>r.selected),i=Array.from(e.edges.values()).filter(r=>r.selected);if(s.length===0)return;let o={version:"sci-flow-1.0",nodes:s,edges:i};t.clipboardData&&(t.clipboardData.setData("application/json",JSON.stringify(o)),t.preventDefault())}handlePaste(t){if(!(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)&&t.clipboardData)try{let e=t.clipboardData.getData("application/json");if(!e)return;let s=JSON.parse(e);if(s.version==="sci-flow-1.0"){t.preventDefault();let i=30,o=[],r=new Map;s.nodes.forEach(n=>{let a=`${n.id}-copy-${Date.now()}`;r.set(n.id,a),o.push({...n,id:a,position:{x:n.position.x+i,y:n.position.y+i},selected:!0})}),this.stateManager.setSelection([],[]),o.forEach(n=>this.stateManager.addNode(n));let d=o.map(n=>n.id);this.stateManager.setSelection(d,[]),this.stateManager.saveSnapshot()}}catch(e){console.error("Paste failed",e)}}};var it=class{container;stateManager;panZoom;selection;connection;drag;shortcuts;isPanning=!1;lastPointerPos={x:0,y:0};isSpacePressed=!1;cleanupEvents=[];constructor({container:t,stateManager:e,snapToGrid:s=!0,gridSize:i=20,showSmartGuides:o=!0}){this.container=t,this.stateManager=e,this.panZoom=new _(e),this.selection=new Q(t,e),this.connection=new tt(t,e),this.drag=new et(t,e,{snapToGrid:s,gridSize:i,showSmartGuides:o}),this.shortcuts=new st(e),this.bindEvents()}bindEvents(){this.container.style.touchAction="none";let t=n=>this.panZoom.handleWheel(n),e=this.handlePointerDown.bind(this),s=this.handlePointerMove.bind(this),i=this.handlePointerUp.bind(this),o=n=>{n.code==="Space"&&(this.isSpacePressed=!0,this.container.style.cursor="grab"),this.shortcuts.handleKeyDown(n)},r=n=>{n.code==="Space"&&(this.isSpacePressed=!1,this.container.style.cursor="default")},d=n=>n.preventDefault();this.container.addEventListener("wheel",t,{passive:!1}),this.container.addEventListener("pointerdown",e),this.container.addEventListener("contextmenu",d),window.addEventListener("pointermove",s),window.addEventListener("pointerup",i),window.addEventListener("keydown",o),window.addEventListener("keyup",r),window.addEventListener("copy",n=>this.shortcuts.handleCopy(n)),window.addEventListener("paste",n=>this.shortcuts.handlePaste(n)),this.cleanupEvents=[()=>this.container.removeEventListener("wheel",t),()=>this.container.removeEventListener("pointerdown",e),()=>this.container.removeEventListener("contextmenu",d),()=>window.removeEventListener("pointermove",s),()=>window.removeEventListener("pointerup",i),()=>window.removeEventListener("keydown",o),()=>window.removeEventListener("keyup",r)]}handlePointerDown(t){let e=t.target,s=e.closest(".sci-flow-port");if(s?.dataset.nodeid&&s?.dataset.portid){this.connection.startDraft(s.dataset.nodeid,s.dataset.portid,t.pointerId);return}let i=this.stateManager.getState(),o=this.container.getBoundingClientRect(),r=this.screenToFlow({x:t.clientX,y:t.clientY},i.viewport,o),d=this.findNodeAt(r);if(d){let a=i.nodes.get(d),c=a?.selected?Array.from(i.nodes.values()).filter(h=>h.selected).map(h=>h.id):[d];!a?.selected&&!t.shiftKey?this.stateManager.setSelection([d],[]):t.shiftKey&&this.stateManager.appendSelection(d),this.drag.startDrag(c,r,t.pointerId);return}let n=e.closest(".sci-flow-edge-bg, .sci-flow-edge-fg");if(n&&n.parentElement&&n.parentElement.id.startsWith("edge-group-")){let a=n.parentElement.id.replace("edge-group-","");t.shiftKey?this.stateManager.appendSelection(void 0,a):this.stateManager.setSelection([],[a]);return}if(t.button===1||t.button===2||t.button===0&&this.isSpacePressed){this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing";return}t.button===0&&!this.isSpacePressed&&(t.shiftKey?this.selection.startSelection({x:t.clientX,y:t.clientY}):(this.stateManager.setSelection([],[]),this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing"))}handlePointerMove(t){let e=this.stateManager.getState(),s=this.container.getBoundingClientRect(),i=this.screenToFlow({x:t.clientX,y:t.clientY},e.viewport,s);this.connection.isDrafting()?this.connection.updateDraft(i):this.drag.isDragging()?this.drag.updateDrag(i,t):this.isPanning?this.lastPointerPos=this.panZoom.handlePan(t,this.lastPointerPos):this.selection.updateSelection({x:t.clientX,y:t.clientY},e.viewport)}handlePointerUp(t){this.connection.endDraft(t),this.drag.endDrag(t.pointerId),this.selection.endSelection(),this.isPanning=!1,this.container.style.cursor=this.isSpacePressed?"grab":"default",this.container.hasPointerCapture(t.pointerId)&&this.container.releasePointerCapture(t.pointerId)}findNodeAt(t){let e=this.stateManager.getState(),s=Array.from(e.nodes.values()).reverse();for(let i of s){let o=i.style?.width||200,r=i.style?.height||150;if(t.x>=i.position.x&&t.x<=i.position.x+o&&t.y>=i.position.y&&t.y<=i.position.y+r)return i.id}return null}screenToFlow(t,e,s){return{x:(t.x-s.left-e.x)/e.zoom,y:(t.y-s.top-e.y)/e.zoom}}destroy(){this.cleanupEvents.forEach(t=>t())}};var ot=class{constructor(t,e){this.container=t;this.stateManagerId=e;this.styleInjector=document.createElement("style"),this.styleInjector.id="sci-flow-theme-injector",this.container.appendChild(this.styleInjector)}currentTheme=O;styleInjector;setTheme(t){let e=O;t==="dark"?e=Y:t==="system"?e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?Y:O:typeof t=="object"&&(e=t.name==="dark"?Y:O),this.currentTheme=typeof t=="object"?{name:t.name||e.name,colors:{...e.colors,...t.colors||{}}}:e,this.applyThemeVariables()}applyThemeVariables(){if(!this.styleInjector)return;let t=this.currentTheme.colors,e=`
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
        `;this.styleInjector.innerHTML=e,this.container.classList.add(`sci-flow-container-${this.stateManagerId}`)}destroy(){this.styleInjector.remove()}};var rt=class{container;stateManager;interactionManager;renderer;gridRenderer;options;unsubscribe;themeManager;constructor(t){this.options={renderer:"auto",autoSwitchThreshold:1e3,theme:"light",...t},this.container=this.options.container,getComputedStyle(this.container).position==="static"&&(this.container.style.position="relative"),this.stateManager=new V,this.themeManager=new ot(this.container,this.stateManager.id),this.themeManager.setTheme(this.options.theme),this.interactionManager=new it({container:this.container,stateManager:this.stateManager,minZoom:this.options.minZoom,maxZoom:this.options.maxZoom}),this.gridRenderer=new J({container:this.container});let e=this.options.renderer==="auto"?"svg":this.options.renderer||"svg";this.renderer=this.createRenderer(e),this.renderer.stateManager=this.stateManager,this.options.nodeTypes&&Array.isArray(this.options.nodeTypes)&&this.options.nodeTypes.forEach(s=>{let i=new Set;s.nodeType&&i.add(s.nodeType),s.name&&(i.add(s.name),i.add(s.name.toLowerCase().replace("node",""))),i.forEach(o=>{o&&this.stateManager.registerNodeType({type:o})})}),this.unsubscribe=this.stateManager.subscribe(s=>{this.gridRenderer.render(s),this.renderer.render(s,this.stateManager.getNodeRegistry()),this.checkRendererThreshold(s.nodes.size)})}createRenderer(t){return t==="svg"?new j({container:this.container}):new X({container:this.container})}checkRendererThreshold(t){if(this.options.renderer==="auto"){let e=this.options.autoSwitchThreshold||1e3,s=this.renderer instanceof X;t>e&&!s?this.switchRenderer("canvas"):t<=e&&s&&this.switchRenderer("svg")}}switchRenderer(t){this.renderer.destroy(),this.renderer=this.createRenderer(t),this.renderer.render(this.stateManager.getState(),this.stateManager.getNodeRegistry())}setTheme(t){this.themeManager.setTheme(t)}setNodes(t){this.stateManager.setNodes(t)}setEdges(t){this.stateManager.setEdges(t)}addNode(t){this.stateManager.addNode(t)}removeNode(t){this.stateManager.removeNode(t)}addEdge(t){this.stateManager.addEdge(t)}removeEdge(t){this.stateManager.removeEdge(t)}getState(){return this.stateManager.getState()}forceUpdate(){this.stateManager.forceUpdate()}setDefaultEdgeType(t){this.stateManager.setDefaultEdgeType(t)}setDefaultEdgeStyle(t){this.stateManager.setDefaultEdgeStyle(t)}subscribe(t){return this.stateManager.subscribe(t)}updateNodePosition(t,e,s){this.stateManager.updateNodePosition(t,e,s)}fitView(t=50){let e=this.stateManager.getState();if(e.nodes.size===0)return;let s=1/0,i=1/0,o=-1/0,r=-1/0;e.nodes.forEach(p=>{let w=p.style?.width||200,k=p.style?.height||150;p.position.x<s&&(s=p.position.x),p.position.y<i&&(i=p.position.y),p.position.x+w>o&&(o=p.position.x+w),p.position.y+k>r&&(r=p.position.y+k)});let d=o-s,n=r-i;if(d<=0||n<=0)return;let a=this.container.getBoundingClientRect(),c=a.width-t*2,h=a.height-t*2,y=c/d,m=h/n,v=Math.min(Math.max(Math.min(y,m),.1),2),x=s+d/2,I=i+n/2,T=a.width/2-x*v,A=a.height/2-I*v;this.stateManager.setViewport({x:T,y:A,zoom:v})}centerNode(t){let e=this.stateManager.getState(),s=e.nodes.get(t);if(!s)return;let i=s.style?.width||200,o=s.style?.height||150,r=s.position.x+i/2,d=s.position.y+o/2,n=this.container.getBoundingClientRect(),a=e.viewport.zoom,c=n.width/2-r*a,h=n.height/2-d*a;this.stateManager.setViewport({x:c,y:h,zoom:a})}toJSON(){return this.stateManager.toJSON()}fromJSON(t){this.stateManager.fromJSON(t)}destroy(){this.unsubscribe(),this.interactionManager.destroy(),this.themeManager.destroy(),this.gridRenderer.destroy(),this.renderer.destroy()}};var at=class{canvas;ctx;stateManager;options;isDragging=!1;unsubscribe;constructor(t){this.stateManager=t.stateManager,this.options={container:t.container,stateManager:t.stateManager,width:t.width||150,height:t.height||100,nodeColor:t.nodeColor||"#rgba(100, 100, 100, 0.5)",viewportColor:t.viewportColor||"rgba(0, 123, 255, 0.4)",backgroundColor:t.backgroundColor||"#111"},this.canvas=document.createElement("canvas"),this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.canvas.style.backgroundColor=this.options.backgroundColor,this.canvas.style.border="1px solid #333",this.canvas.style.borderRadius="4px",this.canvas.style.cursor="crosshair",this.options.container.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.unsubscribe=this.stateManager.subscribe(()=>this.render()),this.bindEvents(),this.render()}bindEvents(){this.canvas.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp)}unbindEvents(){this.canvas.removeEventListener("pointerdown",this.onPointerDown),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp)}onPointerDown=t=>{this.isDragging=!0,this.canvas.setPointerCapture(t.pointerId),this.panToEvent(t)};onPointerMove=t=>{this.isDragging&&this.panToEvent(t)};onPointerUp=t=>{this.isDragging=!1,this.canvas.hasPointerCapture(t.pointerId)&&this.canvas.releasePointerCapture(t.pointerId)};panToEvent(t){let e=this.stateManager.getState(),s=this.canvas.getBoundingClientRect(),i=(t.clientX-s.left)/s.width,o=(t.clientY-s.top)/s.height;i=Math.max(0,Math.min(1,i)),o=Math.max(0,Math.min(1,o));let r=this.getWorldBounds(e),d=r.minX+i*r.width,n=r.minY+o*r.height,a=window.innerWidth,c=window.innerHeight,h=-d*e.viewport.zoom+a/2,y=-n*e.viewport.zoom+c/2;this.stateManager.setViewport({x:h,y,zoom:e.viewport.zoom})}getWorldBounds(t){if(t.nodes.size===0)return{minX:0,minY:0,maxX:1e3,maxY:1e3,width:1e3,height:1e3};let e=1/0,s=1/0,i=-1/0,o=-1/0;return t.nodes.forEach(r=>{let d=r.style?.width||200,n=r.style?.height||150;e=Math.min(e,r.position.x),s=Math.min(s,r.position.y),i=Math.max(i,r.position.x+d),o=Math.max(o,r.position.y+n)}),e-=500,s-=500,i+=500,o+=500,{minX:e,minY:s,maxX:i,maxY:o,width:i-e,height:o-s}}render(){if(!this.ctx)return;let t=this.stateManager.getState();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let e=this.getWorldBounds(t);if(e.width===0||e.height===0)return;let s=this.canvas.width/e.width,i=this.canvas.height/e.height,o=Math.min(s,i),r=(this.canvas.width-e.width*o)/2,d=(this.canvas.height-e.height*o)/2;this.ctx.save(),this.ctx.translate(r,d),this.ctx.scale(o,o),this.ctx.translate(-e.minX,-e.minY),this.ctx.fillStyle=this.options.nodeColor,t.nodes.forEach(v=>{let x=v.style?.width||200,I=v.style?.height||150;this.ctx.beginPath(),this.ctx.roundRect(v.position.x,v.position.y,x,I,10),this.ctx.fill()});let n=window.innerWidth,a=window.innerHeight,c=-t.viewport.x/t.viewport.zoom,h=-t.viewport.y/t.viewport.zoom,y=(n-t.viewport.x)/t.viewport.zoom,m=(a-t.viewport.y)/t.viewport.zoom;this.ctx.strokeStyle=this.options.viewportColor,this.ctx.lineWidth=2/o,this.ctx.fillStyle=this.options.viewportColor,this.ctx.beginPath(),this.ctx.rect(c,h,y-c,m-h),this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()}destroy(){this.unbindEvents(),this.unsubscribe(),this.canvas.remove()}};0&&(module.exports={BaseRenderer,CanvasRenderer,Minimap,SVGRenderer,SciFlow,StateManager,darkTheme,lightTheme});
//# sourceMappingURL=index.cjs.map
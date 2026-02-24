"use strict";var rt=Object.defineProperty;var mt=Object.getOwnPropertyDescriptor;var yt=Object.getOwnPropertyNames;var xt=Object.prototype.hasOwnProperty;var vt=(c,t)=>{for(var e in t)rt(c,e,{get:t[e],enumerable:!0})},wt=(c,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of yt(t))!xt.call(c,s)&&s!==e&&rt(c,s,{get:()=>t[s],enumerable:!(i=mt(t,s))||i.enumerable});return c};var bt=c=>wt(rt({},"__esModule",{value:!0}),c);var Pt={};vt(Pt,{BaseRenderer:()=>z,CanvasRenderer:()=>X,Minimap:()=>at,SVGRenderer:()=>j,SciFlow:()=>q,StateManager:()=>V,darkTheme:()=>Y,lightTheme:()=>F,mount:()=>Et});module.exports=bt(Pt);var F={name:"light",colors:{background:"#f8f9fa",gridDot:"#d7d9dd",nodeBackground:"#ffffff",nodeBorder:"#e2e8f0",nodeText:"#1e293b",nodeHeaderText:"#ffffff",nodeHeaderOps:"#475569",nodeHeaderInput:"#0ea5e9",nodeHeaderOutput:"#ef4444",nodeSelected:"#3b82f6",edgeLine:"#94a3b8",edgeActive:"#3b82f6",edgeAnimated:"#3b82f6",portBackground:"#cbd5e1",portBorder:"#94a3b8",portActive:"#3b82f6",contextMenuBackground:"#ffffff",contextMenuText:"#1e293b",contextMenuHover:"#f1f5f9",selectionBoxBackground:"rgba(59, 130, 246, 0.1)",selectionBoxBorder:"rgba(59, 130, 246, 0.5)"}},Y={name:"dark",colors:{background:"#0f172a",gridDot:"#334155",nodeBackground:"#1e293b",nodeBorder:"#334155",nodeText:"#f8fafc",nodeHeaderText:"#ffffff",nodeHeaderOps:"#334155",nodeHeaderInput:"#0369a1",nodeHeaderOutput:"#991b1b",nodeSelected:"#ffffff",edgeLine:"#475569",edgeActive:"#60a5fa",edgeAnimated:"#60a5fa",portBackground:"#1e293b",portBorder:"#64748b",portActive:"#ffffff",contextMenuBackground:"#1e293b",contextMenuText:"#f1f5f9",contextMenuHover:"#334155",selectionBoxBackground:"rgba(96, 165, 250, 0.1)",selectionBoxBorder:"rgba(96, 165, 250, 0.5)"}};var K=class{history=[];historyIndex=-1;maxHistory=50;isRestoringHistory=!1;constructor(){}saveSnapshot(t){if(this.isRestoringHistory)return;let e=JSON.stringify({nodes:Array.from(t.nodes.entries()),edges:Array.from(t.edges.entries())});this.historyIndex<this.history.length-1&&(this.history=this.history.slice(0,this.historyIndex+1)),!(this.history.length>0&&this.history[this.historyIndex]===e)&&(this.history.push(e),this.history.length>this.maxHistory?this.history.shift():this.historyIndex++)}undo(t){this.historyIndex>0&&(this.historyIndex--,this.performRestore(this.history[this.historyIndex],t))}redo(t){this.historyIndex<this.history.length-1&&(this.historyIndex++,this.performRestore(this.history[this.historyIndex],t))}performRestore(t,e){this.isRestoringHistory=!0,e(t),this.isRestoringHistory=!1}};var U=class{registry=new Map;register(t){this.registry.set(t.type,t)}get(t){return this.registry.get(t)}getAllTypes(){return Array.from(this.registry.keys())}getFullRegistry(){return this.registry}};var V=class{state;listeners=new Set;id;history=new K;registry=new U;onNodesChange;onEdgesChange;onConnect;onNodeMount;onNodeUnmount;onNodeContextMenu;onEdgeContextMenu;onPaneContextMenu;constructor(t){this.id=Math.random().toString(36).substring(2,9),this.state={nodes:new Map,edges:new Map,viewport:{x:0,y:0,zoom:1},direction:"horizontal",defaultEdgeType:"bezier",defaultEdgeStyle:{lineStyle:"solid"},...t}}registerNodeType(t){this.registry.register(t)}getNodeDefinition(t){return this.registry.get(t)}getRegisteredNodeTypes(){return this.registry.getAllTypes()}getNodeRegistry(){return this.registry.getFullRegistry()}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){this.listeners.forEach(t=>t(this.state))}forceUpdate(){this.notify()}setNodes(t){this.state.nodes.clear(),t.forEach(e=>this.state.nodes.set(e.id,e)),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values()))}setEdges(t){this.state.edges.clear(),t.forEach(e=>this.state.edges.set(e.id,e)),this.notify(),this.onEdgesChange?.(Array.from(this.state.edges.values()))}setSelection(t,e){this.state.nodes.forEach(i=>i.selected=t.includes(i.id)),this.state.edges.forEach(i=>i.selected=e.includes(i.id)),this.notify()}appendSelection(t,e){if(t){let i=this.state.nodes.get(t);i&&(i.selected=!0)}if(e){let i=this.state.edges.get(e);i&&(i.selected=!0)}this.notify()}addNode(t){this.state.nodes.set(t.id,t),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values()))}setDraftEdge(t,e,i){this.state.draftEdge={sourceNodeId:t,sourcePortId:e,targetPosition:i},this.notify()}clearDraftEdge(){this.state.draftEdge=void 0,this.notify()}removeNode(t){let e=this.getDescendantsLocal([t]),i=new Set([t,...e]);for(let s of i){this.state.nodes.delete(s);for(let[o,r]of this.state.edges.entries())(r.source===s||r.target===s)&&this.state.edges.delete(o)}this.notify(),this.saveSnapshot(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}getDescendantsLocal(t){let e=new Set,i=[...t];for(;i.length>0;){let s=i.pop();for(let[o,r]of this.state.nodes.entries())r.parentId===s&&!e.has(o)&&(e.add(o),i.push(o))}return Array.from(e)}updateNodePosition(t,e,i,s=!1){let o=this.state.nodes.get(t);o&&(o.position={x:e,y:i},this.notify(),s||this.onNodesChange?.(Array.from(this.state.nodes.values())))}addEdge(t){this.state.edges.set(t.id,t),this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.onConnect?.({source:t.source,sourceHandle:t.sourceHandle,target:t.target,targetHandle:t.targetHandle})}removeEdge(t){this.state.edges.delete(t)&&(this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values())))}saveSnapshot(){this.history.saveSnapshot(this.state)}undo(){this.history.undo(t=>this.restoreSnapshot(t))}redo(){this.history.redo(t=>this.restoreSnapshot(t))}restoreSnapshot(t){let e=JSON.parse(t);this.state.nodes=new Map(e.nodes),this.state.edges=new Map(e.edges),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}setDefaultEdgeType(t){this.state.defaultEdgeType=t,this.notify()}setDefaultEdgeStyle(t){this.state.defaultEdgeStyle={...this.state.defaultEdgeStyle,...t},this.notify()}setDirection(t){let e=this.state.direction;this.state.direction=t,e!==t&&this.state.nodes.size>0&&this.autoLayout(t),this.state.nodes.forEach(i=>{let s=document.getElementById(`node-${i.id}`);if(s){let o=s.querySelector(".sci-flow-node-wrapper");o&&delete o.dataset.layoutSettled}}),this.notify()}autoLayout(t){let e=Array.from(this.state.nodes.values()),i=Array.from(this.state.edges.values()),s=new Map,o=new Map;e.forEach(y=>{s.set(y.id,0),o.set(y.id,[])}),i.forEach(y=>{o.has(y.source)&&s.has(y.target)&&(o.get(y.source).push(y.target),s.set(y.target,(s.get(y.target)||0)+1))});let r=[];s.forEach((y,v)=>{y===0&&r.push(v)});let d=new Map;for(;r.length>0;){let y=r.shift(),v=d.get(y)||0;for(let S of o.get(y)||[]){let k=Math.max(d.get(S)||0,v+1);d.set(S,k);let p=(s.get(S)||1)-1;s.set(S,p),p===0&&r.push(S)}}let n=new Map;e.forEach(y=>{let v=d.get(y.id)||0;n.has(v)||n.set(v,[]),n.get(v).push(y)});let a=180,l=140,h=80,m=80,g=50,w=50;n.forEach((y,v)=>{y.forEach((S,k)=>{t==="vertical"?S.position={x:g+k*(a+h),y:w+v*(l+m)}:S.position={x:g+v*(a+h),y:w+k*(l+m)}})})}toJSON(){return JSON.stringify({version:"sci-flow-1.0",nodes:Array.from(this.state.nodes.values()),edges:Array.from(this.state.edges.values()),viewport:this.state.viewport,direction:this.state.direction})}fromJSON(t){try{let e=JSON.parse(t);this.state.nodes.clear(),Array.isArray(e.nodes)&&e.nodes.forEach(i=>this.state.nodes.set(i.id,i)),this.state.edges.clear(),Array.isArray(e.edges)&&e.edges.forEach(i=>this.state.edges.set(i.id,i)),e.viewport&&(this.state.viewport=e.viewport),e.direction&&(this.state.direction=e.direction),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.saveSnapshot()}catch(e){console.error("Failed to parse SciFlow JSON",e)}}setViewport(t){this.state.viewport=t,this.notify()}setSmartGuides(t){this.state.smartGuides=t,this.notify()}clearSmartGuides(){this.state.smartGuides=void 0,this.notify()}commitNodePositions(){this.onNodesChange?.(Array.from(this.state.nodes.values()))}};var z=class{container;stateManager;constructor(t){this.container=t.container}};function dt(c,t,e,i=20){let s=new Set,o=new Set,r=c.x,d=c.y,n=t.x,a=t.y;s.add(r),s.add(n),o.add(d),o.add(a),s.add(r+(n-r)/2),o.add(d+(a-d)/2),s.add(r+i),s.add(r-i),o.add(d+i),o.add(d-i),s.add(n+i),s.add(n-i),o.add(a+i),o.add(a-i);for(let u of e)s.add(u.x),s.add(u.x+u.width),s.add(u.x-i),s.add(u.x+u.width+i),o.add(u.y),o.add(u.y+u.height),o.add(u.y-i),o.add(u.y+u.height+i);let l=Array.from(s).sort((u,E)=>u-E),h=Array.from(o).sort((u,E)=>u-E),m=(u,E)=>{for(let I of e){let T=I.x-1,L=I.x+I.width+1,$=I.y-1,N=I.y+I.height+1;if(u.x===E.x){if(u.x>T&&u.x<L){let x=Math.min(u.y,E.y),G=Math.max(u.y,E.y);if(x<N&&G>$)return!0}}else if(u.y>$&&u.y<N){let x=Math.min(u.x,E.x),G=Math.max(u.x,E.x);if(x<L&&G>T)return!0}}return!1},g=(u,E)=>E*l.length+u,w=u=>({xi:u%l.length,yi:Math.floor(u/l.length)}),y=h.indexOf(d),v=h.indexOf(a),S=l.indexOf(r),k=l.indexOf(n),p=(u,E)=>{let I=u.x+(E.x-u.x)/2;return`M ${u.x},${u.y} L ${I},${u.y} L ${I},${E.y} L ${E.x},${E.y}`};if(S===-1||y===-1||k===-1||v===-1)return p(c,t);let C=g(S,y),A=g(k,v),D=new Set([C]),b=new Set,M=new Map,f=new Map,P=new Map;for(M.set(C,0),f.set(C,Math.abs(t.x-c.x)+Math.abs(t.y-c.y));D.size>0;){let u=-1,E=1/0;for(let N of D){let x=f.get(N)??1/0;x<E&&(E=x,u=N)}if(u===A){let N=[],x=u;for(;x!==C;){let{xi:H,yi:B}=w(x);N.unshift({x:l[H],y:h[B]}),x=P.get(x)}N.unshift({x:c.x,y:c.y});let G=[N[0]];for(let H=1;H<N.length-1;H++){let B=N[H-1],O=N[H+1],R=N[H];B.x===R.x&&R.x===O.x||B.y===R.y&&R.y===O.y||G.push(R)}return G.push(N[N.length-1]),`M ${G.map(H=>`${H.x},${H.y}`).join(" L ")}`}D.delete(u),b.add(u);let{xi:I,yi:T}=w(u),L={x:l[I],y:h[T]},$=[];I>0&&$.push({xi:I-1,yi:T}),I<l.length-1&&$.push({xi:I+1,yi:T}),T>0&&$.push({xi:I,yi:T-1}),T<h.length-1&&$.push({xi:I,yi:T+1});for(let N of $){let x=g(N.xi,N.yi);if(b.has(x))continue;let G={x:l[N.xi],y:h[N.yi]};if(m(L,G))continue;let H=0;if(P.has(u)){let R=P.get(u),ft=w(R).yi===T,ut=N.yi===T;ft!==ut&&(H+=100)}let B=Math.abs(G.x-L.x)+Math.abs(G.y-L.y),O=(M.get(u)??0)+B+H;(!D.has(x)||O<(M.get(x)??1/0))&&(P.set(x,u),M.set(x,O),f.set(x,O+Math.abs(t.x-G.x)+Math.abs(t.y-G.y)),D.add(x))}}return p(c,t)}var St=(c,t,e=.25)=>{let i=(t.x-c.x)*e;return`M ${c.x},${c.y} C ${c.x+i},${c.y} ${t.x-i},${t.y} ${t.x},${t.y}`},Mt=(c,t)=>`M ${c.x},${c.y} L ${t.x},${t.y}`,ct=(c,t,e=0)=>{let i=t.x-c.x,s=c.x+i/2;if(e<=0)return`M ${c.x},${c.y} L ${s},${c.y} L ${s},${t.y} L ${t.x},${t.y}`;let o=t.y-c.y,r=Math.min(e,Math.abs(i/2),Math.abs(o/2));if(r<=1)return`M ${c.x},${c.y} L ${s},${c.y} L ${s},${t.y} L ${t.x},${t.y}`;let d=Math.sign(i),n=Math.sign(o),a=s-r*d,l=c.y+r*n,h=s+r*d,m=t.y-r*n,g=d*n>0?1:0,w=d*n>0?0:1;return`M ${c.x},${c.y} L ${a},${c.y} A ${r},${r} 0 0 ${g} ${s},${l} L ${s},${m} A ${r},${r} 0 0 ${w} ${h},${t.y} L ${t.x},${t.y}`},W=({source:c,target:t,mode:e="bezier",curvature:i=.5,obstacles:s=[]})=>{switch(e){case"straight":return Mt(c,t);case"step":return ct(c,t,0);case"smooth-step":return ct(c,t,8);case"smart":return dt(c,t,s);default:return St(c,t,i)}};var lt=`
  .sci-flow-svg-renderer {
    user-select: none;
    -webkit-user-select: none;
    background-color: transparent;
  }

  /* Main background should be on the container or a separate layer */
  .sci-flow-container {
    background-color: var(--sf-bg);
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

  /* Vertical layout mode */
  .sci-flow-vertical .sci-flow-port-label {
    display: none !important;
  }

  .sci-flow-vertical .sci-flow-node-ports-area {
    display: none !important;
  }
`;function ht(c,t,e,i){let s=e||document,o="getElementById"in s?s.getElementById(`node-${c.id}`):s.querySelector(`#node-${c.id}`);if(o){let D=o.querySelector(`[data-portid="${t}"]`);if(D){let b=D.getAttribute("cx"),M=D.getAttribute("cy");if(b!==null&&M!==null){let f=parseFloat(b),P=parseFloat(M);if(f!==0||P!==0||t.endsWith("0"))return{x:c.position.x+f,y:c.position.y+P}}}}let r=c.style?.width||140,d=c.style?.height||100,n=i||"horizontal",a=Object.keys(c.inputs||{}),l=Object.keys(c.outputs||{}),h=!!c.inputs[t],m=!!c.outputs[t];if(n==="vertical"){if(h){let D=Math.max(0,a.indexOf(t)),b=r/(a.length+1);return{x:c.position.x+b*(D+1),y:c.position.y-6}}else if(m){let D=Math.max(0,l.indexOf(t)),b=r/(l.length+1);return{x:c.position.x+b*(D+1),y:c.position.y+d+6}}return{x:c.position.x+r/2,y:c.position.y}}let g=c.portConfig||"left-right",w=32,y=26,v="left",S=0;h?(S=a.indexOf(t),S===-1&&a.length>0&&(S=0),g==="top-bottom"||g==="top-in-bottom-out"?v="top":g==="bottom-top"||g==="bottom-in-top-out"?v="bottom":g==="right-in-left-out"?v="right":g==="left-top-in-bottom-right-out"?v="top-left":g==="bottom-right-in-left-top-out"?v="bottom-right":v="left"):m&&(S=l.indexOf(t),S===-1&&l.length>0&&(S=0),g==="top-bottom"||g==="bottom-in-top-out"?v="bottom":g==="bottom-top"||g==="top-in-bottom-out"?v="top":g==="left-in-right-out"?v="right":g==="right-in-left-out"?v="left":g==="left-top-in-bottom-right-out"?v="bottom-right":g==="bottom-right-in-left-top-out"?v="top-left":v="right");let p=w+60,C=Math.max(0,S),A=p+13+C*y;switch(v){case"top":return{x:c.position.x+r/2,y:c.position.y};case"bottom":return{x:c.position.x+r/2,y:c.position.y+d};case"left":return{x:c.position.x-6,y:c.position.y+A};case"right":return{x:c.position.x+r+6,y:c.position.y+A};case"top-left":return{x:c.position.x-6,y:c.position.y+A};case"bottom-right":return{x:c.position.x+r+6,y:c.position.y+A};default:return{x:c.position.x-6,y:c.position.y+A}}}var Z=class{constructor(t){this.nodesGroup=t}reconcile(t,e,i,s,o="horizontal"){t.forEach(r=>{let d=document.getElementById(`node-${r.id}`);if(d){let n=d.querySelector(".sci-flow-node-wrapper"),a=s.get(r.type),l=n?.dataset.isDefaultPreview==="true",h=n?.dataset.direction||"horizontal";if(n&&(n.dataset.type!==r.type||l&&a||h!==o)&&(this.nodesGroup.removeChild(d),d=this.createNodeElement(r,i,s,o),this.nodesGroup.appendChild(d),i?.onNodeMount)){let m=d.querySelector(".sci-flow-node-wrapper"),g=d.querySelector(".sci-flow-node-body");i.onNodeMount(r.id,g||m)}}else if(d=this.createNodeElement(r,i,s,o),this.nodesGroup.appendChild(d),i?.onNodeMount){let n=d.querySelector(".sci-flow-node-wrapper"),a=d.querySelector(".sci-flow-node-body");i.onNodeMount(r.id,a||n)}d.setAttribute("transform",`translate(${r.position.x}, ${r.position.y})`),r.selected?d.classList.add("sci-flow-node-selected"):d.classList.remove("sci-flow-node-selected"),e.delete(`node-${r.id}`)})}createNodeElement(t,e,i,s){let o=document.createElementNS("http://www.w3.org/2000/svg","g");o.id=`node-${t.id}`,o.setAttribute("class",`sci-flow-node${s==="vertical"?" sci-flow-vertical":""}`);let r=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),d=t.style?.width||140,n=t.style?.height||100;r.setAttribute("width",d.toString()),r.setAttribute("height",n.toString()),r.style.overflow="visible";let a=document.createElement("div");a.className="sci-flow-node-wrapper",a.dataset.type=t.type,a.dataset.direction=s;let l=i.get(t.type);a.dataset.isDefaultPreview=l?"false":"true";let h=Object.keys(t.inputs||{}),m=Object.keys(t.outputs||{}),g=32,w=26,y=s==="vertical";a.innerHTML=`
            <div class="sci-flow-node-header">
                <strong>${l&&t.data?.title||t.type}</strong>
                <span class="sci-flow-node-id">${t.id.slice(0,4)}</span>
            </div>
            <div class="sci-flow-node-main">
                <div class="sci-flow-node-body"></div>
                <div class="sci-flow-node-ports-area"></div>
                <div class="sci-flow-node-actions"></div>
            </div>
        `;let v=a.querySelector(".sci-flow-node-body"),S=a.querySelector(".sci-flow-node-ports-area");if(l?.renderHTML?v.appendChild(l.renderHTML(t)):l||(v.innerHTML='<div class="sci-flow-node-fallback">Default Node Content</div>'),y)S.style.display="none";else{let b=Math.max(h.length,m.length);b>0?(S.style.height=`${b*26}px`,S.style.minHeight="20px"):S.style.display="none"}r.appendChild(a),o.appendChild(r);let k=(b,M,f)=>{let P=document.createElementNS("http://www.w3.org/2000/svg","circle");return P.setAttribute("class","sci-flow-port"),P.setAttribute("r","5"),P.dataset.nodeid=t.id,P.dataset.portid=b,P.dataset.portType=M,P.dataset.dataType=f,o.appendChild(P),P},p=h.map((b,M)=>{let f=k(b,"in",t.inputs[b]?.dataType||"any");if(y){let P=d/(h.length+1);f.setAttribute("cx",String(P*(M+1))),f.setAttribute("cy","-6")}else{let P=g+60+13+M*w;f.setAttribute("cy",P.toString()),f.setAttribute("cx","-6")}return f}),C=m.map((b,M)=>{let f=k(b,"out",t.outputs[b]?.dataType||"any");if(y){let P=d/(m.length+1);f.setAttribute("cx",String(P*(M+1))),f.setAttribute("cy",String(n+6))}else{let P=g+60+13+M*w;f.setAttribute("cy",P.toString()),f.setAttribute("cx",String(d+6))}return f}),A;return new ResizeObserver(()=>{A&&cancelAnimationFrame(A),A=requestAnimationFrame(()=>{let b=a.offsetWidth,M=a.offsetHeight;if(b===0||M===0)return;r.setAttribute("width",b.toString()),r.setAttribute("height",M.toString());let f=e?.getState().nodes.get(t.id),P=f&&(Math.abs((f.style?.width||0)-b)>1||Math.abs((f.style?.height||0)-M)>1);if(P&&(f.style={...f.style,width:b,height:M}),y)p.forEach((E,I)=>{let T=b/(h.length+1);E.setAttribute("cx",String(T*(I+1))),E.setAttribute("cy","-6")}),C.forEach((E,I)=>{let T=b/(m.length+1);E.setAttribute("cx",String(T*(I+1))),E.setAttribute("cy",String(M+6))});else{let E=a.querySelector(".sci-flow-node-ports-area"),I=E?E.offsetTop:g;p.forEach((T,L)=>{let $=I+13+L*w;T.setAttribute("cy",$.toString()),T.setAttribute("cx","-6");let N=`label-in-${t.id}-${h[L]}`,x=document.getElementById(N);x||(x=document.createElementNS("http://www.w3.org/2000/svg","text"),x.id=N,x.setAttribute("class","sci-flow-port-label"),x.setAttribute("x","12"),x.style.pointerEvents="none",o.appendChild(x)),x&&(x.setAttribute("y",($+4).toString()),x.textContent=t.inputs[h[L]]?.label||h[L])}),C.forEach((T,L)=>{let $=I+13+L*w;T.setAttribute("cy",$.toString()),T.setAttribute("cx",String(b+6));let N=`label-out-${t.id}-${m[L]}`,x=document.getElementById(N);x||(x=document.createElementNS("http://www.w3.org/2000/svg","text"),x.id=N,x.setAttribute("class","sci-flow-port-label"),x.setAttribute("text-anchor","end"),x.style.pointerEvents="none",o.appendChild(x)),x&&(x.setAttribute("x",(b-12).toString()),x.setAttribute("y",($+4).toString()),x.textContent=t.outputs[m[L]]?.label||m[L])})}(!a.dataset.layoutSettled||P)&&(a.dataset.layoutSettled="true",e?.forceUpdate())})}).observe(a),o}};var J=class{constructor(t,e,i,s,o,r,d){this.edgesGroup=t;this.routerWorker=e;this.routeCache=i;this.routingHashCache=s;this.pendingRoutes=o;this.routerIdCounter=r;this.getPortAnchorFn=d}reconcile(t,e,i){t.edges.forEach(s=>{let o=t.nodes.get(s.source),r=t.nodes.get(s.target);if(!o||!r)return;let d=this.getPortAnchorFn(o,s.sourceHandle),n=this.getPortAnchorFn(r,s.targetHandle),a=s.type||"bezier",l=document.getElementById(`edge-group-${s.id}`);l||(l=this.createEdgeElement(s),this.edgesGroup.appendChild(l));let h=i.filter(m=>m.id!==s.source&&m.id!==s.target);this.updateEdgeVisuals(l,s,d,n,a,h),e.delete(`edge-group-${s.id}`)})}createEdgeElement(t){let e=document.createElementNS("http://www.w3.org/2000/svg","g");e.id=`edge-group-${t.id}`,e.setAttribute("class","sci-flow-edge-group");let i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("class","sci-flow-edge-bg"),i.setAttribute("fill","none"),i.style.stroke="transparent",i.style.strokeWidth="20px",i.style.cursor="pointer",i.style.pointerEvents="stroke";let s=document.createElementNS("http://www.w3.org/2000/svg","path");s.id=`edge-path-${t.id}`,s.setAttribute("class","sci-flow-edge-fg"),s.setAttribute("fill","none"),s.style.pointerEvents="none";let o=document.createElementNS("http://www.w3.org/2000/svg","path");o.setAttribute("class","sci-flow-edge-overlay"),o.setAttribute("fill","none"),o.style.pointerEvents="none",o.style.display="none";let r=document.createElementNS("http://www.w3.org/2000/svg","text");r.setAttribute("class","sci-flow-edge-symbols"),r.style.display="none",r.style.pointerEvents="none";let d=document.createElementNS("http://www.w3.org/2000/svg","textPath");d.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",`#edge-path-${t.id}`),d.setAttribute("startOffset","0%"),d.textContent="\xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB",r.appendChild(d);let n=document.createElementNS("http://www.w3.org/2000/svg","circle");n.setAttribute("class","sci-flow-port-source"),n.setAttribute("r","3"),n.style.pointerEvents="none";let a=document.createElementNS("http://www.w3.org/2000/svg","circle");return a.setAttribute("class","sci-flow-port-target"),a.setAttribute("r","3"),a.style.pointerEvents="none",e.appendChild(i),e.appendChild(s),e.appendChild(o),e.appendChild(r),e.appendChild(n),e.appendChild(a),e}updateEdgeVisuals(t,e,i,s,o,r){let d=t.querySelector(".sci-flow-edge-bg"),n=t.querySelector(".sci-flow-edge-fg"),a=t.querySelector(".sci-flow-edge-overlay"),l=t.querySelector(".sci-flow-edge-symbols"),h=t.querySelector(".sci-flow-port-source"),m=t.querySelector(".sci-flow-port-target");[h,m].forEach(p=>{p.style.fill="var(--sf-bg)",p.style.stroke=e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)",p.style.strokeWidth="1.5px",p.style.opacity="0.6"}),h.setAttribute("cx",`${i.x}`),h.setAttribute("cy",`${i.y}`),m.setAttribute("cx",`${s.x}`),m.setAttribute("cy",`${s.y}`);let g=e.style?.lineStyle||"solid",w=e.style?.stroke,y=e.style?.strokeWidth,v=e.style?.animationType||"dash";if(n.style.stroke=w||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),n.style.strokeWidth=y?`${y}px`:e.selected?"3px":"2px",n.classList.remove("sci-flow-edge-animated-pulse","sci-flow-edge-animated-arrows","sci-flow-edge-animated-symbols"),a.style.display="none",l&&(l.style.display="none",l.setAttribute("dominant-baseline","middle"),l.setAttribute("alignment-baseline","middle")),n.style.animation="",e.animated)if(v==="pulse")n.classList.add("sci-flow-edge-animated-pulse"),n.style.strokeDasharray="none";else if(v==="arrows")n.classList.add("sci-flow-edge-animated-arrows");else if(v==="symbols"){if(l){l.style.display="block",l.style.fill=w||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),l.style.fontSize="12px",l.style.fontWeight="bold";let p=l.querySelector("textPath");if(p){for(;p.firstChild;)p.removeChild(p.firstChild);p.textContent="\xBB \xBB \xBB \xBB \xBB \xBB \xBB \xBB";let C=document.createElementNS("http://www.w3.org/2000/svg","animate");C.setAttribute("attributeName","startOffset"),C.setAttribute("from","-20%"),C.setAttribute("to","100%"),C.setAttribute("dur","3s"),C.setAttribute("repeatCount","indefinite"),p.appendChild(C)}}n.style.strokeDasharray="none"}else n.style.strokeDasharray="5, 5",n.style.animation="sf-dash-anim 1s linear infinite";else n.style.animation="none",g==="dashed"?n.style.strokeDasharray="8, 8":g==="dotted"?n.style.strokeDasharray="2, 4":n.style.strokeDasharray="none";let S=`${i.x},${i.y}|${s.x},${s.y}|${o}|${r.length}`,k=p=>{d.setAttribute("d",p),n.setAttribute("d",p)};if(o==="smart")if(this.routeCache.has(e.id)&&this.routingHashCache.get(e.id)===S)k(this.routeCache.get(e.id));else{let p=W({source:i,target:s,mode:"step"});k(p);let C=`job-${this.routerIdCounter.value++}`;this.pendingRoutes.set(C,A=>{this.routeCache.set(e.id,A),this.routingHashCache.set(e.id,S);let D=document.getElementById(`edge-group-${e.id}`);if(D){let b=D.querySelector(".sci-flow-edge-bg"),M=D.querySelector(".sci-flow-edge-fg"),f=D.querySelector(".sci-flow-edge-overlay");b&&M&&(b.setAttribute("d",A),M.setAttribute("d",A),f&&f.setAttribute("d",A))}}),this.routerWorker.postMessage({id:C,source:i,target:s,obstacles:r,padding:20})}else{let p=W({source:i,target:s,mode:o,obstacles:r});k(p),a.setAttribute("d",p),this.routeCache.set(e.id,p),this.routingHashCache.set(e.id,S)}}};function pt(){let c=`
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
    `,t=new Blob([c],{type:"application/javascript"});return new Worker(URL.createObjectURL(t))}var j=class extends z{svg;nodesGroup;edgesGroup;styleEl;routerWorker;pendingRoutes=new Map;routerIdCounter=0;routeCache=new Map;routingHashCache=new Map;nodeManager;edgeManager;constructor(t){super(t),this.container.classList.add("sci-flow-container"),this.routerWorker=pt(),this.routerWorker.onmessage=i=>{let{id:s,path:o}=i.data;this.pendingRoutes.has(s)&&(this.pendingRoutes.get(s)(o),this.pendingRoutes.delete(s))},this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.style.width="100%",this.svg.style.height="100%",this.svg.style.display="block",this.svg.style.position="absolute",this.svg.style.top="0",this.svg.style.left="0",this.svg.style.zIndex="1",this.svg.setAttribute("class","sci-flow-svg-renderer"),this.styleEl=document.createElement("style"),this.styleEl.textContent=lt,document.head.appendChild(this.styleEl),this.edgesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.edgesGroup.setAttribute("class","sci-flow-edges"),this.edgesGroup.style.transformOrigin="0 0",this.nodesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.nodesGroup.setAttribute("class","sci-flow-nodes"),this.nodesGroup.style.transformOrigin="0 0",this.svg.appendChild(this.edgesGroup),this.svg.appendChild(this.nodesGroup),this.container.appendChild(this.svg),this.nodeManager=new Z(this.nodesGroup);let e=this;this.edgeManager=new J(this.edgesGroup,this.routerWorker,this.routeCache,this.routingHashCache,this.pendingRoutes,{get value(){return e.routerIdCounter},set value(i){e.routerIdCounter=i}},this.getPortAnchor.bind(this))}render(t,e){let i=`translate(${t.viewport.x}, ${t.viewport.y}) scale(${t.viewport.zoom})`;this.edgesGroup.setAttribute("transform",i),this.nodesGroup.setAttribute("transform",i);let s=new Set(Array.from(this.nodesGroup.children).map(d=>d.id));this.nodeManager.reconcile(t.nodes,s,this.stateManager,e,t.direction||"horizontal"),s.forEach(d=>{document.getElementById(d)?.remove();let n=this.stateManager,a=d.replace("node-","");n?.onNodeUnmount&&n.onNodeUnmount(a)});let o=Array.from(t.nodes.values()).map(d=>({id:d.id,x:d.position.x,y:d.position.y,width:d.style?.width||140,height:d.style?.height||100})),r=new Set(Array.from(this.edgesGroup.children).map(d=>d.id));this.edgeManager.reconcile(t,r,o),r.forEach(d=>{document.getElementById(d)?.remove()}),this.renderDraftEdge(t,o)}renderDraftEdge(t,e){let i=document.getElementById("sci-flow-draft-edge");if(t.draftEdge){i||(i=document.createElementNS("http://www.w3.org/2000/svg","path"),i.id="sci-flow-draft-edge",i.setAttribute("class","sci-flow-edge sci-flow-draft-edge"),i.setAttribute("fill","none"),i.setAttribute("stroke","var(--sf-edge-animated)"),i.setAttribute("stroke-width","3"),i.setAttribute("stroke-dasharray","5, 5"),i.style.pointerEvents="none",this.edgesGroup.firstChild?this.edgesGroup.insertBefore(i,this.edgesGroup.firstChild):this.edgesGroup.appendChild(i));let s=t.nodes.get(t.draftEdge.sourceNodeId);if(s){let o=this.getPortAnchor(s,t.draftEdge.sourcePortId),r=t.draftEdge.targetPosition,d=e.filter(l=>l.id!==t.draftEdge?.sourceNodeId),n=t.defaultEdgeType||"bezier",a=W({source:o,target:r,mode:n,obstacles:d});i.setAttribute("d",a)}}else i&&i.remove()}getPortAnchor(t,e){return ht(t,e,this.nodesGroup)}getViewportElement(){return this.svg}destroy(){this.svg.remove(),this.styleEl.remove(),this.routerWorker.terminate()}};var X=class extends z{canvas;ctx;animationFrameId=null;state=null;registry=new Map;constructor(t){super(t),this.canvas=document.createElement("canvas"),this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.display="block",this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.zIndex="1",this.canvas.classList.add("sci-flow-canvas-renderer"),this.ctx=this.canvas.getContext("2d"),this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e),this.state&&this.render(this.state,this.registry)};render(t,e){this.state=t,this.registry=e,this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.animationFrameId=requestAnimationFrame(()=>this.draw(t,e))}draw(t,e){if(!this.ctx)return;let i=this.canvas.getBoundingClientRect();if(this.ctx.clearRect(0,0,i.width,i.height),this.ctx.save(),this.ctx.translate(t.viewport.x,t.viewport.y),this.ctx.scale(t.viewport.zoom,t.viewport.zoom),t.smartGuides&&t.smartGuides.length>0){this.ctx.strokeStyle="#e20f86",this.ctx.lineWidth=1/t.viewport.zoom,this.ctx.setLineDash([4/t.viewport.zoom,4/t.viewport.zoom]);for(let s of t.smartGuides)this.ctx.beginPath(),s.x!==void 0&&(this.ctx.moveTo(s.x,-1e5),this.ctx.lineTo(s.x,1e5)),s.y!==void 0&&(this.ctx.moveTo(-1e5,s.y),this.ctx.lineTo(1e5,s.y)),this.ctx.stroke()}this.ctx.restore()}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.canvas.remove()}};var _=class extends z{canvas;ctx;options;constructor(t){super(t),this.options={gridSize:t.gridSize||20,gridColor:t.gridColor||"rgba(100, 100, 100, 0.2)"},this.canvas=document.createElement("canvas"),this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.pointerEvents="none",this.canvas.style.zIndex="0",this.canvas.classList.add("sci-flow-grid"),this.ctx=this.canvas.getContext("2d"),this.container.firstChild?this.container.insertBefore(this.canvas,this.container.firstChild):this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e)};render(t){if(!this.ctx)return;let{x:e,y:i,zoom:s}=t.viewport,o=this.canvas.getBoundingClientRect();this.ctx.clearRect(0,0,o.width,o.height);let r=1;for(;this.options.gridSize*s*r<15;)r*=2;let d=this.options.gridSize*s*r,n=getComputedStyle(this.container).getPropertyValue("--sf-grid-dot").trim()||"#555";this.ctx.fillStyle=n;let a=1.5,l=e%d,h=i%d;for(let m=l;m<o.width;m+=d)for(let g=h;g<o.height;g+=d)this.ctx.fillRect(m,g,a,a)}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.canvas.remove()}};var Q=class{constructor(t){this.stateManager=t}handleWheel(t){t.preventDefault();let e=this.stateManager.getState(),{x:i,y:s,zoom:o}=e.viewport,d=-t.deltaY*.001,n=Math.min(Math.max(o+d,.1),5),a=t.currentTarget.getBoundingClientRect(),l=t.clientX-a.left,h=t.clientY-a.top,m=(l-i)/o,g=(h-s)/o,w=l-m*n,y=h-g*n;this.stateManager.setViewport({x:w,y,zoom:n})}handlePan(t,e){let i=t.clientX-e.x,s=t.clientY-e.y,o=this.stateManager.getState();return this.stateManager.setViewport({...o.viewport,x:o.viewport.x+i,y:o.viewport.y+s}),{x:t.clientX,y:t.clientY}}};var tt=class{constructor(t,e){this.container=t;this.stateManager=e}selectionBoxEl=null;selectionStart=null;startSelection(t){this.selectionStart=t,this.selectionBoxEl=document.createElement("div"),this.selectionBoxEl.style.position="absolute",this.selectionBoxEl.style.border="1px solid var(--sf-edge-active, #00f2ff)",this.selectionBoxEl.style.backgroundColor="rgba(0, 242, 255, 0.1)",this.selectionBoxEl.style.pointerEvents="none",this.selectionBoxEl.style.zIndex="1000",this.container.appendChild(this.selectionBoxEl)}updateSelection(t,e){if(!this.selectionStart||!this.selectionBoxEl)return;let i=Math.min(this.selectionStart.x,t.x),s=Math.min(this.selectionStart.y,t.y),o=Math.abs(this.selectionStart.x-t.x),r=Math.abs(this.selectionStart.y-t.y);this.selectionBoxEl.style.left=`${i}px`,this.selectionBoxEl.style.top=`${s}px`,this.selectionBoxEl.style.width=`${o}px`,this.selectionBoxEl.style.height=`${r}px`;let d=this.container.getBoundingClientRect(),n=this.screenToFlow(this.selectionStart,e,d),a=this.screenToFlow(t,e,d),l=Math.min(n.x,a.x),h=Math.min(n.y,a.y),m=Math.max(n.x,a.x),g=Math.max(n.y,a.y);this.performSelection(l,h,m,g)}endSelection(){this.selectionBoxEl&&(this.selectionBoxEl.remove(),this.selectionBoxEl=null),this.selectionStart=null}performSelection(t,e,i,s){let o=this.stateManager.getState(),r=[],d=[];o.nodes.forEach(n=>{let a=n.style?.width||200,l=n.style?.height||150;n.position.x>=t&&n.position.x+a<=i&&n.position.y>=e&&n.position.y+l<=s&&r.push(n.id)}),o.edges.forEach(n=>{let a=o.nodes.get(n.source),l=o.nodes.get(n.target);a&&l&&a.position.x>=t&&a.position.x<=i&&a.position.y>=e&&a.position.y<=s&&l.position.x>=t&&l.position.x<=i&&l.position.y>=e&&l.position.y<=s&&d.push(n.id)}),this.stateManager.setSelection(r,d)}screenToFlow(t,e,i){return{x:(t.x-i.left-e.x)/e.zoom,y:(t.y-i.top-e.y)/e.zoom}}};var et=class{constructor(t,e){this.container=t;this.stateManager=e}draftSourceNodeId=null;draftSourcePortId=null;startDraft(t,e,i){this.draftSourceNodeId=t,this.draftSourcePortId=e,this.container.setPointerCapture(i),this.container.classList.add("sci-flow-dragging-edge"),this.highlightValidPorts()}highlightValidPorts(){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let t=this.container.querySelectorAll(".sci-flow-port"),e=Array.from(t).find(o=>o.dataset.nodeid===this.draftSourceNodeId&&o.dataset.portid===this.draftSourcePortId),i=e?.dataset.dataType||"any",s=e?.dataset.portType;t.forEach(o=>{let r=o,d=r.dataset.nodeid,n=r.dataset.portid,a=r.dataset.dataType||"any",l=r.dataset.portType;if(d===this.draftSourceNodeId&&n===this.draftSourcePortId){r.classList.add("sci-flow-port-target-valid");return}d!==this.draftSourceNodeId&&s!==l&&(i==="any"||a==="any"||i===a)?r.classList.add("sci-flow-port-target-valid"):r.classList.add("sci-flow-port-target-invalid")})}clearPortHighlights(){this.container.querySelectorAll(".sci-flow-port").forEach(e=>{e.classList.remove("sci-flow-port-target-valid","sci-flow-port-target-invalid")})}updateDraft(t){!this.draftSourceNodeId||!this.draftSourcePortId||this.stateManager.setDraftEdge(this.draftSourceNodeId,this.draftSourcePortId,t)}endDraft(t){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let s=document.elementsFromPoint(t.clientX,t.clientY).find(o=>o.closest(".sci-flow-port"))?.closest(".sci-flow-port");if(s&&s.dataset.nodeid&&s.dataset.portid){let o=s.classList.contains("sci-flow-port-target-valid"),r=s.dataset.nodeid,d=s.dataset.portid;if(o&&r!==this.draftSourceNodeId){let n=this.stateManager.getState(),a=!1;for(let l of n.edges.values())if(l.source===this.draftSourceNodeId&&l.target===r&&l.sourceHandle===this.draftSourcePortId&&l.targetHandle===d){a=!0;break}a||this.stateManager.addEdge({id:`edge-${Date.now()}`,source:this.draftSourceNodeId,sourceHandle:this.draftSourcePortId,target:r,targetHandle:d,type:n.defaultEdgeType,style:n.defaultEdgeStyle?{...n.defaultEdgeStyle}:void 0})}}this.draftSourceNodeId=null,this.draftSourcePortId=null,this.stateManager.clearDraftEdge(),this.container.classList.remove("sci-flow-dragging-edge"),this.clearPortHighlights()}isDrafting(){return!!this.draftSourceNodeId}};function gt(c,t){let e=new Set,i=[...t];for(;i.length>0;){let s=i.pop();for(let[o,r]of c.entries())r.parentId===s&&!e.has(o)&&(e.add(o),i.push(o))}return Array.from(e)}var it=class{constructor(t,e,i){this.container=t;this.stateManager=e;this.options=i}isDraggingNodes=!1;draggedNodeIds=[];lastDragPos=null;startDrag(t,e,i){this.isDraggingNodes=!0,this.draggedNodeIds=t,this.lastDragPos=e,this.container.setPointerCapture(i),this.container.classList.add("sci-flow-dragging")}updateDrag(t,e){if(!this.isDraggingNodes||!this.lastDragPos)return;let i=this.stateManager.getState(),s=t.x-this.lastDragPos.x,o=t.y-this.lastDragPos.y,r=[];if(this.draggedNodeIds.length===1&&!e.altKey){let d=this.draggedNodeIds[0],n=i.nodes.get(d);if(n){let a=n.position.x+s,l=n.position.y+o,h=n.style?.width||200,m=n.style?.height||150,g=!1,w=!1,y=10/i.viewport.zoom;if(this.options.showSmartGuides){let v=a+h/2,S=l+m/2;for(let[k,p]of i.nodes.entries()){if(k===d)continue;let C=p.style?.width||200,A=p.style?.height||150,D=p.position.x+C/2,b=p.position.y+A/2;if(!g){let M=[{target:p.position.x,guide:p.position.x},{target:D,guide:D},{target:p.position.x+C,guide:p.position.x+C}];for(let f of M){if(Math.abs(a-f.target)<y){a=f.target,g=!0,r.push({x:f.guide});break}if(Math.abs(v-f.target)<y){a=f.target-h/2,g=!0,r.push({x:f.guide});break}if(Math.abs(a+h-f.target)<y){a=f.target-h,g=!0,r.push({x:f.guide});break}}}if(!w){let M=[{target:p.position.y,guide:p.position.y},{target:b,guide:b},{target:p.position.y+A,guide:p.position.y+A}];for(let f of M){if(Math.abs(l-f.target)<y){l=f.target,w=!0,r.push({y:f.guide});break}if(Math.abs(S-f.target)<y){l=f.target-m/2,w=!0,r.push({y:f.guide});break}if(Math.abs(l+m-f.target)<y){l=f.target-m,w=!0,r.push({y:f.guide});break}}}}}this.options.snapToGrid&&!g&&(a=Math.round(a/this.options.gridSize)*this.options.gridSize),this.options.snapToGrid&&!w&&(l=Math.round(l/this.options.gridSize)*this.options.gridSize),s=a-n.position.x,o=l-n.position.y}}else this.options.snapToGrid&&!e.altKey&&(s=Math.round(s/this.options.gridSize)*this.options.gridSize,o=Math.round(o/this.options.gridSize)*this.options.gridSize);this.stateManager.setSmartGuides(r.length>0?r:void 0),(s!==0||o!==0)&&(new Set([...this.draggedNodeIds,...gt(i.nodes,this.draggedNodeIds)]).forEach(n=>{let a=i.nodes.get(n);a&&this.stateManager.updateNodePosition(n,a.position.x+s,a.position.y+o,!0)}),this.lastDragPos={x:this.lastDragPos.x+s,y:this.lastDragPos.y+o})}endDrag(t){this.isDraggingNodes&&(this.isDraggingNodes=!1,this.container.classList.remove("sci-flow-dragging"),this.lastDragPos&&(this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot()),this.lastDragPos=null,this.stateManager.clearSmartGuides(),this.container.hasPointerCapture(t)&&this.container.releasePointerCapture(t))}isDragging(){return this.isDraggingNodes}};var st=class{constructor(t){this.stateManager=t}handleKeyDown(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState();if((t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="a"){t.preventDefault(),this.stateManager.setSelection(Array.from(e.nodes.keys()),[]);return}if(t.key==="Delete"||t.key==="Backspace"){t.preventDefault();let d=Array.from(e.nodes.values()).filter(a=>a.selected).map(a=>a.id),n=Array.from(e.edges.values()).filter(a=>a.selected).map(a=>a.id);d.forEach(a=>this.stateManager.removeNode(a)),n.forEach(a=>this.stateManager.removeEdge(a));return}let i=navigator.platform.toUpperCase().indexOf("MAC")>=0,s=i&&t.metaKey&&t.shiftKey&&t.code==="KeyZ"||!i&&t.ctrlKey&&t.code==="KeyY";if((t.metaKey||t.ctrlKey)&&t.code==="KeyZ"&&!s){t.preventDefault(),this.stateManager.undo();return}else if(s){t.preventDefault(),this.stateManager.redo();return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(t.key)){let d=Array.from(e.nodes.values()).filter(n=>n.selected);if(d.length>0){t.preventDefault();let n=t.shiftKey?10:1;d.forEach(a=>{let l=a.position.x,h=a.position.y;t.key==="ArrowUp"&&(h-=n),t.key==="ArrowDown"&&(h+=n),t.key==="ArrowLeft"&&(l-=n),t.key==="ArrowRight"&&(l+=n),this.stateManager.updateNodePosition(a.id,l,h,!0)}),this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot();return}}}handleCopy(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState(),i=Array.from(e.nodes.values()).filter(r=>r.selected),s=Array.from(e.edges.values()).filter(r=>r.selected);if(i.length===0)return;let o={version:"sci-flow-1.0",nodes:i,edges:s};t.clipboardData&&(t.clipboardData.setData("application/json",JSON.stringify(o)),t.preventDefault())}handlePaste(t){if(!(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)&&t.clipboardData)try{let e=t.clipboardData.getData("application/json");if(!e)return;let i=JSON.parse(e);if(i.version==="sci-flow-1.0"){t.preventDefault();let s=30,o=[],r=new Map;i.nodes.forEach(n=>{let a=`${n.id}-copy-${Date.now()}`;r.set(n.id,a),o.push({...n,id:a,position:{x:n.position.x+s,y:n.position.y+s},selected:!0})}),this.stateManager.setSelection([],[]),o.forEach(n=>this.stateManager.addNode(n));let d=o.map(n=>n.id);this.stateManager.setSelection(d,[]),this.stateManager.saveSnapshot()}}catch(e){console.error("Paste failed",e)}}};var ot=class{container;stateManager;panZoom;selection;connection;drag;shortcuts;isPanning=!1;lastPointerPos={x:0,y:0};isSpacePressed=!1;cleanupEvents=[];constructor({container:t,stateManager:e,snapToGrid:i=!0,gridSize:s=20,showSmartGuides:o=!0}){this.container=t,this.stateManager=e,this.panZoom=new Q(e),this.selection=new tt(t,e),this.connection=new et(t,e),this.drag=new it(t,e,{snapToGrid:i,gridSize:s,showSmartGuides:o}),this.shortcuts=new st(e),this.bindEvents()}bindEvents(){this.container.style.touchAction="none";let t=n=>this.panZoom.handleWheel(n),e=this.handlePointerDown.bind(this),i=this.handlePointerMove.bind(this),s=this.handlePointerUp.bind(this),o=n=>{n.code==="Space"&&(this.isSpacePressed=!0,this.container.style.cursor="grab"),this.shortcuts.handleKeyDown(n)},r=n=>{n.code==="Space"&&(this.isSpacePressed=!1,this.container.style.cursor="default")},d=n=>n.preventDefault();this.container.addEventListener("wheel",t,{passive:!1}),this.container.addEventListener("pointerdown",e),this.container.addEventListener("contextmenu",d),window.addEventListener("pointermove",i),window.addEventListener("pointerup",s),window.addEventListener("keydown",o),window.addEventListener("keyup",r),window.addEventListener("copy",n=>this.shortcuts.handleCopy(n)),window.addEventListener("paste",n=>this.shortcuts.handlePaste(n)),this.cleanupEvents=[()=>this.container.removeEventListener("wheel",t),()=>this.container.removeEventListener("pointerdown",e),()=>this.container.removeEventListener("contextmenu",d),()=>window.removeEventListener("pointermove",i),()=>window.removeEventListener("pointerup",s),()=>window.removeEventListener("keydown",o),()=>window.removeEventListener("keyup",r)]}handlePointerDown(t){let e=t.target,i=e.closest(".sci-flow-port");if(i?.dataset.nodeid&&i?.dataset.portid){this.connection.startDraft(i.dataset.nodeid,i.dataset.portid,t.pointerId);return}let s=this.stateManager.getState(),o=this.container.getBoundingClientRect(),r=this.screenToFlow({x:t.clientX,y:t.clientY},s.viewport,o),d=this.findNodeAt(r);if(d){let a=s.nodes.get(d),l=a?.selected?Array.from(s.nodes.values()).filter(h=>h.selected).map(h=>h.id):[d];!a?.selected&&!t.shiftKey?this.stateManager.setSelection([d],[]):t.shiftKey&&this.stateManager.appendSelection(d),this.drag.startDrag(l,r,t.pointerId);return}let n=e.closest(".sci-flow-edge-bg, .sci-flow-edge-fg");if(n&&n.parentElement&&n.parentElement.id.startsWith("edge-group-")){let a=n.parentElement.id.replace("edge-group-","");t.shiftKey?this.stateManager.appendSelection(void 0,a):this.stateManager.setSelection([],[a]);return}if(t.button===1||t.button===2||t.button===0&&this.isSpacePressed){this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing";return}t.button===0&&!this.isSpacePressed&&(t.shiftKey?this.selection.startSelection({x:t.clientX,y:t.clientY}):(this.stateManager.setSelection([],[]),this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing"))}handlePointerMove(t){let e=this.stateManager.getState(),i=this.container.getBoundingClientRect(),s=this.screenToFlow({x:t.clientX,y:t.clientY},e.viewport,i);this.connection.isDrafting()?this.connection.updateDraft(s):this.drag.isDragging()?this.drag.updateDrag(s,t):this.isPanning?this.lastPointerPos=this.panZoom.handlePan(t,this.lastPointerPos):this.selection.updateSelection({x:t.clientX,y:t.clientY},e.viewport)}handlePointerUp(t){this.connection.endDraft(t),this.drag.endDrag(t.pointerId),this.selection.endSelection(),this.isPanning=!1,this.container.style.cursor=this.isSpacePressed?"grab":"default",this.container.hasPointerCapture(t.pointerId)&&this.container.releasePointerCapture(t.pointerId)}findNodeAt(t){let e=this.stateManager.getState(),i=Array.from(e.nodes.values()).reverse();for(let s of i){let o=s.style?.width||200,r=s.style?.height||150;if(t.x>=s.position.x&&t.x<=s.position.x+o&&t.y>=s.position.y&&t.y<=s.position.y+r)return s.id}return null}screenToFlow(t,e,i){return{x:(t.x-i.left-e.x)/e.zoom,y:(t.y-i.top-e.y)/e.zoom}}destroy(){this.cleanupEvents.forEach(t=>t())}};var nt=class{constructor(t,e){this.container=t;this.stateManagerId=e;this.styleInjector=document.createElement("style"),this.styleInjector.id="sci-flow-theme-injector",this.container.appendChild(this.styleInjector)}currentTheme=F;styleInjector;setTheme(t){let e=F;t==="dark"?e=Y:t==="system"?e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?Y:F:typeof t=="object"&&(e=t.name==="dark"?Y:F),this.currentTheme=typeof t=="object"?{name:t.name||e.name,colors:{...e.colors,...t.colors||{}}}:e,this.applyThemeVariables()}applyThemeVariables(){if(!this.styleInjector)return;let t=this.currentTheme.colors,e=`
          .sci-flow-container-${this.stateManagerId} {
              --sf-bg: ${t.background};
              --sf-grid-dot: ${t.gridDot};
              --sf-node-bg: ${t.nodeBackground};
              --sf-node-border: ${t.nodeBorder};
              --sf-node-text: ${t.nodeText};
              --sf-node-header-text: ${t.nodeHeaderText};
              --sf-node-header-ops: ${t.nodeHeaderOps};
              --sf-node-header-input: ${t.nodeHeaderInput};
              --sf-node-header-output: ${t.nodeHeaderOutput};
              --sf-node-selected: ${t.nodeSelected};
              --sf-edge-line: ${t.edgeLine};
              --sf-edge-active: ${t.edgeActive};
              --sf-edge-animated: ${t.edgeAnimated};
              --sf-port-bg: ${t.portBackground};
              --sf-port-border: ${t.portBorder};
              --sf-port-active: ${t.portActive};
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
        `;this.styleInjector.innerHTML=e,this.container.classList.add(`sci-flow-container-${this.stateManagerId}`)}destroy(){this.styleInjector.remove()}};var q=class{container;stateManager;interactionManager;renderer;gridRenderer;options;unsubscribe;themeManager;constructor(t){this.options={renderer:"auto",autoSwitchThreshold:1e3,theme:"light",...t},this.container=this.options.container,getComputedStyle(this.container).position==="static"&&(this.container.style.position="relative"),this.stateManager=new V,this.themeManager=new nt(this.container,this.stateManager.id),this.themeManager.setTheme(this.options.theme),this.options.direction&&this.stateManager.setDirection(this.options.direction),this.interactionManager=new ot({container:this.container,stateManager:this.stateManager,minZoom:this.options.minZoom,maxZoom:this.options.maxZoom}),this.gridRenderer=new _({container:this.container});let e=this.options.renderer==="auto"?"svg":this.options.renderer||"svg";this.renderer=this.createRenderer(e),this.renderer.stateManager=this.stateManager,this.unsubscribe=this.stateManager.subscribe(i=>{this.gridRenderer.render(i),this.renderer.render(i,this.stateManager.getNodeRegistry()),this.checkRendererThreshold(i.nodes.size)})}createRenderer(t){return t==="svg"?new j({container:this.container}):new X({container:this.container})}checkRendererThreshold(t){if(this.options.renderer==="auto"){let e=this.options.autoSwitchThreshold||1e3,i=this.renderer instanceof X;t>e&&!i?this.switchRenderer("canvas"):t<=e&&i&&this.switchRenderer("svg")}}switchRenderer(t){this.renderer.destroy(),this.renderer=this.createRenderer(t),this.renderer.render(this.stateManager.getState(),this.stateManager.getNodeRegistry())}setTheme(t){this.themeManager.setTheme(t)}setDirection(t){this.stateManager.setDirection(t)}setNodes(t){this.stateManager.setNodes(t)}setEdges(t){this.stateManager.setEdges(t)}addNode(t){this.stateManager.addNode(t)}removeNode(t){this.stateManager.removeNode(t)}addEdge(t){this.stateManager.addEdge(t)}removeEdge(t){this.stateManager.removeEdge(t)}getState(){return this.stateManager.getState()}forceUpdate(){this.stateManager.forceUpdate()}setDefaultEdgeType(t){this.stateManager.setDefaultEdgeType(t)}setDefaultEdgeStyle(t){this.stateManager.setDefaultEdgeStyle(t)}subscribe(t){return this.stateManager.subscribe(t)}updateNodePosition(t,e,i){this.stateManager.updateNodePosition(t,e,i)}fitView(t=50){let e=this.stateManager.getState();if(e.nodes.size===0)return;let i=1/0,s=1/0,o=-1/0,r=-1/0;e.nodes.forEach(p=>{let C=p.style?.width||200,A=p.style?.height||150;p.position.x<i&&(i=p.position.x),p.position.y<s&&(s=p.position.y),p.position.x+C>o&&(o=p.position.x+C),p.position.y+A>r&&(r=p.position.y+A)});let d=o-i,n=r-s;if(d<=0||n<=0)return;let a=this.container.getBoundingClientRect(),l=a.width-t*2,h=a.height-t*2,m=l/d,g=h/n,w=Math.min(Math.max(Math.min(m,g),.1),2),y=i+d/2,v=s+n/2,S=a.width/2-y*w,k=a.height/2-v*w;this.stateManager.setViewport({x:S,y:k,zoom:w})}centerNode(t){let e=this.stateManager.getState(),i=e.nodes.get(t);if(!i)return;let s=i.style?.width||200,o=i.style?.height||150,r=i.position.x+s/2,d=i.position.y+o/2,n=this.container.getBoundingClientRect(),a=e.viewport.zoom,l=n.width/2-r*a,h=n.height/2-d*a;this.stateManager.setViewport({x:l,y:h,zoom:a})}toJSON(){return this.stateManager.toJSON()}fromJSON(t){this.stateManager.fromJSON(t)}destroy(){this.unsubscribe(),this.interactionManager.destroy(),this.themeManager.destroy(),this.gridRenderer.destroy(),this.renderer.destroy()}};var at=class{canvas;ctx;stateManager;options;isDragging=!1;unsubscribe;constructor(t){this.stateManager=t.stateManager,this.options={container:t.container,stateManager:t.stateManager,width:t.width||150,height:t.height||100,nodeColor:t.nodeColor||"#rgba(100, 100, 100, 0.5)",viewportColor:t.viewportColor||"rgba(0, 123, 255, 0.4)",backgroundColor:t.backgroundColor||"#111"},this.canvas=document.createElement("canvas"),this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.canvas.style.backgroundColor=this.options.backgroundColor,this.canvas.style.border="1px solid #333",this.canvas.style.borderRadius="4px",this.canvas.style.cursor="crosshair",this.options.container.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.unsubscribe=this.stateManager.subscribe(()=>this.render()),this.bindEvents(),this.render()}bindEvents(){this.canvas.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp)}unbindEvents(){this.canvas.removeEventListener("pointerdown",this.onPointerDown),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp)}onPointerDown=t=>{this.isDragging=!0,this.canvas.setPointerCapture(t.pointerId),this.panToEvent(t)};onPointerMove=t=>{this.isDragging&&this.panToEvent(t)};onPointerUp=t=>{this.isDragging=!1,this.canvas.hasPointerCapture(t.pointerId)&&this.canvas.releasePointerCapture(t.pointerId)};panToEvent(t){let e=this.stateManager.getState(),i=this.canvas.getBoundingClientRect(),s=(t.clientX-i.left)/i.width,o=(t.clientY-i.top)/i.height;s=Math.max(0,Math.min(1,s)),o=Math.max(0,Math.min(1,o));let r=this.getWorldBounds(e),d=r.minX+s*r.width,n=r.minY+o*r.height,a=window.innerWidth,l=window.innerHeight,h=-d*e.viewport.zoom+a/2,m=-n*e.viewport.zoom+l/2;this.stateManager.setViewport({x:h,y:m,zoom:e.viewport.zoom})}getWorldBounds(t){if(t.nodes.size===0)return{minX:0,minY:0,maxX:1e3,maxY:1e3,width:1e3,height:1e3};let e=1/0,i=1/0,s=-1/0,o=-1/0;return t.nodes.forEach(r=>{let d=r.style?.width||200,n=r.style?.height||150;e=Math.min(e,r.position.x),i=Math.min(i,r.position.y),s=Math.max(s,r.position.x+d),o=Math.max(o,r.position.y+n)}),e-=500,i-=500,s+=500,o+=500,{minX:e,minY:i,maxX:s,maxY:o,width:s-e,height:o-i}}render(){if(!this.ctx)return;let t=this.stateManager.getState();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let e=this.getWorldBounds(t);if(e.width===0||e.height===0)return;let i=this.canvas.width/e.width,s=this.canvas.height/e.height,o=Math.min(i,s),r=(this.canvas.width-e.width*o)/2,d=(this.canvas.height-e.height*o)/2;this.ctx.save(),this.ctx.translate(r,d),this.ctx.scale(o,o),this.ctx.translate(-e.minX,-e.minY),this.ctx.fillStyle=this.options.nodeColor,t.nodes.forEach(w=>{let y=w.style?.width||200,v=w.style?.height||150;this.ctx.beginPath(),this.ctx.roundRect(w.position.x,w.position.y,y,v,10),this.ctx.fill()});let n=window.innerWidth,a=window.innerHeight,l=-t.viewport.x/t.viewport.zoom,h=-t.viewport.y/t.viewport.zoom,m=(n-t.viewport.x)/t.viewport.zoom,g=(a-t.viewport.y)/t.viewport.zoom;this.ctx.strokeStyle=this.options.viewportColor,this.ctx.lineWidth=2/o,this.ctx.fillStyle=this.options.viewportColor,this.ctx.beginPath(),this.ctx.rect(l,h,m-l,g-h),this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()}destroy(){this.unbindEvents(),this.unsubscribe(),this.canvas.remove()}};var Et=c=>new q(c);0&&(module.exports={BaseRenderer,CanvasRenderer,Minimap,SVGRenderer,SciFlow,StateManager,darkTheme,lightTheme,mount});
//# sourceMappingURL=index.cjs.map
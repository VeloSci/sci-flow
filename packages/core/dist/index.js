var X={name:"light",colors:{background:"#f8f9fa",gridDot:"#d7d9dd",nodeBackground:"#ffffff",nodeBorder:"#e2e8f0",nodeText:"#1e293b",edgeLine:"#94a3b8",edgeActive:"#3b82f6",edgeAnimated:"#3b82f6",portBackground:"#e2e8f0",portBorder:"#94a3b8",contextMenuBackground:"#ffffff",contextMenuText:"#1e293b",contextMenuHover:"#f1f5f9",selectionBoxBackground:"rgba(59, 130, 246, 0.1)",selectionBoxBorder:"rgba(59, 130, 246, 0.5)"}},V={name:"dark",colors:{background:"#0f172a",gridDot:"#334155",nodeBackground:"#1e293b",nodeBorder:"#334155",nodeText:"#f8fafc",edgeLine:"#475569",edgeActive:"#60a5fa",edgeAnimated:"#60a5fa",portBackground:"#1e293b",portBorder:"#64748b",contextMenuBackground:"#1e293b",contextMenuText:"#f1f5f9",contextMenuHover:"#334155",selectionBoxBackground:"rgba(96, 165, 250, 0.1)",selectionBoxBorder:"rgba(96, 165, 250, 0.5)"}};var O=class{state;listeners=new Set;id;history=[];historyIndex=-1;maxHistory=50;isRestoringHistory=!1;nodeRegistry=new Map;onNodesChange;onEdgesChange;onNodeContextMenu;onEdgeContextMenu;onPaneContextMenu;onConnect;onNodeMount;onNodeUnmount;constructor(t){this.id=Math.random().toString(36).substring(2,9),this.state={nodes:new Map,edges:new Map,viewport:{x:0,y:0,zoom:1},defaultEdgeType:"bezier",defaultEdgeStyle:{lineStyle:"solid"},...t}}registerNodeType(t){this.nodeRegistry.set(t.type,t)}getNodeDefinition(t){return this.nodeRegistry.get(t)}getRegisteredNodeTypes(){return Array.from(this.nodeRegistry.keys())}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){this.listeners.forEach(t=>t(this.state))}forceUpdate(){this.notify()}setNodes(t){this.state.nodes.clear(),t.forEach(e=>this.state.nodes.set(e.id,e)),this.notify()}setSelection(t,e){this.state.nodes.forEach(s=>s.selected=!1),this.state.edges.forEach(s=>s.selected=!1),t.forEach(s=>{let i=this.state.nodes.get(s);i&&(i.selected=!0)}),e.forEach(s=>{let i=this.state.edges.get(s);i&&(i.selected=!0)}),this.notify()}appendSelection(t,e){if(t){let s=this.state.nodes.get(t);s&&(s.selected=!s.selected)}if(e){let s=this.state.edges.get(e);s&&(s.selected=!s.selected)}this.notify()}addNode(t){this.state.nodes.set(t.id,t),this.notify()}setDraftEdge(t,e,s){this.state.draftEdge={sourceNodeId:t,sourcePortId:e,targetPosition:s},this.notify()}clearDraftEdge(){this.state.draftEdge=void 0,this.notify()}setDefaultEdgeType(t){this.state.defaultEdgeType=t,this.notify()}setDefaultEdgeStyle(t){this.state.defaultEdgeStyle={...this.state.defaultEdgeStyle,...t},this.notify()}setSmartGuides(t){this.state.smartGuides=t,this.notify()}clearSmartGuides(){this.state.smartGuides=void 0,this.notify()}saveSnapshot(){if(this.isRestoringHistory)return;let t=JSON.stringify({nodes:Array.from(this.state.nodes.entries()),edges:Array.from(this.state.edges.entries())});this.historyIndex<this.history.length-1&&(this.history=this.history.slice(0,this.historyIndex+1)),!(this.history.length>0&&this.history[this.historyIndex]===t)&&(this.history.push(t),this.history.length>this.maxHistory?this.history.shift():this.historyIndex++)}undo(){this.historyIndex>0&&(this.historyIndex--,this.restoreSnapshot(this.history[this.historyIndex]))}redo(){this.historyIndex<this.history.length-1&&(this.historyIndex++,this.restoreSnapshot(this.history[this.historyIndex]))}restoreSnapshot(t){if(t){this.isRestoringHistory=!0;try{let e=JSON.parse(t);this.state.nodes=new Map(e.nodes),this.state.edges=new Map(e.edges),this.notify()}catch(e){console.error("Failed to restore history snapshot",e)}this.isRestoringHistory=!1}}removeNode(t){let e=this.getDescendants([t]),s=new Set([t,...e]);for(let i of s){this.state.nodes.delete(i);for(let[o,r]of this.state.edges.entries())(r.source===i||r.target===i)&&this.state.edges.delete(o)}this.notify(),this.saveSnapshot(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values()))}getDescendants(t){let e=new Set,s=[...t];for(;s.length>0;){let i=s.pop();for(let[o,r]of this.state.nodes.entries())r.parentId===i&&!e.has(o)&&(e.add(o),s.push(o))}return Array.from(e)}updateNodePosition(t,e,s,i=!1){let o=this.state.nodes.get(t);o&&(o.position={x:e,y:s},this.notify(),i||this.onNodesChange?.(Array.from(this.state.nodes.values())))}commitNodePositions(){this.onNodesChange?.(Array.from(this.state.nodes.values()))}setEdges(t){this.state.edges.clear(),t.forEach(e=>this.state.edges.set(e.id,e)),this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values()))}addEdge(t){this.state.edges.set(t.id,t),this.notify(),this.saveSnapshot(),this.onEdgesChange?.(Array.from(this.state.edges.values()))}removeEdge(t){this.state.edges.delete(t),this.notify()}setViewport(t){this.state.viewport=t,this.notify()}toJSON(){return JSON.stringify({version:"sci-flow-1.0",nodes:Array.from(this.state.nodes.values()),edges:Array.from(this.state.edges.values()),viewport:this.state.viewport})}fromJSON(t){try{let e=JSON.parse(t);e.version!=="sci-flow-1.0"&&console.warn("Unknown or unsupported SciFlow JSON version:",e.version),this.state.nodes.clear(),Array.isArray(e.nodes)&&e.nodes.forEach(s=>this.state.nodes.set(s.id,s)),this.state.edges.clear(),Array.isArray(e.edges)&&e.edges.forEach(s=>this.state.edges.set(s.id,s)),e.viewport&&(this.state.viewport=e.viewport),this.notify(),this.onNodesChange?.(Array.from(this.state.nodes.values())),this.onEdgesChange?.(Array.from(this.state.edges.values())),this.saveSnapshot()}catch(e){console.error("Failed to parse SciFlow JSON",e)}}};var R=class{container;constructor(t){this.container=t.container}};function st(c,t,e,s=20){let i=new Set,o=new Set,r=c.x,d=c.y,n=t.x,a=t.y;i.add(r),i.add(n),o.add(d),o.add(a),i.add(r+(n-r)/2),o.add(d+(a-d)/2),i.add(r+s),i.add(r-s),o.add(d+s),o.add(d-s),i.add(n+s),i.add(n-s),o.add(a+s),o.add(a-s);for(let h of e)i.add(h.x),i.add(h.x+h.width),i.add(h.x-s),i.add(h.x+h.width+s),o.add(h.y),o.add(h.y+h.height),o.add(h.y-s),o.add(h.y+h.height+s);let l=Array.from(i).sort((h,g)=>h-g),p=Array.from(o).sort((h,g)=>h-g),m=(h,g)=>{for(let P of e){let D=P.x-1,B=P.x+P.width+1,G=P.y-1,M=P.y+P.height+1;if(h.x===g.x){if(h.x>D&&h.x<B){let E=Math.min(h.y,g.y),k=Math.max(h.y,g.y);if(E<M&&k>G)return!0}}else if(h.y>G&&h.y<M){let E=Math.min(h.x,g.x),k=Math.max(h.x,g.x);if(E<B&&k>D)return!0}}return!1},y=(h,g)=>g*l.length+h,x=h=>({xi:h%l.length,yi:Math.floor(h/l.length)}),S=p.indexOf(d),b=p.indexOf(a),$=l.indexOf(r),T=l.indexOf(n),f=(h,g)=>{let P=h.x+(g.x-h.x)/2;return`M ${h.x},${h.y} L ${P},${h.y} L ${P},${g.y} L ${g.x},${g.y}`};if($===-1||S===-1||T===-1||b===-1)return f(c,t);let I=y($,S),v=y(T,b),C=new Set([I]),N=new Set,w=new Map,u=new Map,L=new Map;for(w.set(I,0),u.set(I,Math.abs(t.x-c.x)+Math.abs(t.y-c.y));C.size>0;){let h=-1,g=1/0;for(let M of C){let E=u.get(M)??1/0;E<g&&(g=E,h=M)}if(h===v){let M=[],E=h;for(;E!==I;){let{xi:A,yi:H}=x(E);M.unshift({x:l[A],y:p[H]}),E=L.get(E)}M.unshift({x:c.x,y:c.y});let k=[M[0]];for(let A=1;A<M.length-1;A++){let H=M[A-1],F=M[A+1],z=M[A];H.x===z.x&&z.x===F.x||H.y===z.y&&z.y===F.y||k.push(z)}return k.push(M[M.length-1]),`M ${k.map(A=>`${A.x},${A.y}`).join(" L ")}`}C.delete(h),N.add(h);let{xi:P,yi:D}=x(h),B={x:l[P],y:p[D]},G=[];P>0&&G.push({xi:P-1,yi:D}),P<l.length-1&&G.push({xi:P+1,yi:D}),D>0&&G.push({xi:P,yi:D-1}),D<p.length-1&&G.push({xi:P,yi:D+1});for(let M of G){let E=y(M.xi,M.yi);if(N.has(E))continue;let k={x:l[M.xi],y:p[M.yi]};if(m(B,k))continue;let A=0;if(L.has(h)){let z=L.get(h),lt=x(z).yi===D,ht=M.yi===D;lt!==ht&&(A+=100)}let H=Math.abs(k.x-B.x)+Math.abs(k.y-B.y),F=(w.get(h)??0)+H+A;(!C.has(E)||F<(w.get(E)??1/0))&&(L.set(E,h),w.set(E,F),u.set(E,F+Math.abs(t.x-k.x)+Math.abs(t.y-k.y)),C.add(E))}}return f(c,t)}var pt=(c,t,e=.25)=>{let s=(t.x-c.x)*e;return`M ${c.x},${c.y} C ${c.x+s},${c.y} ${t.x-s},${t.y} ${t.x},${t.y}`},gt=(c,t)=>`M ${c.x},${c.y} L ${t.x},${t.y}`,it=(c,t,e=0)=>{let s=t.x-c.x,i=c.x+s/2;if(e<=0)return`M ${c.x},${c.y} L ${i},${c.y} L ${i},${t.y} L ${t.x},${t.y}`;let o=t.y-c.y,r=Math.min(e,Math.abs(s/2),Math.abs(o/2));if(r<=1)return`M ${c.x},${c.y} L ${i},${c.y} L ${i},${t.y} L ${t.x},${t.y}`;let d=Math.sign(s),n=Math.sign(o),a=i-r*d,l=c.y+r*n,p=i+r*d,m=t.y-r*n,y=d*n>0?1:0,x=d*n>0?0:1;return`M ${c.x},${c.y} L ${a},${c.y} A ${r},${r} 0 0 ${y} ${i},${l} L ${i},${m} A ${r},${r} 0 0 ${x} ${p},${t.y} L ${t.x},${t.y}`},Y=({source:c,target:t,mode:e="bezier",curvature:s=.5,obstacles:i=[]})=>{switch(e){case"straight":return gt(c,t);case"step":return it(c,t,0);case"smooth-step":return it(c,t,8);case"smart":return st(c,t,i);default:return pt(c,t,s)}};var ot=`
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

  .sci-flow-node-body {
    padding: 6px 10px;
    color: #999;
    font-size: 11px;
    line-height: 1.4;
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
`;function nt(c,t){let e=c.style?.width||200,s=c.style?.height||150,i=c.portConfig||"left-right",o="left";switch(t==="in1"?i==="top-bottom"||i==="top-in-bottom-out"?o="top":i==="bottom-top"||i==="bottom-in-top-out"?o="bottom":i==="right-in-left-out"?o="right":i==="left-top-in-bottom-right-out"?o="top-left":i==="bottom-right-in-left-top-out"?o="bottom-right":o="left":i==="top-bottom"||i==="bottom-in-top-out"?o="bottom":i==="bottom-top"||i==="top-in-bottom-out"?o="top":i==="left-in-right-out"?o="right":i==="right-in-left-out"?o="left":i==="left-top-in-bottom-right-out"?o="bottom-right":i==="bottom-right-in-left-top-out"?o="top-left":o="right",o){case"top":return{x:c.position.x+e/2,y:c.position.y};case"bottom":return{x:c.position.x+e/2,y:c.position.y+s};case"left":return{x:c.position.x-6,y:c.position.y+s/2};case"right":return{x:c.position.x+e+6,y:c.position.y+s/2};case"top-left":return{x:c.position.x-6,y:c.position.y+18};case"bottom-right":return{x:c.position.x+e+6,y:c.position.y+s-18};default:return{x:c.position.x,y:c.position.y}}}var j=class{constructor(t){this.nodesGroup=t}reconcile(t,e,s,i){t.forEach(o=>{let r=document.getElementById(`node-${o.id}`);if(!r&&(r=this.createNodeElement(o,s,i),this.nodesGroup.appendChild(r),s?.onNodeMount)){let d=r.querySelector(".sci-flow-node-wrapper");s.onNodeMount(o.id,d)}r.setAttribute("transform",`translate(${o.position.x}, ${o.position.y})`),o.selected?r.classList.add("sci-flow-node-selected"):r.classList.remove("sci-flow-node-selected"),e.delete(`node-${o.id}`)})}createNodeElement(t,e,s){let i=document.createElementNS("http://www.w3.org/2000/svg","g");i.id=`node-${t.id}`,i.setAttribute("class","sci-flow-node");let o=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),r=t.style?.width||200,d=t.style?.height||100;o.setAttribute("width",r.toString()),o.setAttribute("height",d.toString()),o.style.overflow="visible";let n=document.createElement("div");n.className="sci-flow-node-wrapper",n.dataset.type=t.type;let a=Object.keys(t.inputs||{}),l=Object.keys(t.outputs||{}),p=Math.max(a.length,l.length),m=32,y=26,x=m+p*y+20;n.style.minHeight=`${x}px`;let S=s.get(t.type);S?.renderHTML?n.appendChild(S.renderHTML(t)):n.innerHTML=`
                <div class="sci-flow-node-header">
                    <strong>${t.type}</strong>
                    <span style="opacity: 0.5; font-size: 10px;">${t.id.slice(0,8)}</span>
                </div>
                <div class="sci-flow-node-body">
                    Default Node Preview
                </div>`,o.appendChild(n),i.appendChild(o);let b=(v,C,N)=>{let w=document.createElementNS("http://www.w3.org/2000/svg","circle");return w.setAttribute("class","sci-flow-port"),w.setAttribute("r","5"),w.dataset.nodeid=t.id,w.dataset.portid=v,w.dataset.portType=C,w.dataset.dataType=N,i.appendChild(w),w},$=a.map(v=>b(v,"in",t.inputs[v]?.dataType||"any")),T=l.map(v=>b(v,"out",t.outputs[v]?.dataType||"any")),f;return new ResizeObserver(()=>{f&&cancelAnimationFrame(f),f=requestAnimationFrame(()=>{let v=n.offsetWidth,C=n.offsetHeight;if(v===0||C===0)return;o.setAttribute("width",v.toString()),o.setAttribute("height",C.toString());let N=e?.getState().nodes.get(t.id);N&&(Math.abs((N.style?.width||0)-v)>1||Math.abs((N.style?.height||0)-C)>1)&&(N.style={...N.style,width:v,height:C},e?.forceUpdate()),$.forEach((w,u)=>{let L=m+18+u*y;w.setAttribute("cy",L.toString()),w.setAttribute("cx","-6");let h=`label-in-${t.id}-${a[u]}`,g=document.getElementById(h);g||(g=document.createElementNS("http://www.w3.org/2000/svg","text"),g.id=h,g.setAttribute("class","sci-flow-port-label"),g.setAttribute("x","12"),g.style.pointerEvents="none",i.appendChild(g)),g&&(g.setAttribute("y",(L+4).toString()),g.textContent=t.inputs[a[u]]?.label||a[u])}),T.forEach((w,u)=>{let L=m+18+u*y;w.setAttribute("cy",L.toString()),w.setAttribute("cx",String(v+6));let h=`label-out-${t.id}-${l[u]}`,g=document.getElementById(h);g||(g=document.createElementNS("http://www.w3.org/2000/svg","text"),g.id=h,g.setAttribute("class","sci-flow-port-label"),g.setAttribute("text-anchor","end"),g.style.pointerEvents="none",i.appendChild(g)),g&&(g.setAttribute("x",(v-12).toString()),g.setAttribute("y",(L+4).toString()),g.textContent=t.outputs[l[u]]?.label||l[u])})})}).observe(n),i}};var K=class{constructor(t,e,s,i,o,r,d){this.edgesGroup=t;this.routerWorker=e;this.routeCache=s;this.routingHashCache=i;this.pendingRoutes=o;this.routerIdCounter=r;this.getPortAnchorFn=d}reconcile(t,e,s){t.edges.forEach(i=>{let o=t.nodes.get(i.source),r=t.nodes.get(i.target);if(!o||!r)return;let d=this.getPortAnchorFn(o,i.sourceHandle),n=this.getPortAnchorFn(r,i.targetHandle),a=i.type||"bezier",l=document.getElementById(`edge-group-${i.id}`);l||(l=this.createEdgeElement(i),this.edgesGroup.appendChild(l));let p=s.filter(m=>m.id!==i.source&&m.id!==i.target);this.updateEdgeVisuals(l,i,d,n,a,p),e.delete(`edge-group-${i.id}`)})}createEdgeElement(t){let e=document.createElementNS("http://www.w3.org/2000/svg","g");e.id=`edge-group-${t.id}`,e.setAttribute("class","sci-flow-edge-group");let s=document.createElementNS("http://www.w3.org/2000/svg","path");s.setAttribute("class","sci-flow-edge-bg"),s.setAttribute("fill","none"),s.style.stroke="transparent",s.style.strokeWidth="20px",s.style.cursor="pointer",s.style.pointerEvents="stroke";let i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("class","sci-flow-edge-fg"),i.setAttribute("fill","none"),i.style.pointerEvents="none";let o=document.createElementNS("http://www.w3.org/2000/svg","circle");o.setAttribute("class","sci-flow-port-source"),o.setAttribute("r","5");let r=document.createElementNS("http://www.w3.org/2000/svg","circle");return r.setAttribute("class","sci-flow-port-target"),r.setAttribute("r","5"),e.appendChild(s),e.appendChild(i),e.appendChild(o),e.appendChild(r),e}updateEdgeVisuals(t,e,s,i,o,r){let d=t.querySelector(".sci-flow-edge-bg"),n=t.querySelector(".sci-flow-edge-fg"),a=t.querySelector(".sci-flow-port-source"),l=t.querySelector(".sci-flow-port-target");[a,l].forEach(b=>{b.style.fill="var(--sf-bg)",b.style.stroke=e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)",b.style.strokeWidth="2px"}),a.setAttribute("cx",`${s.x}`),a.setAttribute("cy",`${s.y}`),l.setAttribute("cx",`${i.x}`),l.setAttribute("cy",`${i.y}`);let p=e.style?.lineStyle||"solid",m=e.style?.stroke,y=e.style?.strokeWidth;n.style.stroke=m||(e.selected?"var(--sf-edge-active)":"var(--sf-edge-line)"),n.style.strokeWidth=y?`${y}px`:e.selected?"3px":"2px",e.animated?(n.style.strokeDasharray="5, 5",n.style.animation="sf-dash-anim 1s linear infinite"):p==="dashed"?(n.style.strokeDasharray="8, 8",n.style.animation="none"):p==="dotted"?(n.style.strokeDasharray="2, 4",n.style.animation="none"):(n.style.strokeDasharray="none",n.style.animation="none");let x=`${s.x},${s.y}|${i.x},${i.y}|${o}|${r.length}`,S=b=>{d.setAttribute("d",b),n.setAttribute("d",b)};if(o==="smart")if(this.routeCache.has(e.id)&&this.routingHashCache.get(e.id)===x)S(this.routeCache.get(e.id));else{let b=Y({source:s,target:i,mode:"step"});S(b);let $=`job-${this.routerIdCounter.value++}`;this.pendingRoutes.set($,T=>{this.routeCache.set(e.id,T),this.routingHashCache.set(e.id,x);let f=document.getElementById(`edge-group-${e.id}`);if(f){let I=f.querySelector(".sci-flow-edge-bg"),v=f.querySelector(".sci-flow-edge-fg");I&&v&&(I.setAttribute("d",T),v.setAttribute("d",T))}}),this.routerWorker.postMessage({id:$,source:s,target:i,obstacles:r,padding:20})}else{let b=Y({source:s,target:i,mode:o,obstacles:r});S(b),this.routeCache.set(e.id,b),this.routingHashCache.set(e.id,x)}}};function rt(){let c=`
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
    `,t=new Blob([c],{type:"application/javascript"});return new Worker(URL.createObjectURL(t))}var U=class extends R{svg;nodesGroup;edgesGroup;styleEl;routerWorker;pendingRoutes=new Map;routerIdCounter=0;routeCache=new Map;routingHashCache=new Map;nodeManager;edgeManager;constructor(t){super(t),this.container.classList.add("sci-flow-container"),this.routerWorker=rt(),this.routerWorker.onmessage=s=>{let{id:i,path:o}=s.data;this.pendingRoutes.has(i)&&(this.pendingRoutes.get(i)(o),this.pendingRoutes.delete(i))},this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.style.width="100%",this.svg.style.height="100%",this.svg.style.display="block",this.svg.style.position="absolute",this.svg.style.top="0",this.svg.style.left="0",this.svg.style.zIndex="1",this.svg.setAttribute("class","sci-flow-svg-renderer"),this.styleEl=document.createElement("style"),this.styleEl.textContent=ot,document.head.appendChild(this.styleEl),this.edgesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.edgesGroup.setAttribute("class","sci-flow-edges"),this.edgesGroup.style.transformOrigin="0 0",this.nodesGroup=document.createElementNS("http://www.w3.org/2000/svg","g"),this.nodesGroup.setAttribute("class","sci-flow-nodes"),this.nodesGroup.style.transformOrigin="0 0",this.svg.appendChild(this.edgesGroup),this.svg.appendChild(this.nodesGroup),this.container.appendChild(this.svg),this.nodeManager=new j(this.nodesGroup);let e=this;this.edgeManager=new K(this.edgesGroup,this.routerWorker,this.routeCache,this.routingHashCache,this.pendingRoutes,{get value(){return e.routerIdCounter},set value(s){e.routerIdCounter=s}},this.getPortAnchor.bind(this))}render(t,e){let s=`translate(${t.viewport.x}, ${t.viewport.y}) scale(${t.viewport.zoom})`;this.edgesGroup.setAttribute("transform",s),this.nodesGroup.setAttribute("transform",s);let i=new Set(Array.from(this.nodesGroup.children).map(d=>d.id));this.nodeManager.reconcile(t.nodes,i,this.stateManager,e),i.forEach(d=>{document.getElementById(d)?.remove();let n=this.stateManager;n?.onNodeUnmount&&n.onNodeUnmount(d)});let o=Array.from(t.nodes.values()).map(d=>({id:d.id,x:d.position.x,y:d.position.y,width:d.style?.width||200,height:d.style?.height||150})),r=new Set(Array.from(this.edgesGroup.children).map(d=>d.id));this.edgeManager.reconcile(t,r,o),r.forEach(d=>{document.getElementById(d)?.remove()}),this.renderDraftEdge(t,o)}renderDraftEdge(t,e){let s=document.getElementById("sci-flow-draft-edge");if(t.draftEdge){s||(s=document.createElementNS("http://www.w3.org/2000/svg","path"),s.id="sci-flow-draft-edge",s.setAttribute("class","sci-flow-edge sci-flow-draft-edge"),s.setAttribute("fill","none"),s.setAttribute("stroke","var(--sf-edge-animated)"),s.setAttribute("stroke-width","3"),s.setAttribute("stroke-dasharray","5, 5"),s.style.pointerEvents="none",this.edgesGroup.firstChild?this.edgesGroup.insertBefore(s,this.edgesGroup.firstChild):this.edgesGroup.appendChild(s));let i=t.nodes.get(t.draftEdge.sourceNodeId);if(i){let o=this.getPortAnchor(i,t.draftEdge.sourcePortId),r=t.draftEdge.targetPosition,d=e.filter(l=>l.id!==t.draftEdge?.sourceNodeId),n=t.defaultEdgeType||"bezier",a=Y({source:o,target:r,mode:n,obstacles:d});s.setAttribute("d",a)}}else s&&s.remove()}getPortAnchor(t,e){return nt(t,e)}getViewportElement(){return this.svg}destroy(){this.svg.remove(),this.styleEl.remove(),this.routerWorker.terminate()}};var W=class extends R{canvas;ctx;animationFrameId=null;state=null;registry=new Map;constructor(t){super(t),this.canvas=document.createElement("canvas"),this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.display="block",this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.zIndex="1",this.canvas.classList.add("sci-flow-canvas-renderer"),this.ctx=this.canvas.getContext("2d"),this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e),this.state&&this.render(this.state,this.registry)};render(t,e){this.state=t,this.registry=e,this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.animationFrameId=requestAnimationFrame(()=>this.draw(t,e))}draw(t,e){if(!this.ctx)return;let s=this.canvas.getBoundingClientRect();if(this.ctx.clearRect(0,0,s.width,s.height),this.ctx.save(),this.ctx.translate(t.viewport.x,t.viewport.y),this.ctx.scale(t.viewport.zoom,t.viewport.zoom),t.smartGuides&&t.smartGuides.length>0){this.ctx.strokeStyle="#e20f86",this.ctx.lineWidth=1/t.viewport.zoom,this.ctx.setLineDash([4/t.viewport.zoom,4/t.viewport.zoom]);for(let i of t.smartGuides)this.ctx.beginPath(),i.x!==void 0&&(this.ctx.moveTo(i.x,-1e5),this.ctx.lineTo(i.x,1e5)),i.y!==void 0&&(this.ctx.moveTo(-1e5,i.y),this.ctx.lineTo(1e5,i.y)),this.ctx.stroke()}this.ctx.restore()}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.canvas.remove()}};var Z=class extends R{canvas;ctx;options;constructor(t){super(t),this.options={gridSize:t.gridSize||20,gridColor:t.gridColor||"rgba(100, 100, 100, 0.2)"},this.canvas=document.createElement("canvas"),this.canvas.style.position="absolute",this.canvas.style.top="0",this.canvas.style.left="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.pointerEvents="none",this.canvas.style.zIndex="0",this.canvas.classList.add("sci-flow-grid"),this.ctx=this.canvas.getContext("2d"),this.container.firstChild?this.container.insertBefore(this.canvas,this.container.firstChild):this.container.appendChild(this.canvas),this.resize(),window.addEventListener("resize",this.resize)}resize=()=>{let t=this.container.getBoundingClientRect(),e=window.devicePixelRatio||1;this.canvas.width=t.width*e,this.canvas.height=t.height*e,this.ctx?.scale(e,e)};render(t){if(!this.ctx)return;let{x:e,y:s,zoom:i}=t.viewport,o=this.canvas.getBoundingClientRect();this.ctx.clearRect(0,0,o.width,o.height);let r=1;for(;this.options.gridSize*i*r<15;)r*=2;let d=this.options.gridSize*i*r,n=getComputedStyle(this.container).getPropertyValue("--sf-grid-dot").trim()||"#555";this.ctx.fillStyle=n;let a=1.5,l=e%d,p=s%d;for(let m=l;m<o.width;m+=d)for(let y=p;y<o.height;y+=d)this.ctx.fillRect(m,y,a,a)}getViewportElement(){return this.canvas}destroy(){window.removeEventListener("resize",this.resize),this.canvas.remove()}};var J=class{constructor(t){this.stateManager=t}handleWheel(t){t.preventDefault();let e=this.stateManager.getState(),{x:s,y:i,zoom:o}=e.viewport,d=-t.deltaY*.001,n=Math.min(Math.max(o+d,.1),5),a=t.currentTarget.getBoundingClientRect(),l=t.clientX-a.left,p=t.clientY-a.top,m=(l-s)/o,y=(p-i)/o,x=l-m*n,S=p-y*n;this.stateManager.setViewport({x,y:S,zoom:n})}handlePan(t,e){let s=t.clientX-e.x,i=t.clientY-e.y,o=this.stateManager.getState();return this.stateManager.setViewport({...o.viewport,x:o.viewport.x+s,y:o.viewport.y+i}),{x:t.clientX,y:t.clientY}}};var q=class{constructor(t,e){this.container=t;this.stateManager=e}selectionBoxEl=null;selectionStart=null;startSelection(t){this.selectionStart=t,this.selectionBoxEl=document.createElement("div"),this.selectionBoxEl.style.position="absolute",this.selectionBoxEl.style.border="1px solid var(--sf-edge-active, #00f2ff)",this.selectionBoxEl.style.backgroundColor="rgba(0, 242, 255, 0.1)",this.selectionBoxEl.style.pointerEvents="none",this.selectionBoxEl.style.zIndex="1000",this.container.appendChild(this.selectionBoxEl)}updateSelection(t,e){if(!this.selectionStart||!this.selectionBoxEl)return;let s=Math.min(this.selectionStart.x,t.x),i=Math.min(this.selectionStart.y,t.y),o=Math.abs(this.selectionStart.x-t.x),r=Math.abs(this.selectionStart.y-t.y);this.selectionBoxEl.style.left=`${s}px`,this.selectionBoxEl.style.top=`${i}px`,this.selectionBoxEl.style.width=`${o}px`,this.selectionBoxEl.style.height=`${r}px`;let d=this.container.getBoundingClientRect(),n=this.screenToFlow(this.selectionStart,e,d),a=this.screenToFlow(t,e,d),l=Math.min(n.x,a.x),p=Math.min(n.y,a.y),m=Math.max(n.x,a.x),y=Math.max(n.y,a.y);this.performSelection(l,p,m,y)}endSelection(){this.selectionBoxEl&&(this.selectionBoxEl.remove(),this.selectionBoxEl=null),this.selectionStart=null}performSelection(t,e,s,i){let o=this.stateManager.getState(),r=[],d=[];o.nodes.forEach(n=>{let a=n.style?.width||200,l=n.style?.height||150;n.position.x>=t&&n.position.x+a<=s&&n.position.y>=e&&n.position.y+l<=i&&r.push(n.id)}),o.edges.forEach(n=>{let a=o.nodes.get(n.source),l=o.nodes.get(n.target);a&&l&&a.position.x>=t&&a.position.x<=s&&a.position.y>=e&&a.position.y<=i&&l.position.x>=t&&l.position.x<=s&&l.position.y>=e&&l.position.y<=i&&d.push(n.id)}),this.stateManager.setSelection(r,d)}screenToFlow(t,e,s){return{x:(t.x-s.left-e.x)/e.zoom,y:(t.y-s.top-e.y)/e.zoom}}};var _=class{constructor(t,e){this.container=t;this.stateManager=e}draftSourceNodeId=null;draftSourcePortId=null;startDraft(t,e,s){this.draftSourceNodeId=t,this.draftSourcePortId=e,this.container.setPointerCapture(s),this.container.classList.add("sci-flow-dragging-edge")}updateDraft(t){!this.draftSourceNodeId||!this.draftSourcePortId||this.stateManager.setDraftEdge(this.draftSourceNodeId,this.draftSourcePortId,t)}endDraft(t){if(!this.draftSourceNodeId||!this.draftSourcePortId)return;let i=document.elementsFromPoint(t.clientX,t.clientY).find(o=>o.closest(".sci-flow-port"))?.closest(".sci-flow-port");if(i&&i.dataset.nodeid&&i.dataset.portid){let o=i.dataset.nodeid,r=i.dataset.portid;if(o!==this.draftSourceNodeId){let d=this.draftSourcePortId.startsWith("in"),n=r.startsWith("in");if(d!==n){let a=this.stateManager.getState(),l=!1;for(let p of a.edges.values())if(p.source===this.draftSourceNodeId&&p.target===o&&p.sourceHandle===this.draftSourcePortId&&p.targetHandle===r){l=!0;break}l||this.stateManager.addEdge({id:`edge-${Date.now()}`,source:this.draftSourceNodeId,sourceHandle:this.draftSourcePortId,target:o,targetHandle:r,type:a.defaultEdgeType,style:a.defaultEdgeStyle?{...a.defaultEdgeStyle}:void 0})}}}this.draftSourceNodeId=null,this.draftSourcePortId=null,this.stateManager.clearDraftEdge(),this.container.classList.remove("sci-flow-dragging-edge")}isDrafting(){return!!this.draftSourceNodeId}};function at(c,t){let e=new Set,s=[...t];for(;s.length>0;){let i=s.pop();for(let[o,r]of c.entries())r.parentId===i&&!e.has(o)&&(e.add(o),s.push(o))}return Array.from(e)}var Q=class{constructor(t,e,s){this.container=t;this.stateManager=e;this.options=s}isDraggingNodes=!1;draggedNodeIds=[];lastDragPos=null;startDrag(t,e,s){this.isDraggingNodes=!0,this.draggedNodeIds=t,this.lastDragPos=e,this.container.setPointerCapture(s),this.container.classList.add("sci-flow-dragging")}updateDrag(t,e){if(!this.isDraggingNodes||!this.lastDragPos)return;let s=this.stateManager.getState(),i=t.x-this.lastDragPos.x,o=t.y-this.lastDragPos.y,r=[];if(this.draggedNodeIds.length===1&&!e.altKey){let d=this.draggedNodeIds[0],n=s.nodes.get(d);if(n){let a=n.position.x+i,l=n.position.y+o,p=n.style?.width||200,m=n.style?.height||150,y=!1,x=!1,S=10/s.viewport.zoom;if(this.options.showSmartGuides){let b=a+p/2,$=l+m/2;for(let[T,f]of s.nodes.entries()){if(T===d)continue;let I=f.style?.width||200,v=f.style?.height||150,C=f.position.x+I/2,N=f.position.y+v/2;if(!y){let w=[{target:f.position.x,guide:f.position.x},{target:C,guide:C},{target:f.position.x+I,guide:f.position.x+I}];for(let u of w){if(Math.abs(a-u.target)<S){a=u.target,y=!0,r.push({x:u.guide});break}if(Math.abs(b-u.target)<S){a=u.target-p/2,y=!0,r.push({x:u.guide});break}if(Math.abs(a+p-u.target)<S){a=u.target-p,y=!0,r.push({x:u.guide});break}}}if(!x){let w=[{target:f.position.y,guide:f.position.y},{target:N,guide:N},{target:f.position.y+v,guide:f.position.y+v}];for(let u of w){if(Math.abs(l-u.target)<S){l=u.target,x=!0,r.push({y:u.guide});break}if(Math.abs($-u.target)<S){l=u.target-m/2,x=!0,r.push({y:u.guide});break}if(Math.abs(l+m-u.target)<S){l=u.target-m,x=!0,r.push({y:u.guide});break}}}}}this.options.snapToGrid&&!y&&(a=Math.round(a/this.options.gridSize)*this.options.gridSize),this.options.snapToGrid&&!x&&(l=Math.round(l/this.options.gridSize)*this.options.gridSize),i=a-n.position.x,o=l-n.position.y}}else this.options.snapToGrid&&!e.altKey&&(i=Math.round(i/this.options.gridSize)*this.options.gridSize,o=Math.round(o/this.options.gridSize)*this.options.gridSize);this.stateManager.setSmartGuides(r.length>0?r:void 0),(i!==0||o!==0)&&(new Set([...this.draggedNodeIds,...at(s.nodes,this.draggedNodeIds)]).forEach(n=>{let a=s.nodes.get(n);a&&this.stateManager.updateNodePosition(n,a.position.x+i,a.position.y+o,!0)}),this.lastDragPos={x:this.lastDragPos.x+i,y:this.lastDragPos.y+o})}endDrag(t){this.isDraggingNodes&&(this.isDraggingNodes=!1,this.container.classList.remove("sci-flow-dragging"),this.lastDragPos&&(this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot()),this.lastDragPos=null,this.stateManager.clearSmartGuides(),this.container.hasPointerCapture(t)&&this.container.releasePointerCapture(t))}isDragging(){return this.isDraggingNodes}};var tt=class{constructor(t){this.stateManager=t}handleKeyDown(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState();if((t.ctrlKey||t.metaKey)&&t.key.toLowerCase()==="a"){t.preventDefault(),this.stateManager.setSelection(Array.from(e.nodes.keys()),[]);return}if(t.key==="Delete"||t.key==="Backspace"){t.preventDefault();let d=Array.from(e.nodes.values()).filter(a=>a.selected).map(a=>a.id),n=Array.from(e.edges.values()).filter(a=>a.selected).map(a=>a.id);d.forEach(a=>this.stateManager.removeNode(a)),n.forEach(a=>this.stateManager.removeEdge(a));return}let s=navigator.platform.toUpperCase().indexOf("MAC")>=0,i=s&&t.metaKey&&t.shiftKey&&t.code==="KeyZ"||!s&&t.ctrlKey&&t.code==="KeyY";if((t.metaKey||t.ctrlKey)&&t.code==="KeyZ"&&!i){t.preventDefault(),this.stateManager.undo();return}else if(i){t.preventDefault(),this.stateManager.redo();return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(t.key)){let d=Array.from(e.nodes.values()).filter(n=>n.selected);if(d.length>0){t.preventDefault();let n=t.shiftKey?10:1;d.forEach(a=>{let l=a.position.x,p=a.position.y;t.key==="ArrowUp"&&(p-=n),t.key==="ArrowDown"&&(p+=n),t.key==="ArrowLeft"&&(l-=n),t.key==="ArrowRight"&&(l+=n),this.stateManager.updateNodePosition(a.id,l,p,!0)}),this.stateManager.commitNodePositions(),this.stateManager.saveSnapshot();return}}}handleCopy(t){if(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)return;let e=this.stateManager.getState(),s=Array.from(e.nodes.values()).filter(r=>r.selected),i=Array.from(e.edges.values()).filter(r=>r.selected);if(s.length===0)return;let o={version:"sci-flow-1.0",nodes:s,edges:i};t.clipboardData&&(t.clipboardData.setData("application/json",JSON.stringify(o)),t.preventDefault())}handlePaste(t){if(!(t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement)&&t.clipboardData)try{let e=t.clipboardData.getData("application/json");if(!e)return;let s=JSON.parse(e);if(s.version==="sci-flow-1.0"){t.preventDefault();let i=30,o=[],r=new Map;s.nodes.forEach(n=>{let a=`${n.id}-copy-${Date.now()}`;r.set(n.id,a),o.push({...n,id:a,position:{x:n.position.x+i,y:n.position.y+i},selected:!0})}),this.stateManager.setSelection([],[]),o.forEach(n=>this.stateManager.addNode(n));let d=o.map(n=>n.id);this.stateManager.setSelection(d,[]),this.stateManager.saveSnapshot()}}catch(e){console.error("Paste failed",e)}}};var et=class{container;stateManager;panZoom;selection;connection;drag;shortcuts;isPanning=!1;lastPointerPos={x:0,y:0};isSpacePressed=!1;cleanupEvents=[];constructor({container:t,stateManager:e,snapToGrid:s=!0,gridSize:i=20,showSmartGuides:o=!0}){this.container=t,this.stateManager=e,this.panZoom=new J(e),this.selection=new q(t,e),this.connection=new _(t,e),this.drag=new Q(t,e,{snapToGrid:s,gridSize:i,showSmartGuides:o}),this.shortcuts=new tt(e),this.bindEvents()}bindEvents(){this.container.style.touchAction="none";let t=n=>this.panZoom.handleWheel(n),e=this.handlePointerDown.bind(this),s=this.handlePointerMove.bind(this),i=this.handlePointerUp.bind(this),o=n=>{n.code==="Space"&&(this.isSpacePressed=!0,this.container.style.cursor="grab"),this.shortcuts.handleKeyDown(n)},r=n=>{n.code==="Space"&&(this.isSpacePressed=!1,this.container.style.cursor="default")},d=n=>n.preventDefault();this.container.addEventListener("wheel",t,{passive:!1}),this.container.addEventListener("pointerdown",e),this.container.addEventListener("contextmenu",d),window.addEventListener("pointermove",s),window.addEventListener("pointerup",i),window.addEventListener("keydown",o),window.addEventListener("keyup",r),window.addEventListener("copy",n=>this.shortcuts.handleCopy(n)),window.addEventListener("paste",n=>this.shortcuts.handlePaste(n)),this.cleanupEvents=[()=>this.container.removeEventListener("wheel",t),()=>this.container.removeEventListener("pointerdown",e),()=>this.container.removeEventListener("contextmenu",d),()=>window.removeEventListener("pointermove",s),()=>window.removeEventListener("pointerup",i),()=>window.removeEventListener("keydown",o),()=>window.removeEventListener("keyup",r)]}handlePointerDown(t){let e=t.target,s=e.closest(".sci-flow-port");if(s?.dataset.nodeid&&s?.dataset.portid){this.connection.startDraft(s.dataset.nodeid,s.dataset.portid,t.pointerId);return}let i=this.stateManager.getState(),o=this.container.getBoundingClientRect(),r=this.screenToFlow({x:t.clientX,y:t.clientY},i.viewport,o),d=this.findNodeAt(r);if(d){let a=i.nodes.get(d),l=a?.selected?Array.from(i.nodes.values()).filter(p=>p.selected).map(p=>p.id):[d];!a?.selected&&!t.shiftKey?this.stateManager.setSelection([d],[]):t.shiftKey&&this.stateManager.appendSelection(d),this.drag.startDrag(l,r,t.pointerId);return}let n=e.closest(".sci-flow-edge-bg, .sci-flow-edge-fg");if(n&&n.parentElement&&n.parentElement.id.startsWith("edge-group-")){let a=n.parentElement.id.replace("edge-group-","");t.shiftKey?this.stateManager.appendSelection(void 0,a):this.stateManager.setSelection([],[a]);return}if(t.button===1||t.button===2||t.button===0&&this.isSpacePressed){this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing";return}t.button===0&&!this.isSpacePressed&&(t.shiftKey?this.selection.startSelection({x:t.clientX,y:t.clientY}):(this.stateManager.setSelection([],[]),this.isPanning=!0,this.lastPointerPos={x:t.clientX,y:t.clientY},this.container.setPointerCapture(t.pointerId),this.container.style.cursor="grabbing"))}handlePointerMove(t){let e=this.stateManager.getState(),s=this.container.getBoundingClientRect(),i=this.screenToFlow({x:t.clientX,y:t.clientY},e.viewport,s);this.connection.isDrafting()?this.connection.updateDraft(i):this.drag.isDragging()?this.drag.updateDrag(i,t):this.isPanning?this.lastPointerPos=this.panZoom.handlePan(t,this.lastPointerPos):this.selection.updateSelection({x:t.clientX,y:t.clientY},e.viewport)}handlePointerUp(t){this.connection.endDraft(t),this.drag.endDrag(t.pointerId),this.selection.endSelection(),this.isPanning=!1,this.container.style.cursor=this.isSpacePressed?"grab":"default",this.container.hasPointerCapture(t.pointerId)&&this.container.releasePointerCapture(t.pointerId)}findNodeAt(t){let e=this.stateManager.getState(),s=Array.from(e.nodes.values()).reverse();for(let i of s){let o=i.style?.width||200,r=i.style?.height||150;if(t.x>=i.position.x&&t.x<=i.position.x+o&&t.y>=i.position.y&&t.y<=i.position.y+r)return i.id}return null}screenToFlow(t,e,s){return{x:(t.x-s.left-e.x)/e.zoom,y:(t.y-s.top-e.y)/e.zoom}}destroy(){this.cleanupEvents.forEach(t=>t())}};var dt=class{container;stateManager;interactionManager;renderer;gridRenderer;options;unsubscribe;currentTheme=X;styleInjector;constructor(t){this.options={renderer:"auto",autoSwitchThreshold:1e3,theme:"light",...t},this.container=this.options.container,getComputedStyle(this.container).position==="static"&&(this.container.style.position="relative"),this.stateManager=new O,this.setupTheming(this.options.theme),this.interactionManager=new et({container:this.container,stateManager:this.stateManager,minZoom:this.options.minZoom,maxZoom:this.options.maxZoom}),this.gridRenderer=new Z({container:this.container});let e=this.options.renderer==="auto"?"svg":this.options.renderer||"svg";this.renderer=this.createRenderer(e),this.renderer.stateManager=this.stateManager,this.unsubscribe=this.stateManager.subscribe(s=>{this.gridRenderer.render(s),this.renderer.render(s,this.stateManager.nodeRegistry),this.checkRendererThreshold(s.nodes.size)})}createRenderer(t){return t==="svg"?new U({container:this.container}):new W({container:this.container})}checkRendererThreshold(t){if(this.options.renderer==="auto"){let e=this.options.autoSwitchThreshold||1e3,s=this.renderer instanceof W;t>e&&!s?this.switchRenderer("canvas"):t<=e&&s&&this.switchRenderer("svg")}}switchRenderer(t){this.renderer.destroy(),this.renderer=this.createRenderer(t),this.renderer.render(this.stateManager.getState(),this.stateManager.nodeRegistry)}setupTheming(t){this.styleInjector=document.createElement("style"),this.styleInjector.id="sci-flow-theme-injector",this.container.appendChild(this.styleInjector),this.setTheme(t)}setTheme(t){let e=X;t==="dark"?e=V:t==="system"?e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?V:X:typeof t=="object"&&(e=t.name==="dark"?V:X),this.currentTheme=typeof t=="object"?{name:t.name||e.name,colors:{...e.colors,...t.colors||{}}}:e,this.applyThemeVariables()}applyThemeVariables(){if(!this.styleInjector)return;let t=this.currentTheme.colors,e=`
        .sci-flow-container-${this.stateManager?.id||"root"} {
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
        
        /* Edge Hover Effects */
        .sci-flow-container-${this.stateManager?.id||"root"} .sci-flow-edge-bg:hover + .sci-flow-edge-fg {
            stroke: var(--sf-edge-active) !important;
            stroke-width: 3px !important;
        }
        
        .sci-flow-container-${this.stateManager?.id||"root"} .sci-flow-edge-bg:hover ~ circle {
            stroke: var(--sf-edge-active) !important;
            stroke-width: 3px !important;
            transform: scale(1.5);
            transform-origin: center;
            transform-box: fill-box;
        }

        /* Node Hover Effects */
        .sci-flow-container-${this.stateManager?.id||"root"} .sci-flow-node:hover > foreignObject > div {
            box-shadow: 0 0 15px var(--sf-edge-active) !important;
            transition: box-shadow 0.2s ease;
        }

        /* Dragging State: Prevent text selection globally while user holds click */
        .sci-flow-container-${this.stateManager?.id||"root"}.sci-flow-dragging * {
            user-select: none !important;
            -webkit-user-select: none !important;
        }
      `;this.styleInjector.innerHTML=e,this.container.classList.add(`sci-flow-container-${this.stateManager?.id||"root"}`)}setNodes(t){this.stateManager.setNodes(t)}setEdges(t){this.stateManager.setEdges(t)}addNode(t){this.stateManager.addNode(t)}removeNode(t){this.stateManager.removeNode(t)}addEdge(t){this.stateManager.addEdge(t)}removeEdge(t){this.stateManager.removeEdge(t)}getState(){return this.stateManager.getState()}forceUpdate(){this.stateManager.forceUpdate()}setDefaultEdgeType(t){this.stateManager.setDefaultEdgeType(t)}setDefaultEdgeStyle(t){this.stateManager.setDefaultEdgeStyle(t)}subscribe(t){return this.stateManager.subscribe(t)}updateNodePosition(t,e,s){this.stateManager.updateNodePosition(t,e,s)}fitView(t=50){let e=this.stateManager.getState();if(e.nodes.size===0)return;let s=1/0,i=1/0,o=-1/0,r=-1/0;e.nodes.forEach(f=>{let I=f.style?.width||200,v=f.style?.height||150;f.position.x<s&&(s=f.position.x),f.position.y<i&&(i=f.position.y),f.position.x+I>o&&(o=f.position.x+I),f.position.y+v>r&&(r=f.position.y+v)});let d=o-s,n=r-i;if(d<=0||n<=0)return;let a=this.container.getBoundingClientRect(),l=a.width-t*2,p=a.height-t*2,m=l/d,y=p/n,x=Math.min(Math.max(Math.min(m,y),.1),2),S=s+d/2,b=i+n/2,$=a.width/2-S*x,T=a.height/2-b*x;this.stateManager.setViewport({x:$,y:T,zoom:x})}centerNode(t){let e=this.stateManager.getState(),s=e.nodes.get(t);if(!s)return;let i=s.style?.width||200,o=s.style?.height||150,r=s.position.x+i/2,d=s.position.y+o/2,n=this.container.getBoundingClientRect(),a=e.viewport.zoom,l=n.width/2-r*a,p=n.height/2-d*a;this.stateManager.setViewport({x:l,y:p,zoom:a})}toJSON(){return this.stateManager.toJSON()}fromJSON(t){this.stateManager.fromJSON(t)}destroy(){this.unsubscribe(),this.interactionManager.destroy(),this.gridRenderer.destroy(),this.renderer.destroy()}};var ct=class{canvas;ctx;stateManager;options;isDragging=!1;unsubscribe;constructor(t){this.stateManager=t.stateManager,this.options={container:t.container,stateManager:t.stateManager,width:t.width||150,height:t.height||100,nodeColor:t.nodeColor||"#rgba(100, 100, 100, 0.5)",viewportColor:t.viewportColor||"rgba(0, 123, 255, 0.4)",backgroundColor:t.backgroundColor||"#111"},this.canvas=document.createElement("canvas"),this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.canvas.style.backgroundColor=this.options.backgroundColor,this.canvas.style.border="1px solid #333",this.canvas.style.borderRadius="4px",this.canvas.style.cursor="crosshair",this.options.container.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.unsubscribe=this.stateManager.subscribe(()=>this.render()),this.bindEvents(),this.render()}bindEvents(){this.canvas.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp)}unbindEvents(){this.canvas.removeEventListener("pointerdown",this.onPointerDown),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp)}onPointerDown=t=>{this.isDragging=!0,this.canvas.setPointerCapture(t.pointerId),this.panToEvent(t)};onPointerMove=t=>{this.isDragging&&this.panToEvent(t)};onPointerUp=t=>{this.isDragging=!1,this.canvas.hasPointerCapture(t.pointerId)&&this.canvas.releasePointerCapture(t.pointerId)};panToEvent(t){let e=this.stateManager.getState(),s=this.canvas.getBoundingClientRect(),i=(t.clientX-s.left)/s.width,o=(t.clientY-s.top)/s.height;i=Math.max(0,Math.min(1,i)),o=Math.max(0,Math.min(1,o));let r=this.getWorldBounds(e),d=r.minX+i*r.width,n=r.minY+o*r.height,a=window.innerWidth,l=window.innerHeight,p=-d*e.viewport.zoom+a/2,m=-n*e.viewport.zoom+l/2;this.stateManager.setViewport({x:p,y:m,zoom:e.viewport.zoom})}getWorldBounds(t){if(t.nodes.size===0)return{minX:0,minY:0,maxX:1e3,maxY:1e3,width:1e3,height:1e3};let e=1/0,s=1/0,i=-1/0,o=-1/0;return t.nodes.forEach(r=>{let d=r.style?.width||200,n=r.style?.height||150;e=Math.min(e,r.position.x),s=Math.min(s,r.position.y),i=Math.max(i,r.position.x+d),o=Math.max(o,r.position.y+n)}),e-=500,s-=500,i+=500,o+=500,{minX:e,minY:s,maxX:i,maxY:o,width:i-e,height:o-s}}render(){if(!this.ctx)return;let t=this.stateManager.getState();this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);let e=this.getWorldBounds(t);if(e.width===0||e.height===0)return;let s=this.canvas.width/e.width,i=this.canvas.height/e.height,o=Math.min(s,i),r=(this.canvas.width-e.width*o)/2,d=(this.canvas.height-e.height*o)/2;this.ctx.save(),this.ctx.translate(r,d),this.ctx.scale(o,o),this.ctx.translate(-e.minX,-e.minY),this.ctx.fillStyle=this.options.nodeColor,t.nodes.forEach(x=>{let S=x.style?.width||200,b=x.style?.height||150;this.ctx.beginPath(),this.ctx.roundRect(x.position.x,x.position.y,S,b,10),this.ctx.fill()});let n=window.innerWidth,a=window.innerHeight,l=-t.viewport.x/t.viewport.zoom,p=-t.viewport.y/t.viewport.zoom,m=(n-t.viewport.x)/t.viewport.zoom,y=(a-t.viewport.y)/t.viewport.zoom;this.ctx.strokeStyle=this.options.viewportColor,this.ctx.lineWidth=2/o,this.ctx.fillStyle=this.options.viewportColor,this.ctx.beginPath(),this.ctx.rect(l,p,m-l,y-p),this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()}destroy(){this.unbindEvents(),this.unsubscribe(),this.canvas.remove()}};export{R as BaseRenderer,W as CanvasRenderer,ct as Minimap,U as SVGRenderer,dt as SciFlow,O as StateManager,V as darkTheme,X as lightTheme};
//# sourceMappingURL=index.js.map
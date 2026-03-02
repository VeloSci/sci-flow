export const SVG_RENDERER_STYLES = `
  .sci-flow-svg-renderer {
    user-select: none;
    -webkit-user-select: none;
    background-color: transparent;
    pointer-events: none; /* Let events pass through transparent canvas */
  }

  /* Main background should be on the container or a separate layer */
  .sci-flow-container {
    --sf-z-background: 0;
    --sf-z-edges: 10;
    --sf-z-annotations: 15;
    --sf-z-nodes: 20;
    --sf-z-notes-bg: 5;
    --sf-z-notes-fg: 50;
    --sf-z-overlay: 100;
    --sf-z-ui: 1000;

    background-color: var(--sf-bg);
    position: relative;
    overflow: hidden;
  }

  .sci-flow-nodes, .sci-flow-edges {
    pointer-events: none;
  }

  .sci-flow-node-wrapper {
    position: relative;
    display: inline-block;
    pointer-events: all; /* Important: nodes must catch events */
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
    pointer-events: all; /* Required so SVG elements intercept elementsFromPoint */
    fill: var(--sf-port-bg);
    stroke: var(--sf-node-bg);
    stroke-width: 1.5px;
    transition: transform 0.15s ease, fill 0.2s ease, filter 0.2s ease, r 0.2s ease;
    transform-box: fill-box;
    transform-origin: center;
    position: relative;
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
  .sci-flow-port-selected {
    r: 9 !important;
    fill: #fff !important;
    filter: drop-shadow(0 0 12px var(--sf-port-active)) brightness(1.5);
    stroke: var(--sf-port-active) !important;
    stroke-width: 3px !important;
    z-index: 50 !important;
    opacity: 1 !important;
  }

  .sci-flow-port-peer {
    r: 8 !important;
    fill: #fff !important;
    filter: drop-shadow(0 0 10px #f43f5e) brightness(1.3);
    stroke: #f43f5e !important;
    stroke-width: 2.5px !important;
    z-index: 25;
  }

  .sci-flow-node-peer .sci-flow-node-wrapper {
    border-color: #f43f5e;
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.6), 0 8px 16px rgba(0,0,0,0.5);
    transform: scale(1.03);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    animation: sf-pulse-node-peer 2s ease-in-out infinite;
  }

  .sci-flow-port-compatible {
    r: 7 !important;
    fill: #10b981 !important; /* Emerald green for compatible ports */
    filter: drop-shadow(0 0 6px #10b981);
    stroke: #fff !important;
    stroke-width: 1.5px !important;
    opacity: 0.9;
  }

  .sci-flow-edge-highlighted .sci-flow-edge-fg {
    stroke: var(--sf-edge-active) !important;
    stroke-width: 4px !important;
    filter: drop-shadow(0 0 6px var(--sf-edge-active));
    animation: sf-pulse-edge 1.5s ease-in-out infinite;
    z-index: 15;
  }

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

  @keyframes sf-pulse-edge {
    0% { stroke-width: 4px; filter: drop-shadow(0 0 4px var(--sf-edge-active)); }
    50% { stroke-width: 6px; filter: drop-shadow(0 0 12px var(--sf-edge-active)); }
    100% { stroke-width: 4px; filter: drop-shadow(0 0 4px var(--sf-edge-active)); }
  }

  @keyframes sf-pulse-node-peer {
    0% { box-shadow: 0 0 15px rgba(244, 63, 94, 0.4), 0 8px 16px rgba(0,0,0,0.5); }
    50% { box-shadow: 0 0 25px rgba(244, 63, 94, 0.8), 0 8px 16px rgba(0,0,0,0.6); }
    100% { box-shadow: 0 0 15px rgba(244, 63, 94, 0.4), 0 8px 16px rgba(0,0,0,0.5); }
  }

  /* Vertical layout mode */
  .sci-flow-vertical .sci-flow-port-label {
    display: none !important;
  }

  .sci-flow-vertical .sci-flow-node-ports-area {
    display: none !important;
  }
  .sci-flow-edge-label {
    position: absolute;
    top: 0; left: 0;
    pointer-events: auto;
    z-index: 11; /* Above edges (10), below annotations (15) and nodes (20) */
    transform: translate(-50%, -50%);
    background: var(--sf-node-bg, #2a2a2a);
    color: var(--sf-node-text, #fff);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    border: 1px solid var(--sf-node-border, #444);
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    user-select: none;
  }
`;

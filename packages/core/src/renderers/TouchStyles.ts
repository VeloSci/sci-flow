/** Touch-responsive CSS for mobile devices. Injected when data-touch-device is set. */
export const TOUCH_RESPONSIVE_STYLES = `
  /* Enlarge port hit areas on touch devices (WCAG 44x44px minimum) */
  [data-touch-device="true"] .sci-flow-port {
    r: 8;
    stroke-width: 2px;
  }

  [data-touch-device="true"] .sci-flow-port:hover {
    transform: scale(1.3);
  }

  /* Larger edge hit area on touch */
  [data-touch-device="true"] .sci-flow-edge-bg {
    stroke-width: 30px;
  }

  /* Node Toolbar Styles */
  .sci-flow-node-toolbar {
    display: flex;
    gap: 4px;
    justify-content: center;
    background: var(--sf-node-bg, #2a2a2a);
    border: 1px solid var(--sf-node-border, #444);
    border-radius: 6px;
    padding: 4px 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .sci-flow-toolbar-btn {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .sci-flow-toolbar-btn:hover {
    background: rgba(255,255,255,0.2);
  }

  /* Edge Label Styles */
  .sci-flow-edge-label {
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    user-select: none;
  }

  /* Staged port (tap-to-connect) */
  .sci-flow-port-source-staged {
    r: 9 !important;
    fill: var(--sf-port-active, #4ecdc4) !important;
    filter: drop-shadow(0 0 10px var(--sf-port-active, #4ecdc4));
    animation: sf-pulse-port 1s ease-in-out infinite;
  }

  @keyframes sf-pulse-port {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }

  /* LOD Styles */
  [data-lod="dot"] .sci-flow-node-body,
  [data-lod="dot"] .sci-flow-node-ports-area,
  [data-lod="dot"] .sci-flow-node-actions,
  [data-lod="dot"] .sci-flow-port-label {
    display: none !important;
  }

  [data-lod="simplified"] .sci-flow-node-body,
  [data-lod="simplified"] .sci-flow-node-actions {
    display: none !important;
  }

  /* Node Resize Handles */
  .sci-flow-resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--sf-node-selected, #4ecdc4);
    border-radius: 2px;
    z-index: 100;
    cursor: nwse-resize;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .sci-flow-node-selected .sci-flow-resize-handle {
    opacity: 1;
  }
  .sci-flow-resize-handle.se { bottom: -5px; right: -5px; cursor: nwse-resize; }
  .sci-flow-resize-handle.sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
  .sci-flow-resize-handle.ne { top: -5px; right: -5px; cursor: nesw-resize; }
  .sci-flow-resize-handle.nw { top: -5px; left: -5px; cursor: nwse-resize; }
`;

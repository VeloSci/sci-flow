"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SciFlow: () => SciFlow2,
  SciFlowMiniMap: () => SciFlowMiniMap,
  useSciFlow: () => useSciFlow
});
module.exports = __toCommonJS(index_exports);

// src/useSciFlow.ts
var import_react = require("react");
var import_core = require("@sci-flow/core");
function useSciFlow({ initialNodes = [], initialEdges = [], renderer = "auto", onInit, ...options } = {}) {
  const containerRef = (0, import_react.useRef)(null);
  const engineRef = (0, import_react.useRef)(null);
  const [nodes, setNodesState] = (0, import_react.useState)(initialNodes);
  const [edges, setEdgesState] = (0, import_react.useState)(initialEdges);
  const [portalMounts, setPortalMounts] = (0, import_react.useState)(/* @__PURE__ */ new Map());
  (0, import_react.useEffect)(() => {
    if (!containerRef.current || engineRef.current) return;
    engineRef.current = new import_core.SciFlow({
      container: containerRef.current,
      renderer,
      ...options
    });
    const stateManager = engineRef.current.stateManager;
    if (stateManager) {
      stateManager.onNodesChange = (newNodes) => setNodesState(newNodes);
      stateManager.onEdgesChange = (newEdges) => setEdgesState(newEdges);
      stateManager.onNodeMount = (nodeId, container) => {
        setPortalMounts((prev) => {
          if (prev.get(nodeId) === container) return prev;
          const newMap = new Map(prev);
          newMap.set(nodeId, container);
          return newMap;
        });
      };
      stateManager.onNodeUnmount = (nodeId) => {
        setPortalMounts((prev) => {
          if (!prev.has(nodeId)) return prev;
          const newMap = new Map(prev);
          newMap.delete(nodeId);
          return newMap;
        });
      };
    }
    engineRef.current.setNodes(initialNodes);
    engineRef.current.setEdges(initialEdges);
    if (onInit) {
      onInit(engineRef.current);
    }
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (!engineRef.current) return;
    const stateManager = engineRef.current.stateManager;
    if (options.onNodeContextMenu) stateManager.onNodeContextMenu = options.onNodeContextMenu;
    if (options.onEdgeContextMenu) stateManager.onEdgeContextMenu = options.onEdgeContextMenu;
    if (options.onPaneContextMenu) stateManager.onPaneContextMenu = options.onPaneContextMenu;
  }, [options.onNodeContextMenu, options.onEdgeContextMenu, options.onPaneContextMenu]);
  (0, import_react.useEffect)(() => {
    if (engineRef.current && options.theme !== void 0) {
      engineRef.current.setTheme(options.theme);
    }
  }, [options.theme]);
  const setNodes = (n) => {
    setNodesState(n);
    engineRef.current?.setNodes(n);
  };
  const setEdges = (e) => {
    setEdgesState(e);
    engineRef.current?.setEdges(e);
  };
  const fitView = (padding) => engineRef.current?.fitView(padding);
  const centerNode = (id) => engineRef.current?.centerNode(id);
  return {
    containerRef,
    engine: engineRef.current,
    nodes,
    edges,
    portalMounts,
    setNodes,
    setEdges,
    fitView,
    centerNode
  };
}

// src/SciFlow.tsx
var import_react2 = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime = require("react/jsx-runtime");
function SciFlow2({
  className,
  style,
  children,
  nodeTypes = [],
  ...useSciFlowProps
}) {
  const { containerRef, portalMounts, nodes, engine } = useSciFlow({ ...useSciFlowProps, nodeTypes });
  const typeMap = (0, import_react2.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    nodeTypes.forEach((Comp) => {
      if (Comp.nodeType) {
        map.set(Comp.nodeType, Comp);
      }
      if (Comp.name) {
        map.set(Comp.name, Comp);
        map.set(Comp.name.toLowerCase().replace("node", ""), Comp);
      }
    });
    return map;
  }, [nodeTypes]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      ref: containerRef,
      className: `sci-flow-react-container ${className || ""}`,
      style: { width: "100%", height: "100%", position: "relative", overflow: "hidden", ...style },
      children: [
        Array.from(portalMounts.entries()).map(([nodeId, domElement]) => {
          const nodeData = nodes.find((n) => n.id === nodeId);
          if (!nodeData || !domElement) return null;
          const NodeComponent = typeMap.get(nodeData.type);
          if (NodeComponent) {
            return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeComponent, { node: nodeData, engine }, nodeId), domElement);
          }
          return null;
        }),
        children
      ]
    }
  );
}

// src/SciFlowMiniMap.tsx
var import_react3 = require("react");
var import_core2 = require("@sci-flow/core");
var import_jsx_runtime2 = require("react/jsx-runtime");
function SciFlowMiniMap({
  engine,
  className,
  style,
  width = 150,
  height = 100,
  nodeColor,
  viewportColor,
  backgroundColor
}) {
  const containerRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    if (!containerRef.current || !engine) return;
    const stateManager = engine.stateManager;
    const minimap = new import_core2.Minimap({
      container: containerRef.current,
      stateManager,
      width,
      height,
      nodeColor,
      viewportColor,
      backgroundColor
    });
    return () => {
      minimap.destroy();
    };
  }, [engine, width, height, nodeColor, viewportColor, backgroundColor]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      ref: containerRef,
      className: `sci-flow-minimap ${className || ""}`,
      style: { position: "absolute", bottom: 20, right: 20, zIndex: 100, ...style }
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SciFlow,
  SciFlowMiniMap,
  useSciFlow
});
//# sourceMappingURL=index.cjs.map
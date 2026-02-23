// src/useSciFlow.ts
import { useEffect, useRef, useState } from "react";
import { SciFlow } from "@sci-flow/core";
function useSciFlow({ initialNodes = [], initialEdges = [], renderer = "auto", onInit, ...options } = {}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [nodes, setNodesState] = useState(initialNodes);
  const [edges, setEdgesState] = useState(initialEdges);
  const [portalMounts, setPortalMounts] = useState(/* @__PURE__ */ new Map());
  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;
    engineRef.current = new SciFlow({
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
  useEffect(() => {
    if (!engineRef.current) return;
    const stateManager = engineRef.current.stateManager;
    if (options.onNodeContextMenu) stateManager.onNodeContextMenu = options.onNodeContextMenu;
    if (options.onEdgeContextMenu) stateManager.onEdgeContextMenu = options.onEdgeContextMenu;
    if (options.onPaneContextMenu) stateManager.onPaneContextMenu = options.onPaneContextMenu;
  }, [options.onNodeContextMenu, options.onEdgeContextMenu, options.onPaneContextMenu]);
  useEffect(() => {
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
import { useMemo } from "react";
import { createPortal } from "react-dom";
import { jsx, jsxs } from "react/jsx-runtime";
function SciFlow2({
  className,
  style,
  children,
  nodeTypes = [],
  ...useSciFlowProps
}) {
  const { containerRef, portalMounts, nodes, engine } = useSciFlow({ ...useSciFlowProps, nodeTypes });
  const typeMap = useMemo(() => {
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
  return /* @__PURE__ */ jsxs(
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
            return createPortal(/* @__PURE__ */ jsx(NodeComponent, { node: nodeData, engine }, nodeId), domElement);
          }
          return null;
        }),
        children
      ]
    }
  );
}

// src/SciFlowMiniMap.tsx
import { useEffect as useEffect2, useRef as useRef2 } from "react";
import { Minimap } from "@sci-flow/core";
import { jsx as jsx2 } from "react/jsx-runtime";
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
  const containerRef = useRef2(null);
  useEffect2(() => {
    if (!containerRef.current || !engine) return;
    const stateManager = engine.stateManager;
    const minimap = new Minimap({
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
  return /* @__PURE__ */ jsx2(
    "div",
    {
      ref: containerRef,
      className: `sci-flow-minimap ${className || ""}`,
      style: { position: "absolute", bottom: 20, right: 20, zIndex: 100, ...style }
    }
  );
}
export {
  SciFlow2 as SciFlow,
  SciFlowMiniMap,
  useSciFlow
};
//# sourceMappingURL=index.js.map
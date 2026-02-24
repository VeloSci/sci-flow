import { useEffect, useRef, useState } from 'react';
import { SciFlow, type SciFlowOptions, type Node, type Edge } from '@sci-flow/core';
import type React from 'react';

/** Shape of an accepted React node component passed via nodeTypes */
export interface ReactNodeComponent {
  nodeType?: string;
  type?: string;
  name?: string;
  (props: { node: Node; engine: SciFlow | null }): React.ReactNode;
  displayName?: string;
}

export interface UseSciFlowProps extends Omit<SciFlowOptions, 'container' | 'nodeTypes'> {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  /** React components to use as custom node renderers */
  nodeTypes?: ReactNodeComponent[];
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
  onInit?: (engine: SciFlow) => void;
}

export function useSciFlow({
  initialNodes = [],
  initialEdges = [],
  renderer = 'auto',
  onInit,
  nodeTypes = [],
  ...options
}: UseSciFlowProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SciFlow | null>(null);

  const [nodes, setNodesState] = useState<Node[]>(initialNodes);
  const [edges, setEdgesState] = useState<Edge[]>(initialEdges);
  const [portalMounts, setPortalMounts] = useState<Map<string, HTMLElement>>(new Map());

  // Create engine once, on mount only
  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;

    engineRef.current = new SciFlow({
      container: containerRef.current,
      renderer,
      theme: options.theme,
      direction: options.direction,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
    });

    const stateManager = engineRef.current.stateManager;
    if (stateManager) {
      stateManager.onNodesChange = (newNodes: Node[]) => setNodesState(newNodes);
      stateManager.onEdgesChange = (newEdges: Edge[]) => setEdgesState(newEdges);

      stateManager.onNodeMount = (nodeId: string, container: HTMLElement) => {
        setPortalMounts(prev => {
          if (prev.get(nodeId) === container) return prev;
          const next = new Map(prev);
          next.set(nodeId, container);
          return next;
        });
      };

      stateManager.onNodeUnmount = (nodeId: string) => {
        setPortalMounts(prev => {
          if (!prev.has(nodeId)) return prev;
          const next = new Map(prev);
          next.delete(nodeId);
          return next;
        });
      };

      if (options.onNodeContextMenu) stateManager.onNodeContextMenu = options.onNodeContextMenu;
      if (options.onEdgeContextMenu) stateManager.onEdgeContextMenu = options.onEdgeContextMenu;
      if (options.onPaneContextMenu) stateManager.onPaneContextMenu = options.onPaneContextMenu;
    }

    engineRef.current.setNodes(initialNodes);
    engineRef.current.setEdges(initialEdges);

    onInit?.(engineRef.current);

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  // Propagate theme without remounting
  useEffect(() => {
    if (engineRef.current && options.theme !== undefined) {
      engineRef.current.setTheme(options.theme);
    }
  }, [options.theme]);

  // Propagate direction without remounting
  useEffect(() => {
    if (engineRef.current && options.direction !== undefined) {
      engineRef.current.setDirection(options.direction);
    }
  }, [options.direction]);

  // Update context menu handlers dynamically
  useEffect(() => {
    if (!engineRef.current) return;
    const sm = engineRef.current.stateManager;
    if (options.onNodeContextMenu) sm.onNodeContextMenu = options.onNodeContextMenu;
    if (options.onEdgeContextMenu) sm.onEdgeContextMenu = options.onEdgeContextMenu;
    if (options.onPaneContextMenu) sm.onPaneContextMenu = options.onPaneContextMenu;
  }, [options.onNodeContextMenu, options.onEdgeContextMenu, options.onPaneContextMenu]);

  const setNodes = (n: Node[]) => {
    setNodesState(n);
    engineRef.current?.setNodes(n);
  };

  const setEdges = (e: Edge[]) => {
    setEdgesState(e);
    engineRef.current?.setEdges(e);
  };

  return {
    containerRef,
    engine: engineRef.current,
    nodes,
    edges,
    portalMounts,
    nodeTypes,
    setNodes,
    setEdges,
    fitView: (padding?: number) => engineRef.current?.fitView(padding),
    centerNode: (id: string) => engineRef.current?.centerNode(id),
  };
}

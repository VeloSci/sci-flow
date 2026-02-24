import { useEffect, useRef, useState } from 'react';
import { SciFlow, SciFlowOptions, Node, Edge } from '@sci-flow/core';

export interface UseSciFlowProps extends Omit<SciFlowOptions, 'container'> {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  // Allows registering external custom components from React
  nodeTypes?: Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
  onInit?: (engine: SciFlow) => void;
}

export function useSciFlow({ initialNodes = [], initialEdges = [], renderer = 'auto', onInit, ...options }: UseSciFlowProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SciFlow | null>(null);
  
  // Exposing state for React bindings optionally, though rendering is DOM native bypass
  const [nodes, setNodesState] = useState<Node[]>(initialNodes);
  const [edges, setEdgesState] = useState<Edge[]>(initialEdges);
  const [portalMounts, setPortalMounts] = useState<Map<string, HTMLElement>>(new Map());

  // To avoid constant re-mounts when App re-renders (like theme changes),
  // we need to avoid recreating the engine unless the container changes.
  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;

    engineRef.current = new SciFlow({
      container: containerRef.current,
      renderer,
      ...options
    });

    // CRITICAL: Subscribe to engine events BEFORE setting initial nodes/edges
    const stateManager = engineRef.current.stateManager;
    if (stateManager) {
        stateManager.onNodesChange = (newNodes: Node[]) => setNodesState(newNodes);
        stateManager.onEdgesChange = (newEdges: Edge[]) => setEdgesState(newEdges);
        
        stateManager.onNodeMount = (nodeId: string, container: HTMLElement) => {
             setPortalMounts(prev => {
                 if (prev.get(nodeId) === container) return prev;
                 const newMap = new Map(prev);
                 newMap.set(nodeId, container);
                 return newMap;
             });
        };
        
        stateManager.onNodeUnmount = (nodeId: string) => {
             setPortalMounts(prev => {
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
  }, []); // Run once on mount

  // Watch for Context Menus and update dynamically
  useEffect(() => {
      if (!engineRef.current) return;
      const stateManager = engineRef.current.stateManager;
      if (options.onNodeContextMenu) stateManager.onNodeContextMenu = options.onNodeContextMenu;
      if (options.onEdgeContextMenu) stateManager.onEdgeContextMenu = options.onEdgeContextMenu;
      if (options.onPaneContextMenu) stateManager.onPaneContextMenu = options.onPaneContextMenu;
  }, [options.onNodeContextMenu, options.onEdgeContextMenu, options.onPaneContextMenu]);

  // Watch for dynamic theme changes
  useEffect(() => {
     if (engineRef.current && options.theme !== undefined) {
         engineRef.current.setTheme(options.theme);
     }
  }, [options.theme]);

  const setNodes = (n: Node[]) => {
      setNodesState(n);
      engineRef.current?.setNodes(n);
  }

  const setEdges = (e: Edge[]) => {
      setEdgesState(e);
      engineRef.current?.setEdges(e);
  }

  const fitView = (padding?: number) => engineRef.current?.fitView(padding);
  const centerNode = (id: string) => engineRef.current?.centerNode(id);

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

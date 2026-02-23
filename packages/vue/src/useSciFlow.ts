import { ref, onMounted, onBeforeUnmount, ShallowRef, watch } from 'vue';
import { SciFlow, SciFlowOptions, Node, Edge } from '@sci-flow/core';

export interface UseSciFlowProps extends Omit<SciFlowOptions, 'container'> {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
}

export function useSciFlow(options: UseSciFlowProps = {}) {
  const containerRef = ref<HTMLElement | null>(null);
  const engineRef: ShallowRef<SciFlow | null> = ref(null);
  
  const nodes = ref<Node[]>(options.initialNodes || []);
  const edges = ref<Edge[]>(options.initialEdges || []);
  const portalMounts = ref<Map<string, HTMLElement>>(new Map());

  onMounted(() => {
    if (!containerRef.value) return;

    engineRef.value = new SciFlow({
      container: containerRef.value,
      renderer: options.renderer || 'auto',
      ...options
    });

    // CRITICAL: Subscribe to engine events BEFORE setting initial nodes/edges
    const stateManager = (engineRef.value as any).stateManager;
    if (stateManager) {
        stateManager.onNodesChange = (newNodes: Node[]) => { nodes.value = newNodes; };
        stateManager.onEdgesChange = (newEdges: Edge[]) => { edges.value = newEdges; };
        
        stateManager.onNodeMount = (nodeId: string, container: HTMLElement) => {
            portalMounts.value.set(nodeId, container);
            portalMounts.value = new Map(portalMounts.value); 
        };
        
        stateManager.onNodeUnmount = (nodeId: string) => {
            portalMounts.value.delete(nodeId);
            portalMounts.value = new Map(portalMounts.value);
        };
        
        if (options.onNodeContextMenu) stateManager.onNodeContextMenu = options.onNodeContextMenu;
        if (options.onEdgeContextMenu) stateManager.onEdgeContextMenu = options.onEdgeContextMenu;
        if (options.onPaneContextMenu) stateManager.onPaneContextMenu = options.onPaneContextMenu;
    }

    if (nodes.value.length) engineRef.value.setNodes(nodes.value);
    if (edges.value.length) engineRef.value.setEdges(edges.value);

  });

  onBeforeUnmount(() => {
    if (engineRef.value) {
        engineRef.value.destroy();
        engineRef.value = null;
    }
  });

  // Watch for dynamic theme changes structurally or reactively using a getter
  watch(() => options.theme, (newTheme) => {
     if (engineRef.value && newTheme !== undefined) {
         engineRef.value.setTheme(newTheme);
     }
  });

  const setNodes = (n: Node[]) => {
      nodes.value = n;
      engineRef.value?.setNodes(n);
  };

  const setEdges = (e: Edge[]) => {
      edges.value = e;
      engineRef.value?.setEdges(e);
  };

  const fitView = (padding?: number) => engineRef.value?.fitView(padding);
  const centerNode = (id: string) => engineRef.value?.centerNode(id);

  return {
    containerRef,
    engine: engineRef,
    nodes,
    edges,
    portalMounts,
    setNodes,
    setEdges,
    fitView,
    centerNode
  };
}

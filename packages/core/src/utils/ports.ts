import { Node } from '../types';

export function getPortAnchor(node: Node, portId: string, container?: ParentNode | null, direction?: 'horizontal' | 'vertical'): { x: number, y: number } {
  // Try to read from DOM first (most accurate)
  const root = container || document;
  const nodeGroup = 'getElementById' in root
    ? (root as Document).getElementById(`node-${node.id}`)
    : (root as HTMLElement).querySelector(`#node-${node.id}`);

  if (nodeGroup) {
    const portElement = nodeGroup.querySelector(`[data-portid="${portId}"]`) as SVGCircleElement;
    if (portElement) {
      const cxStr = portElement.getAttribute('cx');
      const cyStr = portElement.getAttribute('cy');
      if (cxStr !== null && cyStr !== null) {
        const cx = parseFloat(cxStr);
        const cy = parseFloat(cyStr);
        if (cx !== 0 || cy !== 0 || portId.endsWith('0')) {
          return { x: node.position.x + cx, y: node.position.y + cy };
        }
      }
    }
  }

  // Fallback: calculate position (for initial render before DOM is ready)
  const nw = node.style?.width || 160;
  const nh = node.style?.height || 100;
  const dir = direction || 'horizontal';

  const inputIds = Object.keys(node.inputs || {});
  const outputIds = Object.keys(node.outputs || {});

  const isInput = !!node.inputs[portId];
  const isOutput = !!node.outputs[portId];

  // Vertical mode: inputs on top, outputs on bottom, spread horizontally
  if (dir === 'vertical') {
    if (isInput) {
      const portIndex = Math.max(0, inputIds.indexOf(portId));
      const spacing = nw / (inputIds.length + 1);
      return { x: node.position.x + spacing * (portIndex + 1), y: node.position.y - 6 };
    } else if (isOutput) {
      const portIndex = Math.max(0, outputIds.indexOf(portId));
      const spacing = nw / (outputIds.length + 1);
      return { x: node.position.x + spacing * (portIndex + 1), y: node.position.y + nh + 6 };
    }
    return { x: node.position.x + nw / 2, y: node.position.y };
  }

  // Horizontal mode: existing left-right behavior
  const config = node.portConfig || 'left-right';
  const headerHeight = 32;
  const portSpacing = 26;

  let side: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'bottom-right' = 'left';
  let portIndex = 0;

  if (isInput) {
    portIndex = inputIds.indexOf(portId);
    if (portIndex === -1 && inputIds.length > 0) portIndex = 0;

    if (config === 'top-bottom' || config === 'top-in-bottom-out') side = 'top';
    else if (config === 'bottom-top' || config === 'bottom-in-top-out') side = 'bottom';
    else if (config === 'right-in-left-out') side = 'right';
    else if (config === 'left-top-in-bottom-right-out') side = 'top-left';
    else if (config === 'bottom-right-in-left-top-out') side = 'bottom-right';
    else side = 'left';
  } else if (isOutput) {
    portIndex = outputIds.indexOf(portId);
    if (portIndex === -1 && outputIds.length > 0) portIndex = 0;

    if (config === 'top-bottom' || config === 'bottom-in-top-out') side = 'bottom';
    else if (config === 'bottom-top' || config === 'top-in-bottom-out') side = 'top';
    else if (config === 'left-in-right-out') side = 'right';
    else if (config === 'right-in-left-out') side = 'left';
    else if (config === 'left-top-in-bottom-right-out') side = 'bottom-right';
    else if (config === 'bottom-right-in-left-top-out') side = 'top-left';
    else side = 'right';
  }

  const bodyHeight = 60; // Dedicated content area (was 26)
  const estimatedPortsOffset = headerHeight + bodyHeight;
  const safeIndex = Math.max(0, portIndex);
  const portY = estimatedPortsOffset + 13 + (safeIndex * portSpacing);

  switch (side) {
    case 'top': return { x: node.position.x + nw / 2, y: node.position.y };
    case 'bottom': return { x: node.position.x + nw / 2, y: node.position.y + nh };
    case 'left': return { x: node.position.x - 6, y: node.position.y + portY };
    case 'right': return { x: node.position.x + nw + 6, y: node.position.y + portY };
    case 'top-left': return { x: node.position.x - 6, y: node.position.y + portY };
    case 'bottom-right': return { x: node.position.x + nw + 6, y: node.position.y + portY };
    default: return { x: node.position.x - 6, y: node.position.y + portY };
  }
}

export function getPortClasses(node: Node): { inClass: string, outClass: string } {
  const config = node.portConfig || 'left-right';
  let inClass = 'port-left';
  let outClass = 'port-right';

  if (config === 'top-bottom' || config === 'top-in-bottom-out') {
    inClass = 'port-top'; outClass = 'port-bottom';
  } else if (config === 'bottom-top' || config === 'bottom-in-top-out') {
    inClass = 'port-bottom'; outClass = 'port-top';
  } else if (config === 'right-in-left-out') {
    inClass = 'port-right'; outClass = 'port-left';
  } else if (config === 'left-top-in-bottom-right-out') {
    inClass = 'port-top-left'; outClass = 'port-bottom-right';
  } else if (config === 'bottom-right-in-left-top-out') {
    inClass = 'port-bottom-right'; outClass = 'port-top-left';
  }

  return { inClass, outClass };
}

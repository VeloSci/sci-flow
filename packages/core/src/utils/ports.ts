import { Node } from '../types';

export function getPortAnchor(node: Node, portId: string): { x: number, y: number } {
  const nw = node.style?.width || 200;
  const nh = node.style?.height || 150;
  const config = (node as any).portConfig || 'left-right';

  // Determine side based on config and portId (in1 or out1)
  let side: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'bottom-right' = 'left';
  
  if (portId === 'in1') {
      if (config === 'top-bottom' || config === 'top-in-bottom-out') side = 'top';
      else if (config === 'bottom-top' || config === 'bottom-in-top-out') side = 'bottom';
      else if (config === 'right-in-left-out') side = 'right';
      else if (config === 'left-top-in-bottom-right-out') side = 'top-left';
      else if (config === 'bottom-right-in-left-top-out') side = 'bottom-right';
      else side = 'left';
  } else {
      if (config === 'top-bottom' || config === 'bottom-in-top-out') side = 'bottom';
      else if (config === 'bottom-top' || config === 'top-in-bottom-out') side = 'top';
      else if (config === 'left-in-right-out') side = 'right';
      else if (config === 'right-in-left-out') side = 'left';
      else if (config === 'left-top-in-bottom-right-out') side = 'bottom-right';
      else if (config === 'bottom-right-in-left-top-out') side = 'top-left';
      else side = 'right';
  }

  switch (side) {
      case 'top': return { x: node.position.x + nw / 2, y: node.position.y };
      case 'bottom': return { x: node.position.x + nw / 2, y: node.position.y + nh };
      case 'left': return { x: node.position.x - 6, y: node.position.y + nh / 2 };
      case 'right': return { x: node.position.x + nw + 6, y: node.position.y + nh / 2 };
      case 'top-left': return { x: node.position.x - 6, y: node.position.y + 18 };
      case 'bottom-right': return { x: node.position.x + nw + 6, y: node.position.y + nh - 18 };
      default: return { x: node.position.x, y: node.position.y };
  }
}

export function getPortClasses(node: Node): { inClass: string, outClass: string } {
    const config = (node as any).portConfig || 'left-right';
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

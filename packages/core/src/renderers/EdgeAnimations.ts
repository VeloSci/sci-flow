/**
 * EdgeAnimations.ts
 *
 * Centralized animation system for sci-flow edges.
 * Provides CSS @keyframes, animation config map, and helper functions
 * for both dash-based and object-based edge animations.
 */

// ─────────────────────────────────────────────
// CSS @keyframes — injected once into the DOM
// ─────────────────────────────────────────────

const EDGE_ANIMATION_CSS = /* css */ `
/* ═══════ Phase 1: Dash / CSS Animations ═══════ */

/* 1. Draw — line draws source→target */
@keyframes sf-draw {
  0%   { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}

/* 2. Draw Reverse — line draws target→source */
@keyframes sf-draw-reverse {
  0%   { stroke-dashoffset: -100; }
  100% { stroke-dashoffset: 0; }
}

/* 3. March — marching ants (flowing dashes) */
@keyframes sf-march {
  0%   { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
}

/* 4. March Reverse */
@keyframes sf-march-reverse {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 24; }
}

/* 5. Draw-Erase — draws then erases */
@keyframes sf-draw-erase {
  0%   { stroke-dashoffset: 100; }
  50%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -100; }
}

/* 6. Fade — opacity pulse */
@keyframes sf-fade {
  0%, 100% { opacity: 0; }
  50%      { opacity: 1; }
}

/* 7. Thick Pulse — stroke-width pulse */
@keyframes sf-thick-pulse {
  0%, 100% { stroke-width: 1.5; }
  50%      { stroke-width: 5; }
}

/* 8. Color Pulse — stroke color shift */
@keyframes sf-color-pulse {
  0%, 100% { stroke: var(--sf-edge-line); }
  50%      { stroke: var(--sf-edge-active); }
}

/* 11. Scale Center — grow from center (dash-based simulation) */
@keyframes sf-scale-center {
  0%, 100% { stroke-dashoffset: 50; }
  50%      { stroke-dashoffset: 0; }
}

/* 12. Scale Start — grow from start (dash-based simulation) */
@keyframes sf-scale-start {
  0%   { stroke-dashoffset: 100; }
  50%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 100; }
}

/* 13. Dots Flow — round dots flowing */
@keyframes sf-dots-flow {
  0%   { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
}

/* 14. Comet — long segment sweeping across */
@keyframes sf-comet {
  0%   { stroke-dashoffset: 30; }
  100% { stroke-dashoffset: -100; }
}

/* 15. Glow — neon drop-shadow pulse */
@keyframes sf-glow {
  0%, 100% { filter: drop-shadow(0 0 1px var(--sf-edge-active)); opacity: 0.5; }
  50%      { filter: drop-shadow(0 0 6px var(--sf-edge-active)); opacity: 1; }
}

/* 16. Wavy Draw — same as draw (path is already wavy if bezier) */
/* Uses sf-draw */

/* 17. Zigzag Draw — same as draw (path is already angled if step) */
/* Uses sf-draw */

/* 18. Fusion — draw from center outward */
@keyframes sf-fusion {
  0%, 100% { stroke-dashoffset: 50; }
  50%      { stroke-dashoffset: 0; }
}

/* 19. Wipe — clip-path reveal */
@keyframes sf-wipe {
  0%   { clip-path: inset(0 100% 0 0); }
  50%  { clip-path: inset(0 0 0 0); }
  100% { clip-path: inset(0 0 0 100%); }
}

/* ═══════ Phase 2: Object-based CSS ═══════ */

/* Traveling object (used with animateMotion, these are secondary CSS anims) */
@keyframes sf-fade-in-out {
  0%   { opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes sf-fade-bounce {
  0%   { opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes sf-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes sf-scale-fade {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}

@keyframes sf-morph-rx {
  0%, 100% { rx: 5px; }
  50%      { rx: 0px; }
}

/* ═══════ Base animation class ═══════ */
.sci-flow-edge-anim {
  animation-iteration-count: infinite !important;
  animation-fill-mode: both !important;
}

.sci-flow-edge-animated-pulse {
  animation: sf-thick-pulse 2s ease-in-out infinite;
}
`;

let stylesInjected = false;

/** Injects the animation CSS @keyframes into the document once. */
export function injectAnimationStyles(): void {
    if (stylesInjected) return;
    const style = document.createElement('style');
    style.id = 'sci-flow-edge-animations';
    style.textContent = EDGE_ANIMATION_CSS;
    document.head.appendChild(style);
    stylesInjected = true;
}

// ─────────────────────────────────────────────
// Animation Configuration Map
// ─────────────────────────────────────────────

export type AnimCategory = 'dash' | 'css' | 'object' | 'compound';

export interface AnimConfig {
    /** Rendering category */
    category: AnimCategory;
    /** CSS animation-name (for .sci-flow-edge-anim class) */
    cssAnimName?: string;
    /** stroke-dasharray to set on fgPath (dash anims only) */
    dasharray?: string;
    /** Whether to set pathLength="100" on fgPath (most dash anims need this) */
    needsPathLength?: boolean;
    /** stroke-linecap for this animation */
    linecap?: 'butt' | 'round' | 'square';
    /** Default duration override */
    defaultDuration?: string;
    /** For object-based: shape of the traveling element */
    objectShape?: 'circle' | 'arrow' | 'rect' | 'x-mark' | 'radar';
    /** For object-based: number of traveling objects */
    objectCount?: number;
    /** For object-based: whether to use alternate direction (ping-pong) */
    alternate?: boolean;
    /** For object-based: secondary CSS animation on the object */
    objectCssAnim?: string;
    /** For object-based: secondary SVG animation on the object */
    objectSvgAnim?: string;
    /** For compound: combine a dash anim + an object anim */
    dashPart?: string;
    objectPart?: string;
    /** For object-based: if true, stays at 50% of the path instead of traveling */
    atCenter?: boolean;
}

/**
 * Resolves legacy animation names to their new equivalents.
 */
export function resolveAnimationType(type: string): string {
    switch (type) {
        case 'pulse': return 'thick-pulse';
        case 'dash': return 'march';
        case 'dotted': return 'dots-flow';
        case 'arrows': return 'arrow-flow';
        case 'beam': return 'comet';
        case 'symbols': return 'arrow-flow'; // fallback
        default: return type;
    }
}

export const ANIMATION_CONFIG: Record<string, AnimConfig> = {
    // ── Phase 1: Dash/CSS ─────────────────────────
    'draw': {
        category: 'dash',
        cssAnimName: 'sf-draw',
        dasharray: '100',
        needsPathLength: true,
    },
    'draw-reverse': {
        category: 'dash',
        cssAnimName: 'sf-draw-reverse',
        dasharray: '100',
        needsPathLength: true,
    },
    'march': {
        category: 'dash',
        cssAnimName: 'sf-march',
        dasharray: '4 4',
        needsPathLength: false,
    },
    'march-reverse': {
        category: 'dash',
        cssAnimName: 'sf-march-reverse',
        dasharray: '4 4',
        needsPathLength: false,
    },
    'draw-erase': {
        category: 'dash',
        cssAnimName: 'sf-draw-erase',
        dasharray: '100',
        needsPathLength: true,
    },
    'fade': {
        category: 'css',
        cssAnimName: 'sf-fade',
    },
    'thick-pulse': {
        category: 'css',
        cssAnimName: 'sf-thick-pulse',
    },
    'color-pulse': {
        category: 'css',
        cssAnimName: 'sf-color-pulse',
    },
    'dots-flow': {
        category: 'dash',
        cssAnimName: 'sf-dots-flow',
        dasharray: '0 12',
        needsPathLength: false,
        linecap: 'round',
    },
    'comet': {
        category: 'dash',
        cssAnimName: 'sf-comet',
        dasharray: '30 100',
        needsPathLength: true,
    },
    'glow': {
        category: 'css',
        cssAnimName: 'sf-glow',
    },
    'scale-center': {
        category: 'dash',
        cssAnimName: 'sf-scale-center',
        dasharray: '50 50',
        needsPathLength: true,
    },
    'scale-start': {
        category: 'dash',
        cssAnimName: 'sf-scale-start',
        dasharray: '100',
        needsPathLength: true,
    },
    'wavy-draw': {
        category: 'dash',
        cssAnimName: 'sf-draw',
        dasharray: '100',
        needsPathLength: true,
    },
    'zigzag-draw': {
        category: 'dash',
        cssAnimName: 'sf-draw',
        dasharray: '100',
        needsPathLength: true,
    },
    'fusion': {
        category: 'dash',
        cssAnimName: 'sf-fusion',
        dasharray: '50 50',
        needsPathLength: true,
    },
    'wipe': {
        category: 'css',
        cssAnimName: 'sf-wipe',
    },

    // ── Phase 2: Object-based ─────────────────────
    'data-packet': {
        category: 'object',
        objectShape: 'circle',
        objectCount: 1,
    },
    'ping-pong': {
        category: 'object',
        objectShape: 'circle',
        objectCount: 1,
        alternate: true,
    },
    'swarm': {
        category: 'object',
        objectShape: 'circle',
        objectCount: 3,
    },
    'arrow-travel': {
        category: 'object',
        objectShape: 'arrow',
        objectCount: 1,
    },
    'arrow-travel-solid': {
        category: 'object',
        objectShape: 'arrow',
        objectCount: 1,
        // Override so draw-arrow doesn't fade at the end
    },
    'arrow-flow': {
        category: 'object',
        objectShape: 'arrow',
        objectCount: 3,
    },
    'arrow-bounce': {
        category: 'object',
        objectShape: 'arrow',
        objectCount: 1,
        alternate: true,
    },
    'spin-square': {
        category: 'object',
        objectShape: 'rect',
        objectCount: 1,
        objectCssAnim: 'sf-spin',
    },
    'morph-slide': {
        category: 'object',
        objectShape: 'rect',
        objectCount: 1,
        objectCssAnim: 'sf-morph-rx',
    },
    'sine-orbit': {
        category: 'object',
        objectShape: 'circle',
        objectCount: 1,
        objectSvgAnim: 'sine-wave',
    },
    'spin-x': {
        category: 'object',
        objectShape: 'x-mark',
        objectCount: 1,
        objectCssAnim: 'sf-spin',
    },
    'radar': {
        category: 'object',
        objectShape: 'radar',
        objectCount: 1,
    },
    'arrow-center-pulse': {
        category: 'object',
        objectShape: 'arrow',
        objectCount: 1,
        objectCssAnim: 'sf-fade',
        atCenter: true,
    },

    // ── Phase 3: Compound ─────────────────────────
    'draw-arrow': {
        category: 'compound',
        dashPart: 'draw',
        objectPart: 'arrow-travel-solid',
    },
    'direction-pulse': {
        category: 'compound',
        dashPart: 'march',
        objectPart: 'arrow-center-pulse', // fading arrow at center
    },
};

// ─────────────────────────────────────────────
// Object Creation Helpers (Phase 2)
// ─────────────────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/** Creates a traveling SVG element with <animateMotion> following an edge path. */
export function createTravelingObject(
    config: AnimConfig,
    edgePathId: string,
    color: string,
    duration: string,
    delay: string
): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'sci-flow-edge-travel-obj');
    g.style.pointerEvents = 'none';

    // Use SVG native `<animate>` for opacity instead of CSS to guarantee 
    // perfect 100% synchronization with `<animateMotion>` across all browsers.
    // Except for specific 'solid' anims like the arrow head of 'draw-arrow'.
    if (!config.atCenter && !config.objectCssAnim?.includes('solid') && edgePathId !== "arrow-travel-solid") {
        const opacityAnim = document.createElementNS(SVG_NS, 'animate');
        opacityAnim.setAttribute('attributeName', 'opacity');
        opacityAnim.setAttribute('dur', duration);
        opacityAnim.setAttribute('repeatCount', 'indefinite');
        
        if (config.alternate) {
            // For bouncing, fade out at both ends (0=0%, 0.5=100%, 1.0=0%)
            opacityAnim.setAttribute('values', '0; 1; 1; 0');
            opacityAnim.setAttribute('keyTimes', '0; 0.1; 0.9; 1');
        } else {
            // normal loops fade out just before teleporting
            opacityAnim.setAttribute('values', '0; 1; 1; 0');
            opacityAnim.setAttribute('keyTimes', '0; 0.05; 0.95; 1');
        }
        
        if (delay && delay !== '0s') {
            opacityAnim.setAttribute('begin', delay);
        }
        g.appendChild(opacityAnim);
    }

    let shapeEl: SVGElement;

    switch (config.objectShape) {
        case 'arrow': {
            const poly = document.createElementNS(SVG_NS, 'polygon');
            poly.setAttribute('points', '-5,-4 5,0 -5,4');
            poly.setAttribute('fill', color);
            shapeEl = poly;
            break;
        }
        case 'rect': {
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('x', '-4');
            rect.setAttribute('y', '-4');
            rect.setAttribute('width', '8');
            rect.setAttribute('height', '8');
            rect.setAttribute('fill', color);
            rect.setAttribute('rx', '1');
            shapeEl = rect;
            break;
        }
        case 'x-mark': {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', 'M-4,-4 L4,4 M4,-4 L-4,4');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('fill', 'none');
            shapeEl = path;
            break;
        }
        case 'radar': {
            // Inner dot + expanding ring
            const innerDot = document.createElementNS(SVG_NS, 'circle');
            innerDot.setAttribute('r', '3');
            innerDot.setAttribute('fill', color);
            g.appendChild(innerDot);

            const ring = document.createElementNS(SVG_NS, 'circle');
            ring.setAttribute('r', '3');
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', color);
            ring.setAttribute('stroke-width', '1');
            ring.style.animation = `sf-scale-fade ${duration} ${delay || '0s'} infinite`;
            ring.style.transformOrigin = 'center';
            ring.style.transformBox = 'fill-box';
            g.appendChild(ring);

            // Add animateMotion to the group
            addAnimateMotion(g, edgePathId, duration, delay, config.alternate || false);
            return g;
        }
        case 'circle':
        default: {
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('r', '3');
            circle.setAttribute('fill', color);
            shapeEl = circle;
            break;
        }
    }

    // Apply secondary CSS animation if specified
    if (config.objectCssAnim && shapeEl!) {
        shapeEl!.style.animation = `${config.objectCssAnim} ${duration} ${delay || '0s'} infinite`;
        shapeEl!.style.transformOrigin = 'center';
        shapeEl!.style.transformBox = 'fill-box';
    }

    // Apply secondary SVG animation if specified
    if (config.objectSvgAnim === 'sine-wave' && shapeEl!) {
        const animTransform = document.createElementNS(SVG_NS, 'animateTransform');
        animTransform.setAttribute('attributeName', 'transform');
        animTransform.setAttribute('type', 'translate');
        // Oscillate up and down perpendicular to the path
        animTransform.setAttribute('values', '0,-15; 0,15; 0,-15');
        animTransform.setAttribute('dur', '1s'); // fixed fast frequency
        animTransform.setAttribute('repeatCount', 'indefinite');
        shapeEl.appendChild(animTransform);
    }

    g.appendChild(shapeEl!);

    // Add animateMotion to the SVG group
    addAnimateMotion(g, edgePathId, duration, delay, config.alternate || false, config.atCenter || false);

    return g;
}

function addAnimateMotion(
    el: SVGElement,
    edgePathId: string,
    duration: string,
    delay: string,
    alternate: boolean,
    atCenter: boolean = false
): void {
    const motion = document.createElementNS(SVG_NS, 'animateMotion');
    motion.setAttribute('dur', duration);
    motion.setAttribute('repeatCount', 'indefinite');
    
    // Only auto-rotate if it's actually moving to prevent jitter
    if (!atCenter) {
        motion.setAttribute('rotate', 'auto');
    }

    if (delay && delay !== '0s') {
        motion.setAttribute('begin', delay);
    }
    
    if (atCenter) {
        motion.setAttribute('keyPoints', '0.5;0.5');
        motion.setAttribute('keyTimes', '0;1');
        motion.setAttribute('calcMode', 'linear');
    } else if (alternate) {
        // SVG doesn't have animationDirection on animateMotion, use keyPoints + keyTimes
        motion.setAttribute('keyPoints', '0;1;0');
        motion.setAttribute('keyTimes', '0;0.5;1');
        motion.setAttribute('calcMode', 'linear');
    } else {
        // Pure uninterrupted forward motion
        motion.setAttribute('keyPoints', '0;1');
        motion.setAttribute('keyTimes', '0;1');
        motion.setAttribute('calcMode', 'linear');
    }

    const mpath = document.createElementNS(SVG_NS, 'mpath');
    mpath.setAttributeNS(XLINK_NS, 'xlink:href', `#${edgePathId}`);
    motion.appendChild(mpath);

    el.appendChild(motion);
}

/** Colors for swarm mode (multiple objects) */
const SWARM_COLORS = ['#3b82f6', '#10b981', '#ef4444'];

/**
 * Creates all traveling objects for an edge animation.
 * Returns a container <g> element with all objects inside.
 */
export function createAnimationObjects(
    config: AnimConfig,
    edgePathId: string,
    edgeColor: string,
    duration: string,
    animationColor?: string
): SVGGElement {
    const container = document.createElementNS(SVG_NS, 'g');
    container.setAttribute('class', 'sci-flow-edge-anim-objects');
    container.style.pointerEvents = 'none';

    const count = config.objectCount || 1;
    const useColor = animationColor || edgeColor;

    for (let i = 0; i < count; i++) {
        const fraction = i / count;
        const delay = `${fraction * parseFloat(duration)}s`;
        const color = config.objectShape === 'circle' && count > 1
            ? (SWARM_COLORS[i % SWARM_COLORS.length])
            : useColor;

        const obj = createTravelingObject(
            config,
            edgePathId,
            color,
            duration,
            delay
        );

        container.appendChild(obj);
    }

    return container;
}

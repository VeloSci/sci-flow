import { StateManager } from '../state/StateManager';
import { Position } from '../types';

export type EasingFn = (t: number) => number;

export const easings = {
    linear: (t: number) => t,
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number) => t * (2 - t),
    easeIn: (t: number) => t * t,
    spring: (t: number) => 1 - Math.cos(t * Math.PI * 0.5)
};

/** Smoothly animates node positions for layout transitions. */
export class AnimationManager {
    private animationId: number | null = null;

    constructor(private stateManager: StateManager) {}

    /** Animate a set of nodes from their current positions to new ones. */
    public animateNodePositions(
        targets: Map<string, Position>,
        duration = 400,
        easing: EasingFn = easings.easeInOut
    ): Promise<void> {
        return new Promise((resolve) => {
            this.cancel();
            const state = this.stateManager.getState();
            const starts = new Map<string, Position>();

            targets.forEach((_, id) => {
                const node = state.nodes.get(id);
                if (node) starts.set(id, { ...node.position });
            });

            const startTime = performance.now();

            const tick = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const t = easing(progress);

                starts.forEach((startPos, id) => {
                    const target = targets.get(id);
                    if (!target) return;
                    const x = startPos.x + (target.x - startPos.x) * t;
                    const y = startPos.y + (target.y - startPos.y) * t;
                    this.stateManager.updateNodePosition(id, x, y, true);
                });

                this.stateManager.forceUpdate();

                if (progress < 1) {
                    this.animationId = requestAnimationFrame(tick);
                } else {
                    this.animationId = null;
                    this.stateManager.saveSnapshot();
                    resolve();
                }
            };

            this.animationId = requestAnimationFrame(tick);
        });
    }

    /** Smoothly animate viewport transition. */
    public animateViewport(
        target: { x: number; y: number; zoom: number },
        duration = 300,
        easing: EasingFn = easings.easeInOut
    ): Promise<void> {
        return new Promise((resolve) => {
            const state = this.stateManager.getState();
            const start = { ...state.viewport };
            const startTime = performance.now();

            const tick = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const t = easing(progress);

                this.stateManager.setViewport({
                    x: start.x + (target.x - start.x) * t,
                    y: start.y + (target.y - start.y) * t,
                    zoom: start.zoom + (target.zoom - start.zoom) * t
                });

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(tick);
        });
    }

    public cancel() {
        if (this.animationId != null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

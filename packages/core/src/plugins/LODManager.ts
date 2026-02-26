import { StateManager } from '../state/StateManager';

export type LODLevel = 'full' | 'simplified' | 'dot';

export interface LODThresholds {
    /** Below this zoom, show only dots */
    dotThreshold: number;
    /** Below this zoom but above dotThreshold, show simplified view */
    simplifiedThreshold: number;
}

const DEFAULT_THRESHOLDS: LODThresholds = {
    dotThreshold: 0.2,
    simplifiedThreshold: 0.5
};

/** Manages Level-of-Detail rendering — hides/simplifies node content based on zoom. */
export class LODManager {
    private currentLevel: LODLevel = 'full';
    private thresholds: LODThresholds;
    private listeners: Set<(level: LODLevel) => void> = new Set();

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager,
        thresholds?: Partial<LODThresholds>
    ) {
        this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    }

    /** Call this on every viewport change to update LOD level. */
    public update() {
        const zoom = this.stateManager.getState().viewport.zoom;
        let newLevel: LODLevel = 'full';

        if (zoom < this.thresholds.dotThreshold) {
            newLevel = 'dot';
        } else if (zoom < this.thresholds.simplifiedThreshold) {
            newLevel = 'simplified';
        }

        if (newLevel !== this.currentLevel) {
            this.currentLevel = newLevel;
            this.container.setAttribute('data-lod', newLevel);
            this.listeners.forEach(l => l(newLevel));
        }
    }

    public getLevel(): LODLevel { return this.currentLevel; }

    public onLevelChange(fn: (level: LODLevel) => void): () => void {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    public setThresholds(thresholds: Partial<LODThresholds>) {
        Object.assign(this.thresholds, thresholds);
        this.update();
    }
}

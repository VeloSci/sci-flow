export interface SciFlowPlugin {
    name: string;
    version: string;
    dependencies?: string[];
    onInit?: (engine: unknown) => void;
    onStateChange?: () => void;
    onDestroy?: () => void;
}

/** Standardized plugin interface for third-party extensions via engine.use(). */
export class PluginAPI {
    private plugins = new Map<string, SciFlowPlugin>();
    private engine: unknown = null;

    /** Set the engine reference (called by SciFlow constructor). */
    public setEngine(engine: unknown) { this.engine = engine; }

    /** Register a plugin. */
    public use(plugin: SciFlowPlugin): boolean {
        // Check dependencies
        if (plugin.dependencies) {
            for (const dep of plugin.dependencies) {
                if (!this.plugins.has(dep)) {
                    console.warn(`Plugin "${plugin.name}" requires "${dep}" which is not registered.`);
                    return false;
                }
            }
        }
        this.plugins.set(plugin.name, plugin);
        plugin.onInit?.(this.engine);
        return true;
    }

    /** Remove a plugin. */
    public unregister(name: string) {
        const plugin = this.plugins.get(name);
        plugin?.onDestroy?.();
        this.plugins.delete(name);
    }

    /** Notify all plugins of state change. */
    public notifyStateChange() {
        this.plugins.forEach(p => p.onStateChange?.());
    }

    /** Destroy all plugins. */
    public destroyAll() {
        this.plugins.forEach(p => p.onDestroy?.());
        this.plugins.clear();
    }

    public getPlugin(name: string): SciFlowPlugin | undefined { return this.plugins.get(name); }
    public listPlugins(): SciFlowPlugin[] { return [...this.plugins.values()]; }
    public hasPlugin(name: string): boolean { return this.plugins.has(name); }
}

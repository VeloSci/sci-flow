// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginHost } from './PluginHost';
import { StateManager } from '../state/StateManager';
import { HistoryManager } from '../state/HistoryManager';

describe('PluginHost', () => {
  let container: HTMLDivElement;
  let stateManager: StateManager;
  let historyManager: HistoryManager;
  let pluginHost: PluginHost;

  beforeEach(() => {
    // We use JSDOM (configured in vitest) to create a mock container
    container = document.createElement('div');
    stateManager = new StateManager();
    historyManager = new HistoryManager();
    pluginHost = new PluginHost(container, stateManager, historyManager);
  });

  it('should initialize all interaction and plugin managers', () => {
    expect(pluginHost.touch).toBeDefined();
    expect(pluginHost.resizer).toBeDefined();
    expect(pluginHost.toolbar).toBeDefined();
    expect(pluginHost.edgeLabels).toBeDefined();
    expect(pluginHost.drop).toBeDefined();
    expect(pluginHost.lasso).toBeDefined();
    expect(pluginHost.collision).toBeDefined();
    expect(pluginHost.snap).toBeDefined();
    expect(pluginHost.groups).toBeDefined();
    expect(pluginHost.reconnect).toBeDefined();
    expect(pluginHost.shortcuts).toBeDefined();
    expect(pluginHost.helperLines).toBeDefined();
    expect(pluginHost.annotations).toBeDefined();

    expect(pluginHost.lod).toBeDefined();
    expect(pluginHost.animation).toBeDefined();
    expect(pluginHost.exporter).toBeDefined();
    expect(pluginHost.collapse).toBeDefined();
    expect(pluginHost.evaluation).toBeDefined();
    expect(pluginHost.layout).toBeDefined();
    expect(pluginHost.search).toBeDefined();
    expect(pluginHost.zoomToSelection).toBeDefined();
    expect(pluginHost.snapshots).toBeDefined();
    expect(pluginHost.collab).toBeDefined();
    expect(pluginHost.perfMonitor).toBeDefined();
    expect(pluginHost.a11y).toBeDefined();
    expect(pluginHost.edgeBundler).toBeDefined();
    expect(pluginHost.stickyNotes).toBeDefined();
    expect(pluginHost.pluginAPI).toBeDefined();
    expect(pluginHost.historyPersistence).toBeDefined();
  });

  it('should call update methods on state change', () => {
    const lodUpdateSpy = vi.spyOn(pluginHost.lod, 'update').mockImplementation(() => {});
    const edgeLabelsReconcileSpy = vi.spyOn(pluginHost.edgeLabels, 'reconcile').mockImplementation(() => {});
    const toolbarUpdateSpy = vi.spyOn(pluginHost.toolbar, 'updatePosition').mockImplementation(() => {});
    const annotationsReconcileSpy = vi.spyOn(pluginHost.annotations, 'reconcile').mockImplementation(() => {});
    const apiNotifySpy = vi.spyOn(pluginHost.pluginAPI, 'notifyStateChange').mockImplementation(() => {});

    pluginHost.onStateChange();

    expect(lodUpdateSpy).toHaveBeenCalled();
    expect(edgeLabelsReconcileSpy).toHaveBeenCalled();
    expect(toolbarUpdateSpy).toHaveBeenCalled();
    expect(annotationsReconcileSpy).toHaveBeenCalled();
    expect(apiNotifySpy).toHaveBeenCalled();
  });

  it('should call destroy methods on destroy', () => {
    const toolbarDestroySpy = vi.spyOn(pluginHost.toolbar, 'destroy').mockImplementation(() => {});
    const edgeLabelsDestroySpy = vi.spyOn(pluginHost.edgeLabels, 'destroy').mockImplementation(() => {});
    const dropDestroySpy = vi.spyOn(pluginHost.drop, 'destroy').mockImplementation(() => {});
    const annotationsDestroySpy = vi.spyOn(pluginHost.annotations, 'destroy').mockImplementation(() => {});
    const perfMonitorDestroySpy = vi.spyOn(pluginHost.perfMonitor, 'destroy').mockImplementation(() => {});
    const apiDestroySpy = vi.spyOn(pluginHost.pluginAPI, 'destroyAll').mockImplementation(() => {});

    pluginHost.destroy();

    expect(toolbarDestroySpy).toHaveBeenCalled();
    expect(edgeLabelsDestroySpy).toHaveBeenCalled();
    expect(dropDestroySpy).toHaveBeenCalled();
    expect(annotationsDestroySpy).toHaveBeenCalled();
    expect(perfMonitorDestroySpy).toHaveBeenCalled();
    expect(apiDestroySpy).toHaveBeenCalled();
  });
});

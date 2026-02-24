import { Theme } from '../types';
import { lightTheme, darkTheme } from '../theme/defaultThemes';

export class ThemeManager {
    private currentTheme: Theme = lightTheme;
    private styleInjector: HTMLStyleElement;

    constructor(private container: HTMLElement, private stateManagerId: string) {
        this.styleInjector = document.createElement('style');
        this.styleInjector.id = 'sci-flow-theme-injector';
        this.container.appendChild(this.styleInjector);
    }

    public setTheme(themeOpt?: Partial<Theme> | 'light' | 'dark' | 'system') {
        let baseTheme = lightTheme;

        if (themeOpt === 'dark') {
            baseTheme = darkTheme;
        } else if (themeOpt === 'system') {
            baseTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;
        } else if (typeof themeOpt === 'object') {
            baseTheme = (themeOpt.name === 'dark' ? darkTheme : lightTheme);
        }

        this.currentTheme = typeof themeOpt === 'object' ? {
            name: themeOpt.name || baseTheme.name,
            colors: { ...baseTheme.colors, ...(themeOpt.colors || {}) }
        } : baseTheme;

        this.applyThemeVariables();
    }

    private applyThemeVariables() {
        if (!this.styleInjector) return;

        const colors = this.currentTheme.colors;
        const cssVars = `
          .sci-flow-container-${this.stateManagerId} {
              --sf-bg: ${colors.background};
              --sf-grid-dot: ${colors.gridDot};
              --sf-node-bg: ${colors.nodeBackground};
              --sf-node-border: ${colors.nodeBorder};
              --sf-node-text: ${colors.nodeText};
              --sf-node-header-text: ${colors.nodeHeaderText};
              --sf-node-header-ops: ${colors.nodeHeaderOps};
              --sf-node-header-input: ${colors.nodeHeaderInput};
              --sf-node-header-output: ${colors.nodeHeaderOutput};
              --sf-node-selected: ${colors.nodeSelected};
              --sf-edge-line: ${colors.edgeLine};
              --sf-edge-active: ${colors.edgeActive};
              --sf-edge-animated: ${colors.edgeAnimated};
              --sf-port-bg: ${colors.portBackground};
              --sf-port-border: ${colors.portBorder};
              --sf-port-active: ${colors.portActive};
              --sf-context-bg: ${colors.contextMenuBackground};
              --sf-context-text: ${colors.contextMenuText};
              --sf-context-hover: ${colors.contextMenuHover};
              --sf-selection-bg: ${colors.selectionBoxBackground};
              --sf-selection-border: ${colors.selectionBoxBorder};
          }
          
          .sci-flow-container-${this.stateManagerId} .sci-flow-edge-bg:hover + .sci-flow-edge-fg {
              stroke: var(--sf-edge-active) !important;
              stroke-width: 3px !important;
          }
          
          .sci-flow-container-${this.stateManagerId} .sci-flow-edge-bg:hover ~ circle {
              stroke: var(--sf-edge-active) !important;
              stroke-width: 3px !important;
              transform: scale(1.5);
              transform-origin: center;
              transform-box: fill-box;
          }

          .sci-flow-container-${this.stateManagerId} .sci-flow-node:hover > foreignObject > div {
              box-shadow: 0 0 15px var(--sf-edge-active) !important;
              transition: box-shadow 0.2s ease;
          }

          .sci-flow-container-${this.stateManagerId}.sci-flow-dragging * {
              user-select: none !important;
              -webkit-user-select: none !important;
          }
        `;

        this.styleInjector.innerHTML = cssVars;
        this.container.classList.add(`sci-flow-container-${this.stateManagerId}`);
    }

    public destroy() {
        this.styleInjector.remove();
    }
}

/** Accessibility (a11y) manager — ARIA labels, focus management, high-contrast. */
export class A11yManager {
    private container: HTMLElement;
    private highContrast = false;

    constructor(container: HTMLElement) {
        this.container = container;
        this.applyBaseA11y();
    }

    private applyBaseA11y() {
        this.container.setAttribute('role', 'application');
        this.container.setAttribute('aria-label', 'Flow Editor Canvas');
        this.container.setAttribute('tabindex', '0');
    }

    /** Apply ARIA labels to all nodes and edges. */
    public updateLabels() {
        this.container.querySelectorAll('.sci-flow-node-group').forEach(group => {
            const id = group.id?.replace('node-group-', '') || '';
            const title = group.querySelector('.sci-flow-node-header')?.textContent || id;
            group.setAttribute('role', 'button');
            group.setAttribute('aria-label', `Node: ${title}`);
            group.setAttribute('tabindex', '0');
        });

        this.container.querySelectorAll('.sci-flow-edge-group').forEach(group => {
            const id = group.id?.replace('edge-group-', '') || '';
            group.setAttribute('role', 'img');
            group.setAttribute('aria-label', `Edge: ${id}`);
        });
    }

    /** Focus the next/prev node via keyboard navigation. */
    public focusNode(direction: 'next' | 'prev') {
        const nodes = [...this.container.querySelectorAll('.sci-flow-node-group[tabindex]')] as HTMLElement[];
        if (nodes.length === 0) return;
        const focused = document.activeElement;
        const idx = nodes.indexOf(focused as HTMLElement);
        const next = direction === 'next' ? (idx + 1) % nodes.length : (idx - 1 + nodes.length) % nodes.length;
        nodes[next]?.focus();
    }

    /** Toggle high-contrast mode. */
    public toggleHighContrast() {
        this.highContrast = !this.highContrast;
        this.container.classList.toggle('sci-flow-high-contrast', this.highContrast);
    }

    /** Announce a message to screen readers. */
    public announce(message: string) {
        let announcer = this.container.querySelector('.sci-flow-sr-announcer') as HTMLElement;
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.className = 'sci-flow-sr-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = 'position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);';
            this.container.appendChild(announcer);
        }
        announcer.textContent = message;
    }

    public isHighContrast(): boolean { return this.highContrast; }
}

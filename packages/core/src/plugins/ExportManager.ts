import { StateManager } from '../state/StateManager';

/** Exports the current flow as PNG or SVG. */
export class ExportManager {
    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {}

    /** Export the flow viewport as a PNG Blob. */
    public async toPNG(scale = 2): Promise<Blob> {
        const svg = this.container.querySelector('svg.sci-flow-svg');
        if (!svg) throw new Error('No SVG element found in sci-flow container');

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        const canvas = document.createElement('canvas');
        const rect = svg.getBoundingClientRect();
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;

        return new Promise((resolve, reject) => {
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas 2D not supported')); return; }
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to create PNG blob'));
                }, 'image/png');
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
            img.src = url;
        });
    }

    /** Export the flow as an SVG string. */
    public toSVG(): string {
        const svg = this.container.querySelector('svg.sci-flow-svg');
        if (!svg) throw new Error('No SVG element found in sci-flow container');
        return new XMLSerializer().serializeToString(svg);
    }

    /** Download the flow as a file. */
    public async download(filename: string, format: 'png' | 'svg' | 'json' = 'png') {
        let blob: Blob;
        let ext: string;

        if (format === 'json') {
            blob = new Blob([this.stateManager.toJSON()], { type: 'application/json' });
            ext = 'json';
        } else if (format === 'svg') {
            blob = new Blob([this.toSVG()], { type: 'image/svg+xml' });
            ext = 'svg';
        } else {
            blob = await this.toPNG();
            ext = 'png';
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

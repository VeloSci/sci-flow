import React, { useEffect, useRef } from 'react';
import { Minimap, SciFlow } from '@sci-flow/core';

export interface SciFlowMiniMapProps {
    engine: SciFlow | null;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    nodeColor?: string;
    viewportColor?: string;
    backgroundColor?: string;
}

export function SciFlowMiniMap({
    engine,
    className,
    style,
    width = 150,
    height = 100,
    nodeColor,
    viewportColor,
    backgroundColor
}: SciFlowMiniMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !engine) return;

        const stateManager = (engine as any).stateManager;
        const minimap = new Minimap({
            container: containerRef.current,
            stateManager,
            width,
            height,
            nodeColor,
            viewportColor,
            backgroundColor
        });

        return () => {
            minimap.destroy();
        };
    }, [engine, width, height, nodeColor, viewportColor, backgroundColor]);

    return (
        <div 
            ref={containerRef} 
            className={`sci-flow-minimap ${className || ''}`}
            style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 100, ...style }}
        />
    );
}

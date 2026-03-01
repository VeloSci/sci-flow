import React, { useState, useRef, useEffect } from 'react';
import { ANIMATION_CONFIG, resolveAnimationType, type AnimConfig } from '@sci-flow/core';
import { ChevronDown } from 'lucide-react';

interface EdgeAnimationSelectorProps {
  currentAnim: string;
  onSelect: (type: string) => void;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

/**
 * Categories for organizing the animation options.
 */
const CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'Dashes & Flow', types: ['dash', 'dotted', 'march', 'march-reverse', 'dots-flow', 'comet', 'draw', 'draw-erase', 'fusion'] },
  { label: 'Effects & Pulse', types: ['pulse', 'thick-pulse', 'glow', 'fade', 'color-pulse', 'wipe', 'scale-center', 'scale-start'] },
  { label: 'Traveling Objects', types: ['arrows', 'symbols', 'arrow-travel', 'arrow-flow', 'arrow-bounce', 'data-packet', 'swarm', 'ping-pong', 'radar', 'sine-orbit', 'spin-x', 'spin-square', 'morph-slide'] },
  { label: 'Advanced', types: ['beam', 'draw-arrow', 'direction-pulse'] },
];

/**
 * A sleek, high-performance animation selector for sci-flow edges.
 * Provides live SVG previews for each animation type.
 */
export function EdgeAnimationSelector({ currentAnim, onSelect, lineStyle }: EdgeAnimationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const renderPreview = (type: string, isLarge = false) => {
    if (type === 'none') {
      const dash = lineStyle === 'dashed' ? '4,3' : lineStyle === 'dotted' ? '1,2' : 'none';
      return (
        <svg width={isLarge ? "48" : "32"} height="16" viewBox="0 0 32 16" style={{ overflow: 'visible' }}>
          <path d="M 4,12 L 14,12 L 18,4 L 28,4" stroke="currentColor" strokeWidth="1.5" fill="none" 
            strokeDasharray={dash} 
            style={{ opacity: 0.5 }}
          />
        </svg>
      );
    }

    const resolved = resolveAnimationType(type);
    const config = ANIMATION_CONFIG[resolved];
    if (!config) return null;

    const getsAnimClass = config.category === 'dash' || config.category === 'css' || config.category === 'compound';
    
    // Determine dasharray for the preview path
    let dashArray = 'none';
    if (config.category === 'dash' && config.dasharray) {
        dashArray = config.dasharray;
    } else if (lineStyle === 'dashed') {
        dashArray = '4,3';
    } else if (lineStyle === 'dotted') {
        dashArray = '1,2';
    }

    // A small representative orthogonal path for the preview
    const previewPath = "M 4,12 L 14,12 L 18,4 L 28,4";

    return (
      <svg width={isLarge ? "48" : "32"} height="16" viewBox="0 0 32 16" style={{ overflow: 'visible' }}>
        {/* Base Path */}
        <path d={previewPath} 
          stroke="currentColor" 
          strokeWidth="1.8" 
          fill="none"
          className={getsAnimClass ? 'sci-flow-edge-anim' : ''}
          pathLength={config.needsPathLength ? "100" : undefined}
          style={{
            animationName: config.cssAnimName,
            animationDuration: '2.5s',
            strokeDasharray: dashArray,
            strokeLinecap: config.linecap,
            opacity: config.category === 'object' ? 0.25 : 1
          }}
        />

        {/* Traveling Objects Preview */}
        {(config.category === 'object' || config.category === 'compound') && (
            <g>
                {renderTravelingObject(config, previewPath)}
            </g>
        )}
      </svg>
    );
  };

  const renderTravelingObject = (config: AnimConfig, path: string) => {
      // Extract shape type from the config or nested parts
      const actualConfig = config.category === 'compound' && config.objectPart 
        ? ANIMATION_CONFIG[config.objectPart] 
        : config;
        
      const shapeType = actualConfig?.objectShape || 'circle';
      
      let element: React.ReactNode;
      if (shapeType === 'arrow') {
          element = <path d="M -3.5,-3 L 4,0 L -3.5,3 Z" fill="currentColor" />;
      } else if (shapeType === 'x-mark') {
          element = <path d="M -2.5,-2.5 L 2.5,2.5 M 2.5,-2.5 L -2.5,2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />;
      } else if (shapeType === 'radar') {
          element = (
              <g>
                  <circle r="1.5" fill="currentColor" />
                  <circle r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8">
                      <animate attributeName="r" from="1.5" to="7" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
              </g>
          );
      } else if (shapeType === 'rect') {
          element = <rect x="-2.5" y="-2.5" width="5" height="5" fill="currentColor" rx="1" />;
      } else {
          element = <circle r="2.5" fill="currentColor" />;
      }

      return (
          <g>
            <g style={{
                animation: actualConfig?.objectCssAnim ? `${actualConfig.objectCssAnim} 2.5s infinite` : 'none',
                transformBox: 'fill-box',
                transformOrigin: 'center'
            }}>
                {element}
            </g>
            <animateMotion 
                dur="1.8s" 
                repeatCount="indefinite" 
                path={path}
                rotate="auto"
                calcMode="linear"
            />
          </g>
      );
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-white/5 text-white border border-white/10 text-[11px] font-semibold transition-all hover:bg-white/10 hover:border-white/20 outline-none hover:shadow-lg hover:shadow-black/20"
      >
        <div className="w-8 h-4 flex items-center justify-center bg-black/60 rounded ring-1 ring-white/10 overflow-hidden">
          {renderPreview(currentAnim)}
        </div>
        <span className="capitalize min-w-[70px] text-left truncate">{currentAnim === 'none' ? 'Animation' : currentAnim}</span>
        <ChevronDown size={14} className={`transition-transform text-white/40 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 max-h-[80vh] overflow-y-auto rounded-xl bg-[#0e0e11] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] py-2 scrollbar-style backdrop-blur-xl">
          <button 
             onClick={() => { onSelect('none'); setIsOpen(false); }}
             className={`flex items-center gap-3 w-full px-4 py-2 text-[11px] text-left transition-all hover:bg-white/5 border-b border-white/5 mb-1 ${currentAnim === 'none' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300'}`}
          >
            <div className="w-10 h-5 flex items-center justify-center bg-black/60 rounded-md shrink-0 overflow-hidden ring-1 ring-white/10">
              {renderPreview('none', true)}
            </div>
            <span className="font-bold">None</span>
          </button>

          {CATEGORIES.map(category => (
            <div key={category.label} className="mb-2">
              <div className="px-4 py-1.5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{category.label}</div>
              {category.types.map(type => (
                <button
                  key={type}
                  onClick={() => { onSelect(type); setIsOpen(false); }}
                  className={`group flex items-center gap-3 w-full px-4 py-2 text-[11px] text-left transition-all hover:bg-white/5 ${currentAnim === type ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className="w-10 h-5 flex items-center justify-center bg-black/80 rounded-md shrink-0 overflow-hidden ring-1 ring-white/5 transition-transform group-hover:scale-110">
                    {renderPreview(type, true)}
                  </div>
                  <span className="capitalize font-medium">{type}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-style::-webkit-scrollbar { width: 4px; }
        .scrollbar-style::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-style::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .scrollbar-style::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}

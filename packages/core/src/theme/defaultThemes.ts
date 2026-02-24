import { Theme } from '../types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#f8f9fa',
    gridDot: '#d7d9dd',
    nodeBackground: '#ffffff',
    nodeBorder: '#e2e8f0',
    nodeText: '#1e293b',
    nodeHeaderText: '#ffffff',
    nodeHeaderOps: '#475569',
    nodeHeaderInput: '#0ea5e9',
    nodeHeaderOutput: '#ef4444',
    nodeSelected: '#3b82f6',
    edgeLine: '#94a3b8',
    edgeActive: '#3b82f6',
    edgeAnimated: '#3b82f6',
    portBackground: '#cbd5e1',
    portBorder: '#94a3b8',
    portActive: '#3b82f6',
    contextMenuBackground: '#ffffff',
    contextMenuText: '#1e293b',
    contextMenuHover: '#f1f5f9',
    selectionBoxBackground: 'rgba(59, 130, 246, 0.1)',
    selectionBoxBorder: 'rgba(59, 130, 246, 0.5)'
  }
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#0f172a',
    gridDot: '#334155',
    nodeBackground: '#1e293b',
    nodeBorder: '#334155',
    nodeText: '#f8fafc',
    nodeHeaderText: '#ffffff',
    nodeHeaderOps: '#334155',
    nodeHeaderInput: '#0369a1',
    nodeHeaderOutput: '#991b1b',
    nodeSelected: '#ffffff',
    edgeLine: '#475569',
    edgeActive: '#60a5fa',
    edgeAnimated: '#60a5fa',
    portBackground: '#1e293b',
    portBorder: '#64748b',
    portActive: '#ffffff',
    contextMenuBackground: '#1e293b',
    contextMenuText: '#f1f5f9',
    contextMenuHover: '#334155',
    selectionBoxBackground: 'rgba(96, 165, 250, 0.1)',
    selectionBoxBorder: 'rgba(96, 165, 250, 0.5)'
  }
};

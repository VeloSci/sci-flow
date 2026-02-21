import { getSmartOrthogonalPath } from '../utils/routing';
import { Position, Rect } from '../types';

export interface PathfindingWorkerMessageData {
    id: string; // Job ID for async callback
    source: Position;
    target: Position;
    obstacles: Rect[];
    padding?: number;
}

export interface PathfindingWorkerResponse {
    id: string; // Job ID
    path: string; // The generated SVG path
}

// Receive messages from the main thread
self.onmessage = (e: MessageEvent<PathfindingWorkerMessageData>) => {
    const { id, source, target, obstacles, padding } = e.data;
    
    // Execute intense mathematical algorithm
    const path = getSmartOrthogonalPath(source, target, obstacles, padding);
    
    // Send back to main thread
    const response: PathfindingWorkerResponse = {
        id,
        path
    };
    
    self.postMessage(response);
};

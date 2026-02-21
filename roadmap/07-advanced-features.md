# Roadmap: Advanced Features (Fase 7)

Pensando en un editor de nodos profesional de clase mundial (como React Flow, LiteGraph o Unreal Blueprints), el núcleo de Sci-Flow (`packages/core`) se extenderá con las siguientes funcionalidades:

## 1. Atajos de Teclado (Keyboard Shortcuts Manager)
Gestor de teclado nativo:
- `Delete` / `Backspace`: Borrar nodos/cables seleccionados.
- `Flechas (Arriba, Abajo, Izq, Der)`: Mover (nudging) los nodos seleccionados píxel a píxel para alinearlos perfectamente.
- `Ctrl + A` / `Cmd + A`: Seleccionar todo.
- `Barra Espaciadora + Arrastre`: Panear el canvas (estilo Photoshop/Figma).

## 2. Utilidades de Control de Vista (Viewport Helpers)
Funciones exportadas para los frameworks que controlen el paneo cinemáticamente:
- `engine.fitView()`: Aleja o acerca la cámara automáticamente para que todos los nodos entren perfectamente en la pantalla.
- `engine.centerNode(id)`: Hace una animación de paneo directa hacia un nodo específico.

## 3. Auto-Alineación y "Snap to Grid" (Magnetismo)
Ajustes de precisión matemática para alinear visualmente:
- **Snap to Grid:** Al arrastrar un nodo, se alinea con la cuadrícula de fondo (`GridRenderer`).
- **Smart Guides:** Líneas punteadas al coincidir bordes de nodos cercanos.

## 4. Sistema de Deshacer / Rehacer (Undo/Redo History)
Stack de memoria dentro del `StateManager` que capture instantáneas (snapshots) o deltas.
- **Acciones:** `Ctrl + Z` (Deshacer) y `Ctrl + Y` / `Cmd + Shift + Z` (Rehacer).

## 5. Copiar, Cortar y Pegar (Clipboard)
Soporte para serializar nodos y cables hacia el portapapeles del sistema operativo (`navigator.clipboard`).
- **Acciones:** `Ctrl + C`, `Ctrl + X`, `Ctrl + V`.

## 6. Agrupación de Nodos (Subgraphs / Parent Nodes)
Capacidad de que un nodo contenga a otros nodos dentro de él. Si arrastras el "Nodo Grupo", todos los nodos hijos se mueven con él de manera relativa.

## 7. Enrutamiento Inteligente de Cables (Obstacle Avoidance)
Algoritmos (ej. A-Star) que buscan caminos vacíos en el canvas para que los cables dibujen ángulos rectos esquivando las cajas de los nodos.

## 8. Minimapa (Overview)
Un pequeño componente para ver la imagen global y saltar a secciones específicas del canvas.

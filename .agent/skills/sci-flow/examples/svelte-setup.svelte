<script>
  import { SciFlow, Background, BackgroundVariant } from '@sci-flow/svelte';
  import '@sci-flow/core/styles.css';
  import { writable } from 'svelte/store';

  const nodes = writable([{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' } }]);
  const edges = writable([{ id: 'e1', source: '1', target: '2' }]);
</script>

<div style="width: 100%; height: 500px;">
  <SciFlow {nodes} {edges} fitView>
    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
  </SciFlow>
</div>

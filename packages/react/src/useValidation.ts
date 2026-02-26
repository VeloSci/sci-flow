import { useCallback, useState } from 'react';
import type { SciFlow } from '@sci-flow/core';
import {
  type ConnectionValidator,
  preventSelfLoop,
  preventDuplicateEdge,
  preventCycles,
  enforceConnectionLimit,
  composeValidators
} from '@sci-flow/core';

/**
 * Connection validation helpers. Provides built-in validators
 * and a way to compose custom ones.
 */
export function useValidation(_engine: SciFlow | null) {
  const [validators] = useState<ConnectionValidator[]>([
    preventSelfLoop,
    preventDuplicateEdge
  ]);

  const addCycleCheck = useCallback(() => {
    validators.push(preventCycles);
  }, [validators]);

  const addConnectionLimit = useCallback((max: number) => {
    validators.push(enforceConnectionLimit(max));
  }, [validators]);

  const getComposed = useCallback(() => {
    return composeValidators(...validators);
  }, [validators]);

  return {
    validators,
    addCycleCheck,
    addConnectionLimit,
    getComposed,
    preventSelfLoop,
    preventDuplicateEdge,
    preventCycles,
    enforceConnectionLimit,
    composeValidators
  };
}

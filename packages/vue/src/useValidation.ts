import {
  type ConnectionValidator,
  preventSelfLoop,
  preventDuplicateEdge,
  preventCycles,
  enforceConnectionLimit,
  composeValidators
} from '@sci-flow/core';

/**
 * Connection validation composable for Vue.
 */
export function useValidation() {
  const validators: ConnectionValidator[] = [
    preventSelfLoop,
    preventDuplicateEdge
  ];

  const addCycleCheck = () => validators.push(preventCycles);
  const addConnectionLimit = (max: number) => validators.push(enforceConnectionLimit(max));
  const getComposed = () => composeValidators(...validators);

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

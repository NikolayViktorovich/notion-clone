import SuperJSON from 'superjson';

export function serializeState<T>(state: T): string {
  return SuperJSON.stringify(state);
}

export function deserializeState<T>(serialized: string): T {
  return SuperJSON.parse(serialized);
}

export function cloneState<T>(state: T): T {
  return deserializeState(serializeState(state));
}
import { createRef, useEffect } from 'react';

const map = new Map();

function set(key) {
  if (!key) throw new Error(`The ref key must be valid (key: "${key}")`);

  // If the Ref already exists
  if (map.has(key)) return map.get(key);

  // If the Ref doesn't exist
  const ref = createRef();
  map.set(key, ref);
  return ref;
}

function remove(key) {
  if (!key) throw new Error(`The ref key must be valid (key: "${key}")`);

  return map.delete(key);
}

export function useGlobalRefMap(id) {
  useEffect(() => {
    // Prevent memory leaks
    return () => remove(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Defined "get" as an alias of "set" for extra syntactic sugar
  return { set, get: set, remove };
}

import { LegacyRef } from 'react';
import { useCallback, useState } from 'react';

function useRefCallback<T>() {
  const [node, setNode] = useState<HTMLElement>();
  const setRef = useCallback((node: HTMLElement) => {
    setNode(node);
  }, []) as LegacyRef<T>;
  return [setRef, node as T];
}
export default useRefCallback;

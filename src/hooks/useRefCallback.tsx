import { Ref } from 'react';
import { useCallback, useState } from 'react';

function useRefCallback<T>() {
  const [node, setNode] = useState<HTMLElement>();
  const setRef = useCallback((node: HTMLElement) => {
    setNode(node);
  }, []) as Ref<T>;
  return [setRef, node as T];
}
export default useRefCallback;

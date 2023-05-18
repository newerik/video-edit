import { useState } from 'react';

function useForceUpdate() {
  const [value, setValue] = useState(true); // integer state
  return () => setValue(!value); // update state to force render
}

export default useForceUpdate;

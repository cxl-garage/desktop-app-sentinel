import React from 'react';

function usePrevious<T>(newValue: T): T | undefined {
  const previousRef = React.useRef<T>();

  React.useEffect(() => {
    previousRef.current = newValue;
  });

  return previousRef.current;
}

export default usePrevious;

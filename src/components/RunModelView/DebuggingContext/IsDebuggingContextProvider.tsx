import React from 'react';
import { Button } from '../../ui/Button';
import { IsDebuggingContext } from './IsDebuggingContext';

interface IProps {
  children: React.ReactNode;
}

function IsDebuggingContextProvider({ children }: IProps): JSX.Element {
  const [isDebugging, setIsDebugging] = React.useState(false);
  return (
    <IsDebuggingContext.Provider value={isDebugging}>
      {children}
      <div className="absolute bottom-1 right-1">
        <Button type="text" onClick={() => setIsDebugging((v) => !v)}>
          <span className="text-white hover:text-blue-400">&Pi;</span>
        </Button>
      </div>
    </IsDebuggingContext.Provider>
  );
}

export default IsDebuggingContextProvider;

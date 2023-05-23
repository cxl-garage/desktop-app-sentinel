import { createContext, useContext } from 'react';

export const IsDebuggingContext = createContext<boolean>(false);

export const useIsDebugging = (): boolean => {
  return useContext(IsDebuggingContext);
};

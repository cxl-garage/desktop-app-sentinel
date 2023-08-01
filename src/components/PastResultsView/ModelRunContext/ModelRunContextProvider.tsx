import { ModelRun } from 'generated/prisma/client';
import React, { useMemo, useState } from 'react';
import { ModelRunContext } from './ModelRunContext';

interface IProps {
  modelRunInput: ModelRun;
  children: React.ReactNode;
}

function ModelRunContextProvider({
  modelRunInput,
  children,
}: IProps): JSX.Element {
  const [modelRun, setModelRun] = useState(modelRunInput);
  const providerValue = useMemo(() => {
    return { modelRun, setModelRun };
  }, [modelRun, setModelRun]);
  return (
    <ModelRunContext.Provider value={providerValue}>
      {children}
    </ModelRunContext.Provider>
  );
}

export default ModelRunContextProvider;

import { Modal, Result } from 'antd';
import { useIsDebugging } from 'components/RunModelView/DebuggingContext/IsDebuggingContext';
import { Button } from 'components/ui/Button';
import { MISSING_DIR_ERROR_MESSAGE } from 'main/SentinelDesktopService/errors';
import { useState } from 'react';
import DirectoryInput from 'components/RunModelView/RunModelInputs/formItems/DirectoryInput';
import { useMutation } from '@tanstack/react-query';
import { ModelRun } from 'generated/prisma/client';
import { useModelRun } from './ModelRunContext/ModelRunContext';

export default function ErrorSummary({ error }: { error: Error }): JSX.Element {
  const isDebugging = useIsDebugging();
  const { modelRun, setModelRun } = useModelRun();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outputDirectory, setOutputDirectory] = useState(modelRun.outputPath);
  const { mutate } = useMutation({
    mutationFn: ({
      modelRunId,
      newOutputDirectory,
    }: {
      modelRunId: number;
      newOutputDirectory: string;
    }) =>
      window.SentinelDesktopService.updateModelRun(
        modelRunId,
        newOutputDirectory,
      ),
    onSuccess: (newModelRun: ModelRun) => {
      setModelRun(newModelRun);
    },
  });
  let errorTitle = `Error loading images`;

  let extra;
  if (isDebugging) {
    errorTitle = `Error loading images: ${error.message}`;
  } else if (error.message.includes(MISSING_DIR_ERROR_MESSAGE)) {
    errorTitle = MISSING_DIR_ERROR_MESSAGE;
    extra = (
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        Update directory
      </Button>
    );
    // TODO: Add button to allow directory changes (maybe also add in result information section)
  }
  return (
    <>
      <Result status="warning" title={errorTitle} extra={extra} />
      <Modal
        title="Update"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          setIsModalOpen(false);
          const newModelRun = { ...modelRun, outputPath: outputDirectory };
          setModelRun(newModelRun); // optimistically set model before query completes
          mutate({
            modelRunId: modelRun.id,
            newOutputDirectory: outputDirectory,
          });
        }}
      >
        <DirectoryInput
          value={outputDirectory}
          onChange={(newValue) => setOutputDirectory(newValue)}
        />
      </Modal>
    </>
  );
}

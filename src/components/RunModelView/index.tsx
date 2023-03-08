import { Heading } from 'components/ui/Heading';
import { FileInput, FileInfo } from 'components/ui/FileInput';
import { Button } from 'components/ui/Button';

export function RunModelView(): JSX.Element {
  const onFileOrFolderSelected = (fileInfo: FileInfo): void => {
    console.log(fileInfo);
  };

  // TODO: remove these elements whenever you want, these are here just as
  // throwaway UI examples.
  return (
    <div>
      <Heading.H1>Import model</Heading.H1>
      <FileInput directory onFileSelected={onFileOrFolderSelected}>
        Pick a directory
      </FileInput>
      <FileInput type="drag-area" onFileSelected={onFileOrFolderSelected}>
        Drop a file here
      </FileInput>
      <Button type="primary" onClick={() => alert('clicked!')}>
        Test button
      </Button>
    </div>
  );
}

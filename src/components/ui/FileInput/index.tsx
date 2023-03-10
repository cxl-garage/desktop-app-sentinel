import * as React from 'react';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'components/ui/Button';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

export type FileInfo = UploadChangeParam<UploadFile>;

type Props = {
  /** If true this will allow directory selection rather than a single file */
  directory?: boolean;

  /** Render as a button or a drag & drop area? */
  type?: 'button' | 'drag-area';
  children: React.ReactNode;
  onFileSelected?: (info: FileInfo) => void;
};

// a dummy request given that this component doesn't actually upload anything.
// We are using this just as a file/folder picker.
function dummyRequest({ onSuccess }: UploadRequestOption): void {
  setTimeout(() => {
    if (onSuccess) {
      onSuccess('ok');
    }
  }, 0);
}

/**
 * A File Input component. This is a thin wrapper around the Ant Design Upload
 * component, except we aren't using this to upload anything. This component is
 * used only as a file or folder picker.
 *
 * This component supports rendering as a button or as a drag & drop area.
 */
export function FileInput({
  children,
  onFileSelected,
  directory = false,
  type = 'button',
}: Props): JSX.Element {
  const [loading, setLoading] = React.useState(false);

  const onChange = React.useCallback(
    (info: UploadChangeParam<UploadFile>): void => {
      const {
        file: { status },
      } = info;

      if (status === 'uploading' && !loading) {
        setLoading(true);

        if (onFileSelected) {
          onFileSelected(info);
        }
      } else {
        setLoading(false);
      }
    },
    [loading, onFileSelected],
  );

  const commonProps = {
    directory,
    onChange,
    customRequest: dummyRequest,
  };

  if (type === 'button') {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Upload {...commonProps}>
        <Button icon={<UploadOutlined />}>{children}</Button>
      </Upload>
    );
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Upload.Dragger {...commonProps}>{children}</Upload.Dragger>;
}

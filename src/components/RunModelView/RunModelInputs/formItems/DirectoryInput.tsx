import { CloseOutlined, FolderOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface IProps {
  value?: string;
  onChange?: (newValue: string) => void;
}

function DirectoryInput({ value, onChange }: IProps): JSX.Element {
  return (
    <div>
      <Button
        onClick={async () => {
          const path = await window.SentinelDesktopService.selectOutputFolder();
          if (onChange) {
            onChange(path);
          }
        }}
      >
        Choose a directory
      </Button>
      {value && (
        <div className="ml-1 mt-2 flex items-baseline text-gray-500">
          <FolderOutlined className="mr-1" />
          <span>{value}</span>
          <button
            type="button"
            className="text-red-400"
            onClick={() => {
              if (onChange) {
                console.log('setting to empty');
                onChange('');
              }
            }}
          >
            <CloseOutlined />
          </button>
        </div>
      )}
    </div>
  );
}

export default DirectoryInput;

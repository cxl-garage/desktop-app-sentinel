import { DeleteTwoTone, FolderOutlined } from '@ant-design/icons';
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
        Choose a folder
      </Button>
      {value && (
        <div className="ml-1 mt-2 flex items-baseline text-gray-500">
          <FolderOutlined className="mr-1" />
          <span>{value}</span>
          <button
            type="button"
            className="ml-2"
            onClick={() => {
              if (onChange) {
                onChange('');
              }
            }}
          >
            <DeleteTwoTone twoToneColor="#f87171" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DirectoryInput;

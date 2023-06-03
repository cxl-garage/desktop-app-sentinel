import { Radio } from 'antd';
import React from 'react';
import EImageGridSize from '../PaginatedImageGrid/EImageGridSize';
import PhotoIcon from './PhotoIcon';

interface IProps {
  gridSize: EImageGridSize;
  onChange: (newValue: EImageGridSize) => void;
}

function ImageGridSizeSelect({ gridSize, onChange }: IProps): JSX.Element {
  return (
    <Radio.Group
      size="small"
      className="whitespace-nowrap"
      options={[
        EImageGridSize.SMALL,
        EImageGridSize.DEFAULT,
        EImageGridSize.LARGE,
      ].map((it) => ({ label: <PhotoIcon size={it} />, value: it }))}
      onChange={(e) => onChange(e.target.value)}
      value={gridSize}
      optionType="button"
    />
  );
}

export default ImageGridSizeSelect;

import { Radio } from 'antd';
import React from 'react';
import EGridSize from './EGridSize';
import PhotoIcon from './PhotoIcon';

interface IProps {
  gridSize: EGridSize;
  onChange: (newValue: EGridSize) => void;
}

function GridSizeSelect({ gridSize, onChange }: IProps): JSX.Element {
  return (
    <Radio.Group
      size="small"
      className="whitespace-nowrap"
      options={[EGridSize.SMALL, EGridSize.DEFAULT, EGridSize.LARGE].map(
        (it) => ({ label: <PhotoIcon size={it} />, value: it }),
      )}
      onChange={(e) => onChange(e.target.value)}
      value={gridSize}
      optionType="button"
    />
  );
}

export default GridSizeSelect;

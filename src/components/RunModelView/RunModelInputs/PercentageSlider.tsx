import { InputNumber, Slider } from 'antd';
import React from 'react';

const MIN = 0;
const MAX = 100;

interface IProps {
  value?: number;
  onChange?: (v: number | null) => void;
}

function PercentageSlider({ value, onChange }: IProps): JSX.Element {
  return (
    <div className="flex w-full">
      <div style={{ flex: 1 }}>
        <Slider min={MIN} max={MAX} value={value} onChange={onChange} />
      </div>
      <InputNumber
        min={MIN}
        max={MAX}
        formatter={(v) => `${v}%`}
        parser={(v) => (v ? Number.parseInt(v.replace('%', ''), 10) : 0)}
        style={{ margin: '0 16px' }}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default PercentageSlider;

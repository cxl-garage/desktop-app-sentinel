import { InputNumber, Slider } from 'antd';
import React from 'react';
import styled from 'styled-components';

const MIN = 0;
const MAX = 100;

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

function PercentageSlider({
  value,
  onChange,
}: {
  value?: number;
  onChange?: (v: number | null) => void;
}): JSX.Element {
  return (
    <Wrapper>
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
    </Wrapper>
  );
}

export default PercentageSlider;

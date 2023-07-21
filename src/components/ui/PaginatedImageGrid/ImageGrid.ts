import styled from 'styled-components';
import EImageGridSize from './EImageGridSize';

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: ${({
    size = EImageGridSize.DEFAULT,
  }: {
    size: EImageGridSize;
  }) => `repeat(
    auto-fill,
    minmax(min(${size}px, 100%), 1fr)
  );`};
  gap: 20px;
`;

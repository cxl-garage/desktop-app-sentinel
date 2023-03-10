import { Image as AntImage } from 'antd';

type Props = {
  src: string;
};

/**
 * A Image component. This is a thin wrapper around the Ant Design Image
 * component.
 */
export function Image({ src }: Props): JSX.Element {
  return <AntImage src={src} />;
}

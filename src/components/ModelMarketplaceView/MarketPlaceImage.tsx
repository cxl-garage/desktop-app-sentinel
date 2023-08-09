import { Image } from 'components/ui/Image';
import { Typography } from 'antd';

type Props = {
  src: string;
  title: string;
  titleLevel: 1 | 2 | 3 | 4 | 5;
};

export function MarketPlaceImage({
  src,
  title,
  titleLevel,
}: Props): JSX.Element {
  return (
    <div>
      <div className="flex w-full justify-center">
        <Image src={src} preview={false} />
      </div>
      <div className="flex w-full justify-center">
        <Typography.Title level={titleLevel}>{title}</Typography.Title>
      </div>
    </div>
  );
}

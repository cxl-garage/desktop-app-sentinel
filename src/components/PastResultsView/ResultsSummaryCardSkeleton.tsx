import { Skeleton } from 'antd';
import { Card } from 'components/ui/Card';
import { CardShadowWrapper } from './PastResultsViewStyledComponents';

export function ResultsSummaryCardSkeleton(): JSX.Element {
  return (
    <CardShadowWrapper className="my-4">
      <Card>
        <Skeleton active className="h-80" />
      </Card>
    </CardShadowWrapper>
  );
}

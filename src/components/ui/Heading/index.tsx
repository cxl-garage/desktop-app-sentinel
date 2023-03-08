import * as React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

type Props = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
};

/**
 * A Heading component. This is a thin wrapper around the And Design Title
 * component.
 */
export function Heading({ children, level = 1 }: Props): JSX.Element {
  return <Title level={level}>{children}</Title>;
}

/* eslint-disable react/jsx-props-no-spreading */
Heading.H1 = (props: Omit<Props, 'level'>) => <Heading level={1} {...props} />;
Heading.H2 = (props: Omit<Props, 'level'>) => <Heading level={2} {...props} />;
Heading.H3 = (props: Omit<Props, 'level'>) => <Heading level={3} {...props} />;
Heading.H4 = (props: Omit<Props, 'level'>) => <Heading level={4} {...props} />;
Heading.H5 = (props: Omit<Props, 'level'>) => <Heading level={5} {...props} />;
/* eslint-enable */

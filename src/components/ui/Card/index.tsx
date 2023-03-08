import * as React from 'react';
import { Card as AntCard } from 'antd';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export function Card({ children, title }: Props): JSX.Element {
  return <AntCard title={title}>{children}</AntCard>;
}

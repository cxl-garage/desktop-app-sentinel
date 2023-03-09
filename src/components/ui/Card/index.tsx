import * as React from 'react';
import { Card as AntCard } from 'antd';

type Props = {
  children: React.ReactNode;
  title?: string;
};

/**
 * A Card component. This is a thin wrapper around the And Design Card
 * component.
 */
export function Card({ children, title }: Props): JSX.Element {
  return <AntCard title={title}>{children}</AntCard>;
}

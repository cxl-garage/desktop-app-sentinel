import * as React from 'react';
import './Layout.css';
import { Navigation } from './Navigation';
import { Navbar } from '../Navbar';

type Props = {
  children: React.ReactNode;
};

/**
 * Sets layout of each page after being signed in.
 */
export function Layout({ children }: Props): JSX.Element {
  return (
    <>
      <Navbar />
      <div className="grid">
        <div>
          <Navigation />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}

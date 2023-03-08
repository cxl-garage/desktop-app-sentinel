import * as React from 'react';
import './Layout.css';
import { Navigation } from './Navigation';
import { Navbar } from './Navbar';

type Props = {
  children: React.ReactNode;
};

/**
 * Sets layout of each page after being signed in.
 */
export function Layout({ children }: Props): JSX.Element {
  return (
    <div className="Layout">
      <Navbar />
      <div className="Layout__grid">
        <div>
          <Navigation />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

import * as React from 'react';
import './Layout.css';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

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
      <div className="Layout__grid">
        <div>
          <Sidebar />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}

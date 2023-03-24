import * as React from 'react';
import './Layout.css';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

type Props = {
  children: React.ReactNode;
  setDarkMode: (darkMode: boolean) => void;
};

/**
 * Sets layout of each page after being signed in.
 */
export function Layout({ children, setDarkMode }: Props): JSX.Element {
  return (
    <>
      <Navbar setDarkMode={setDarkMode} />
      <div className="Layout__grid">
        <div>
          <Sidebar />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}

import React from 'react';
import EImageGridSize from '../PaginatedImageGrid/EImageGridSize';

function PhotoIcon({ size }: { size: EImageGridSize }): JSX.Element {
  const w = (() => {
    switch (size) {
      case EImageGridSize.LARGE:
        return 'w-6 h-6';
      case EImageGridSize.SMALL:
        return 'w-3.5 h-3.5';
      case EImageGridSize.DEFAULT:
      default:
        return 'w-4.5 h-4.5';
    }
  })();
  return (
    <span className="inline-flex h-full items-center align-middle">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={w}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </span>
  );
}

export default PhotoIcon;

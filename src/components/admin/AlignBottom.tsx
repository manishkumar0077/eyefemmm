
import React from 'react';

const AlignBottom = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <polygon points="12 20 12 2 17 7" />
    </svg>
  );
};

export default AlignBottom;

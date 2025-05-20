
import React from 'react';

const AlignTop = ({ className }: { className?: string }) => {
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
      <line x1="4" y1="4" x2="20" y2="4" />
      <line x1="9" y1="14" x2="15" y2="14" />
      <polygon points="12 4 12 22 7 17" />
    </svg>
  );
};

export default AlignTop;

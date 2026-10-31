import React, { useId } from 'react';

export default function Logo({ className = 'w-6 h-6', ...props }) {
  const rawId = useId();
  const gradId1 = `attestify-grad1-${rawId.replace(/:/g, '')}`;
  const gradId2 = `attestify-grad2-${rawId.replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id={gradId1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id={gradId2} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <polygon
        points="26,74 26,58 42,58 42,42 58,42 58,26 74,26 74,42 58,42 58,58 42,58 42,74"
        fill={`url(#${gradId1})`}
      />
      <rect
        x="58"
        y="58"
        width="16"
        height="16"
        rx="3"
        fill={`url(#${gradId2})`}
      />
    </svg>
  );
}

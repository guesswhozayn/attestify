import React, { useId } from 'react';

export default function AttestifyLogoMark({ className = 'w-6 h-6', ...props }) {
  const rawId = useId();
  const gradId = `attestify-grad-${rawId.replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path
        d="M50 14 L82 32 V68 L50 86 L18 68 V32 Z"
        stroke={`url(#${gradId})`}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M50 14 L50 50 L82 68"
        stroke={`url(#${gradId})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 50 L18 68"
        stroke={`url(#${gradId})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

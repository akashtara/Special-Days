import React from 'react';

export const AppLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ff4d6d', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#c9184a', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M50 85c-1.5 0-3-.5-4.2-1.5C32.5 73.2 15 58.5 15 38.5 15 25.5 25.5 15 38.5 15c7.5 0 14.5 3.5 19 9.5 4.5-6 11.5-9.5 19-9.5C89.5 15 100 25.5 100 38.5c0 20-17.5 34.7-30.8 45-1.2 1-2.7 1.5-4.2 1.5H50z" transform="scale(0.85) translate(8.8, 8.8)" fill="url(#logoGrad)" />
    <circle cx="50" cy="50" r="46" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="6,4" className="animate-[spin_10s_linear_infinite]" />
    <defs>
      <filter id="textShadow">
        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.5" />
      </filter>
    </defs>
  </svg>
);

export const FunctionLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20L80 80H20L50 20Z" fill="#ff4d6d" fillOpacity="0.2" stroke="#ff4d6d" strokeWidth="2" />
    <circle cx="50" cy="55" r="15" fill="#c9184a" />
    <path d="M40 55H60M50 45V65" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const SecurityLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10L15 25V50C15 70 30 85 50 90C70 85 85 70 85 50V25L50 10Z" fill="#ff4d6d" fillOpacity="0.1" stroke="#ff4d6d" strokeWidth="4" />
    <path d="M35 50L45 60L65 40" stroke="#ff4d6d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

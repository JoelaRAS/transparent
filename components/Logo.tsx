import React from 'react';

type LogoProps = {
  className?: string;
};

/**
 * Simplified vector logo inspired by the provided globe/eye design.
 */
const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Transparence"
    >
      <defs>
        <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#102B4F" />
          <stop offset="100%" stopColor="#59C18B" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="#0A0F14" stroke="url(#globeGradient)" strokeWidth="6" />
      <circle cx="100" cy="100" r="90" fill="url(#globeGradient)" opacity="0.55" />
      <path
        d="M25 100C25 100 55 55 100 55C145 55 175 100 175 100C175 100 145 145 100 145C55 145 25 100 25 100Z"
        fill="#0A0F14"
        stroke="#0A0F14"
        strokeWidth="3"
      />
      <circle cx="100" cy="100" r="26" fill="url(#globeGradient)" />
      <circle cx="100" cy="100" r="12" fill="#0A0F14" />
      <circle cx="108" cy="92" r="5" fill="#ffffff" opacity="0.9" />
    </svg>
  );
};

export default Logo;

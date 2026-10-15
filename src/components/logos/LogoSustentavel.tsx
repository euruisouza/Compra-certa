import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
}

export const LogoSustentavel: React.FC<LogoProps> = ({
  className = '',
  size = 36,
  showText = false,
  textColor = '#15251C',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Emblem SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
        style={{ width: size, height: size }}
        aria-label="Logo Compra Certa Sustentável"
      >
        <defs>
          <linearGradient id="sustentavelGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E5A32" />
            <stop offset="50%" stopColor="#118447" />
            <stop offset="100%" stopColor="#15A255" />
          </linearGradient>
          <linearGradient id="leafGradIcon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="leafGradIcon2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="shadowSustentavelIcon" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#073B20" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Rounded Container */}
        <rect width="512" height="512" rx="120" fill="url(#sustentavelGradIcon)" />
        <circle cx="256" cy="256" r="195" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="4" />
        <circle cx="256" cy="256" r="170" fill="#FFFFFF" fillOpacity="0.05" />

        {/* Cart & Leaves */}
        <g transform="translate(48, 48) scale(0.81)" filter="url(#shadowSustentavelIcon)">
          {/* Leaves */}
          <path d="M 280 200 C 280 130 330 90 380 90 C 380 150 340 210 280 200 Z" fill="url(#leafGradIcon1)" />
          <path d="M 285 195 Q 330 145 375 95" stroke="#064E3B" strokeWidth="5" strokeLinecap="round" fill="none" />

          <path d="M 270 210 C 230 170 235 120 270 100 C 295 130 295 180 270 210 Z" fill="url(#leafGradIcon2)" />
          <path d="M 268 200 Q 260 150 268 105" stroke="#065F46" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Cart frame */}
          <path
            d="M 60 120 L 110 120 L 165 340 L 400 340 L 450 190 L 175 190"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cart grid */}
          <path
            d="M 235 205 L 225 325 M 295 210 L 290 325 M 355 205 L 350 325 M 180 255 L 430 255"
            stroke="#E6F4EA"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />

          {/* Chassis */}
          <path d="M 145 390 L 385 390" stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" />

          {/* Wheels */}
          <g transform="translate(180, 410)">
            <circle cx="0" cy="0" r="32" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="15" fill="#118447" />
          </g>
          <g transform="translate(355, 410)">
            <circle cx="0" cy="0" r="32" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="15" fill="#118447" />
          </g>

          {/* Checkmark Badge */}
          <circle cx="395" cy="145" r="56" fill="#FFFFFF" />
          <circle cx="395" cy="145" r="46" fill="#EAF7EE" />
          <path
            d="M 372 145 L 389 162 L 420 128"
            fill="none"
            stroke="#118447"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className="text-base sm:text-lg font-extrabold tracking-tight leading-none"
            style={{ color: textColor }}
          >
            Compra Certa
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#10B981] flex items-center gap-1 mt-0.5 tracking-wide">
            <span>🌿</span>
            <span>Sustentável</span>
          </span>
        </div>
      )}
    </div>
  );
};

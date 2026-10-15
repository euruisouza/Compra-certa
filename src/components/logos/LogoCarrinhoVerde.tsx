import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
}

export const LogoCarrinhoVerde: React.FC<LogoProps> = ({
  className = '',
  size = 36,
  showText = false,
  textColor = '#15251C',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Modern Green Cart Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
        style={{ width: size, height: size }}
        aria-label="Logo Compra Certa com Carrinho Verde"
      >
        <defs>
          <linearGradient id="carrinhoVerdeGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="60%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <filter id="shadowCartIcon" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#14532D" floodOpacity="0.32" />
          </filter>
        </defs>

        {/* Rounded Modern Square Base */}
        <rect width="512" height="512" rx="128" fill="url(#carrinhoVerdeGradIcon)" />
        <circle cx="256" cy="256" r="200" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="6" />
        <circle cx="256" cy="256" r="150" fill="none" stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="4" />

        {/* Dynamic Supermarket Cart with Verification Checkmark */}
        <g transform="translate(68, 80) scale(0.74)" filter="url(#shadowCartIcon)">
          {/* Main Cart Frame */}
          <path
            d="M 40 85 L 105 85 L 175 355 L 420 355 L 475 160 L 140 160"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Handle Grip accent */}
          <line x1="30" y1="85" x2="70" y2="85" stroke="#BBF7D0" strokeWidth="34" strokeLinecap="round" />

          {/* Basket Grids */}
          <path
            d="M 195 185 L 210 330 M 265 185 L 275 330 M 335 185 L 340 330 M 405 185 L 405 330 M 150 230 L 450 230 M 165 290 L 430 290"
            stroke="#DCFCE7"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />

          {/* Bottom Chassis */}
          <path d="M 150 415 L 395 415" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" />

          {/* Wheels */}
          <g transform="translate(185, 440)">
            <circle cx="0" cy="0" r="36" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="18" fill="#15803D" />
            <circle cx="0" cy="0" r="7" fill="#FFFFFF" />
          </g>
          <g transform="translate(370, 440)">
            <circle cx="0" cy="0" r="36" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="18" fill="#15803D" />
            <circle cx="0" cy="0" r="7" fill="#FFFFFF" />
          </g>

          {/* Precision Checkmark Seal */}
          <g transform="translate(390, 100)">
            <circle cx="0" cy="0" r="74" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="62" fill="#16A34A" />
            <circle cx="0" cy="0" r="54" fill="#FFFFFF" />
            <path
              d="M -26 0 L -8 18 L 26 -16"
              fill="none"
              stroke="#15803D"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
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
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#16A34A] flex items-center gap-1 mt-0.5 tracking-wide">
            <span>🛒</span>
            <span>Carrinho Verde</span>
          </span>
        </div>
      )}
    </div>
  );
};

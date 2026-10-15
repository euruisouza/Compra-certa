import React from 'react';

interface AppLogoProps {
  size?: number | string;
  variant?: 'icon' | 'horizontal' | 'vertical';
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  variant = 'icon',
  className = '',
  showText = false,
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 40;

  const logoSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      style={{ width: size, height: size }}
      aria-label="Logo Compra Certa"
    >
      <defs>
        {/* Modern Emerald-Green Gradient */}
        <linearGradient id="compraCertaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B4D26" />
          <stop offset="45%" stopColor="#118447" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BBF7D0" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>

        <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2FBE8" />
        </linearGradient>

        <filter id="cartGlow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#063219" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Rounded Modern App Badge */}
      <rect width="512" height="512" rx="120" fill="url(#compraCertaGrad)" />

      {/* Subtle Inner Rings for Premium Finish */}
      <circle cx="256" cy="256" r="200" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="4" />
      <circle cx="256" cy="256" r="160" fill="none" stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="2" />

      {/* Dynamic Shopping Cart with Freshness Leaf & Verification */}
      <g transform="translate(62, 70) scale(0.76)" filter="url(#cartGlow)">
        {/* Natural fresh leaf nestled in basket */}
        <path
          d="M 310 185 C 310 115 365 75 415 75 C 415 135 370 195 310 185 Z"
          fill="url(#leafGrad)"
          opacity="0.95"
        />
        <path
          d="M 315 180 Q 360 130 410 80"
          stroke="#064E3B"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Second smaller companion sprout */}
        <path
          d="M 295 195 C 255 155 260 105 295 85 C 320 115 320 165 295 195 Z"
          fill="#86EFAC"
          opacity="0.9"
        />

        {/* Main Cart Frame */}
        <path
          d="M 40 85 L 105 85 L 175 355 L 420 355 L 475 160 L 140 160"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Handle Grip Accent */}
        <line x1="28" y1="85" x2="72" y2="85" stroke="#BBF7D0" strokeWidth="34" strokeLinecap="round" />

        {/* Basket Wire Grids */}
        <line x1="215" y1="165" x2="235" y2="350" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />
        <line x1="290" y1="165" x2="305" y2="350" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />
        <line x1="365" y1="165" x2="375" y2="350" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />
        <line x1="160" y1="235" x2="455" y2="235" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />
        <line x1="170" y1="295" x2="435" y2="295" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" />

        {/* Verification Checkmark Badge - 'Certa' */}
        <circle cx="340" cy="275" r="54" fill="#15803D" stroke="#FFFFFF" strokeWidth="12" />
        <path
          d="M 315 275 L 333 293 L 368 255"
          fill="none"
          stroke="url(#checkGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cart Wheels with Chrome Hubs */}
        <circle cx="215" cy="415" r="32" fill="#063219" stroke="#FFFFFF" strokeWidth="14" />
        <circle cx="215" cy="415" r="10" fill="#BBF7D0" />

        <circle cx="385" cy="415" r="32" fill="#063219" stroke="#FFFFFF" strokeWidth="14" />
        <circle cx="385" cy="415" r="10" fill="#BBF7D0" />
      </g>
    </svg>
  );

  if (variant === 'icon' && !showText) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{logoSvg}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
        {logoSvg}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#15251C] leading-none">
            Compra Certa
          </h1>
          <p className="text-xs sm:text-sm text-[#4E6053] font-medium mt-1">
            Controle inteligente de compras
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {logoSvg}
      {(variant === 'horizontal' || showText) && (
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#15251C] leading-none">
            Compra Certa
          </span>
          <span className="text-[11px] text-[#4E6053] font-medium mt-0.5">
            Calculadora no Supermercado
          </span>
        </div>
      )}
    </div>
  );
};

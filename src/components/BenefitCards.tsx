import React from 'react';
import { ChevronRight } from 'lucide-react';
import { usePurchase } from '../context/PurchaseContext.tsx';

interface BenefitItem {
  id: string;
  title: string;
  description: string;
  theme: {
    cardBorder: string;
    cardBorderHover: string;
    cardShadow: string;
    cardShadowHover: string;
    ambientBlob: string;
    iconBoxBg: string;
    iconBoxShadow: string;
    chevronBg: string;
    chevronBgHover: string;
    chevronColor: string;
  };
  renderIconBadge: () => React.ReactNode;
  actionTitle: string;
  onClick: () => void;
}

export const BenefitCards: React.FC = () => {
  const { setIsNewPurchaseModalOpen, setIsTutorialModalOpen, addToast } = usePurchase();

  const benefits: BenefitItem[] = [
    {
      id: 'limite-respeitado',
      title: 'Limite Respeitado',
      description: 'Defina o valor máximo e não leve susto na hora do caixa.',
      actionTitle: 'Definir limite de gastos',
      onClick: () => {
        setIsNewPurchaseModalOpen(true);
      },
      theme: {
        cardBorder: 'border-[#E6F4EA]',
        cardBorderHover: 'hover:border-[#34D399]',
        cardShadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.03)]',
        cardShadowHover: 'hover:shadow-[0_14px_36px_rgba(17,132,71,0.09)]',
        ambientBlob: 'bg-[#EAF7EE]',
        iconBoxBg: 'bg-gradient-to-b from-[#E8FAF0] via-[#D1F4DE] to-[#B6EDCB]',
        iconBoxShadow: 'shadow-[0_10px_24px_rgba(16,185,129,0.22)]',
        chevronBg: 'bg-[#EAF7EE]',
        chevronBgHover: 'group-hover:bg-[#D5F2DD]',
        chevronColor: 'text-[#075E37]',
      },
      renderIconBadge: () => (
        <div className="relative flex items-center justify-center shrink-0">
          {/* Angled radiant decorative spark lines around squircle (as in reference image) */}
          <div className="absolute -top-1.5 -left-1.5 flex gap-1 pointer-events-none select-none">
            <span className="w-1 h-2.5 rounded-full bg-[#10B981] rotate-[-28deg]" />
            <span className="w-1 h-3 rounded-full bg-[#34D399] rotate-[-8deg] -mt-1" />
          </div>
          <div className="absolute -top-1.5 -right-1 flex gap-1 pointer-events-none select-none">
            <span className="w-1 h-2.5 rounded-full bg-[#34D399] rotate-[22deg]" />
          </div>

          {/* Squircle Badge Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-b from-[#EAF9F0] via-[#D5F5E2] to-[#B2ECC8] shadow-[0_10px_22px_rgba(16,185,129,0.22)] flex items-center justify-center p-2 relative overflow-hidden transition-transform duration-250 group-hover:scale-104">
            {/* Glossy inner top highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-[22px] pointer-events-none" />

            {/* Target & Arrow SVG matching reference image */}
            <svg
              viewBox="0 0 64 64"
              className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-[0_2px_4px_rgba(6,78,59,0.25)] relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer dark emerald ring */}
              <circle cx="31" cy="35" r="21" stroke="#064E3B" strokeWidth="6" strokeLinecap="round" />
              {/* Middle mint ring */}
              <circle cx="31" cy="35" r="13.5" stroke="#34D399" strokeWidth="5" strokeLinecap="round" />
              {/* Central bullseye dot */}
              <circle cx="31" cy="35" r="6" fill="#047857" />
              {/* Dart Shaft piercing center */}
              <path
                d="M 48 18 L 33 33"
                stroke="#10B981"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Fletching feather 1 */}
              <path
                d="M 46 12 C 50 11 54 15 53 19 L 48 24 C 46 20 43 15 46 12 Z"
                fill="#34D399"
              />
              {/* Fletching feather 2 */}
              <path
                d="M 52 18 C 56 17 60 21 59 25 L 54 29 C 52 26 49 21 52 18 Z"
                fill="#10B981"
              />
            </svg>
          </div>
        </div>
      ),
    },
    {
      id: 'saldo-tempo-real',
      title: 'Saldo em Tempo Real',
      description: 'Cálculo imediato de cada item e peso fracionário adicionado.',
      actionTitle: 'Ver cálculo em tempo real',
      onClick: () => {
        setIsTutorialModalOpen(true);
      },
      theme: {
        cardBorder: 'border-[#FEF3C7]',
        cardBorderHover: 'hover:border-[#FBBF24]',
        cardShadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.03)]',
        cardShadowHover: 'hover:shadow-[0_14px_36px_rgba(245,158,11,0.12)]',
        ambientBlob: 'bg-[#FEF9C3]',
        iconBoxBg: 'bg-gradient-to-b from-[#FFFDF2] via-[#FEF08A] to-[#FCD34D]',
        iconBoxShadow: 'shadow-[0_10px_24px_rgba(245,158,11,0.22)]',
        chevronBg: 'bg-[#FEF3C7]',
        chevronBgHover: 'group-hover:bg-[#FDE68A]',
        chevronColor: 'text-[#D97706]',
      },
      renderIconBadge: () => (
        <div className="relative flex items-center justify-center shrink-0">
          {/* Angled radiant decorative energy sparks around lightning bolt */}
          <div className="absolute -top-1.5 -right-2 flex flex-col gap-1 pointer-events-none select-none">
            <span className="w-2.5 h-1 rounded-full bg-[#F59E0B] rotate-[-20deg]" />
            <span className="w-2 h-1 rounded-full bg-[#FBBF24] rotate-[15deg] ml-1" />
          </div>

          {/* Squircle Badge Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-b from-[#FFFDF0] via-[#FEF08A] to-[#FCD34D] shadow-[0_10px_22px_rgba(245,158,11,0.22)] flex items-center justify-center p-2 relative overflow-hidden transition-transform duration-250 group-hover:scale-104">
            {/* Glossy inner top highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-[22px] pointer-events-none" />

            {/* Modern 3D faceted Lightning Bolt */}
            <svg
              viewBox="0 0 64 64"
              className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-[0_2px_4px_rgba(217,119,6,0.3)] relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="boltGrad2" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>
              <path
                d="M 34 10 L 16 35 L 30 35 L 24 55 L 48 27 L 34 27 Z"
                fill="url(#boltGrad2)"
                stroke="#D97706"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      ),
    },
    {
      id: '100-offline',
      title: '100% Offline',
      description: 'Funciona mesmo sem sinal de internet dentro do mercado.',
      actionTitle: 'Saber mais sobre o modo offline',
      onClick: () => {
        addToast(
          '100% Offline: todos os produtos, peso na balança e histórico funcionam sem internet!',
          'success'
        );
      },
      theme: {
        cardBorder: 'border-[#FFEDD5]',
        cardBorderHover: 'hover:border-[#FB923C]',
        cardShadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.03)]',
        cardShadowHover: 'hover:shadow-[0_14px_36px_rgba(234,88,12,0.12)]',
        ambientBlob: 'bg-[#FFEDD5]',
        iconBoxBg: 'bg-gradient-to-b from-[#FFF7ED] via-[#FED7AA] to-[#FDBA74]',
        iconBoxShadow: 'shadow-[0_10px_24px_rgba(234,88,12,0.22)]',
        chevronBg: 'bg-[#FFEDD5]',
        chevronBgHover: 'group-hover:bg-[#FED7AA]',
        chevronColor: 'text-[#EA580C]',
      },
      renderIconBadge: () => (
        <div className="relative flex items-center justify-center shrink-0">
          {/* Angled radiant decorative marks */}
          <div className="absolute -top-1.5 -right-2 flex flex-col gap-1 pointer-events-none select-none">
            <span className="w-2.5 h-1 rounded-full bg-[#EA580C] rotate-[-25deg]" />
            <span className="w-2 h-1 rounded-full bg-[#FB923C] rotate-[10deg] ml-1" />
          </div>

          {/* Squircle Badge Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-b from-[#FFF8F0] via-[#FED7AA] to-[#FDBA74] shadow-[0_10px_22px_rgba(234,88,12,0.22)] flex items-center justify-center p-2 relative overflow-hidden transition-transform duration-250 group-hover:scale-104">
            {/* Glossy inner top highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-[22px] pointer-events-none" />

            {/* Offline Wifi Icon with striking diagonal slash */}
            <svg
              viewBox="0 0 64 64"
              className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-[0_2px_4px_rgba(194,65,12,0.3)] relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer wifi wave */}
              <path
                d="M 14 26 C 24 16 40 16 50 26"
                stroke="#EA580C"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Middle wifi wave */}
              <path
                d="M 21 34 C 27 28 37 28 43 34"
                stroke="#F97316"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Inner wifi wave */}
              <path
                d="M 27 42 C 30 39 34 39 37 42"
                stroke="#FB923C"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Base dot */}
              <circle cx="32" cy="49" r="3.5" fill="#EA580C" />
              {/* Disconnected strike slash */}
              <line
                x1="16"
                y1="49"
                x2="48"
                y2="17"
                stroke="#C2410C"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section aria-label="Benefícios do Compra Certa" className="w-full pt-4 sm:pt-6">
      {/* 
        Mobile (< md): Vertical stack of horizontal cards matching the reference image layout.
        Desktop (>= md): 3 cards side by side in a clean, balanced grid.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4.5">
        {benefits.map((benefit, index) => (
          <button
            key={benefit.id}
            type="button"
            onClick={benefit.onClick}
            title={`${benefit.title} — ${benefit.actionTitle}`}
            style={{ animationDelay: `${index * 80}ms` }}
            className={`group relative w-full text-left bg-white rounded-[24px] border ${benefit.theme.cardBorder} ${benefit.theme.cardBorderHover} ${benefit.theme.cardShadow} ${benefit.theme.cardShadowHover} transition-all duration-250 ease-out cursor-pointer overflow-hidden p-4 sm:p-5 hover:-translate-y-0.5 active:translate-y-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2`}
          >
            {/* Top-Right Soft Ambient Organic Wave (matching reference image) */}
            <div
              className={`absolute -top-10 -right-10 w-36 h-36 rounded-full ${benefit.theme.ambientBlob} opacity-60 pointer-events-none blur-2xl transition-opacity group-hover:opacity-90`}
              aria-hidden="true"
            />

            {/* MOBILE LAYOUT (< md): Horizontal Row: [Icon] [Text] [Chevron] */}
            <div className="flex md:hidden items-center gap-3.5 sm:gap-4 w-full relative z-10">
              {/* Icon Badge */}
              {benefit.renderIconBadge()}

              {/* Typography */}
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#15251C] tracking-tight leading-snug group-hover:text-[#075E37] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#526356] font-normal leading-relaxed mt-1 line-clamp-2">
                  {benefit.description}
                </p>
              </div>

              {/* Chevron Circle */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${benefit.theme.chevronBg} ${benefit.theme.chevronBgHover} ${benefit.theme.chevronColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 shadow-xs`}
                aria-hidden="true"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* DESKTOP LAYOUT (>= md): Vertical Card: [Icon ... Chevron] on top, [Text] below */}
            <div className="hidden md:flex flex-col justify-between h-full w-full relative z-10">
              {/* Top Row: Icon Badge on left, Chevron circle on right */}
              <div className="flex items-start justify-between w-full">
                {benefit.renderIconBadge()}

                <div
                  className={`w-9 h-9 rounded-full ${benefit.theme.chevronBg} ${benefit.theme.chevronBgHover} ${benefit.theme.chevronColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 shadow-xs mt-1`}
                  aria-hidden="true"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Bottom Row: Title + Description */}
              <div className="mt-4">
                <h3 className="text-base sm:text-lg font-extrabold text-[#15251C] tracking-tight leading-snug group-hover:text-[#075E37] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#526356] font-normal leading-relaxed mt-1">
                  {benefit.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

import React, { useMemo } from 'react';
import { usePurchase } from '../context/PurchaseContext.tsx';
import { formatCentsToBRL } from '../utils/money.ts';
import { AppLogo } from './logos/AppLogo.tsx';
import { BenefitCards } from './BenefitCards.tsx';
import {
  Wallet,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Edit3,
  Play,
  Video,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    activePurchase,
    cartTotalCents,
    balanceCents,
    budgetStatus,
    cartItems,
    setIsNewPurchaseModalOpen,
    setIsEditBudgetModalOpen,
    setIsTutorialModalOpen,
    setActiveTab,
  } = usePurchase();

  // Category breakdown for "Visão Geral"
  const categorySummary = useMemo(() => {
    const summaryMap: Record<string, { totalCents: number; count: number; icon: string; color: string; bg: string }> = {};

    cartItems.forEach((item) => {
      const subtotal = Math.round(item.quantity * item.unitPriceCents);
      if (!summaryMap[item.category]) {
        let icon = '🛒';
        let color = 'text-amber-700';
        let bg = 'bg-amber-50';

        if (item.category === 'Alimentos') {
          icon = '🌾';
          color = 'text-amber-700';
          bg = 'bg-amber-50';
        } else if (item.category === 'Hortifrúti') {
          icon = '🍎';
          color = 'text-emerald-700';
          bg = 'bg-emerald-50';
        } else if (item.category === 'Limpeza') {
          icon = '🧴';
          color = 'text-blue-700';
          bg = 'bg-blue-50';
        } else if (item.category === 'Higiene') {
          icon = '🧼';
          color = 'text-purple-700';
          bg = 'bg-purple-50';
        } else if (item.category === 'Bebidas') {
          icon = '🧃';
          color = 'text-cyan-700';
          bg = 'bg-cyan-50';
        } else if (item.category === 'Carnes') {
          icon = '🥩';
          color = 'text-rose-700';
          bg = 'bg-rose-50';
        }

        summaryMap[item.category] = { totalCents: 0, count: 0, icon, color, bg };
      }
      summaryMap[item.category].totalCents += subtotal;
      summaryMap[item.category].count += 1;
    });

    return Object.entries(summaryMap).map(([category, data]) => ({
      category,
      ...data,
    }));
  }, [cartItems]);

  // Empty state: No active purchase
  if (!activePurchase) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Hero Section matching mockup style */}
        <div className="bg-white rounded-[28px] border border-[#E1EAE4] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          {/* Subtle background ambient blob */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-100/40 via-emerald-50/20 to-transparent blur-3xl pointer-events-none" />

          <div className="flex-1 space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7EE] text-[#075E37] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#118447]" />
              <span>Controle financeiro no supermercado</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#15251C] leading-tight">
              Sua compra, <br className="hidden sm:inline" />
              <span className="text-[#118447]">sob controle</span>
            </h1>
            <p className="text-sm sm:text-base text-[#526356] max-w-md font-medium leading-relaxed">
              Defina seu orçamento e acompanhe todos os gastos em tempo real antes de chegar ao caixa.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsNewPurchaseModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2.5 cursor-pointer ring-4 ring-emerald-500/15"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar compra</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
              </button>
            </div>
          </div>

          {/* Decorative grocery illustration matching mockup */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br from-emerald-50 to-[#D5F2DD] flex items-center justify-center p-3 shadow-inner border border-emerald-100/80">
              <AppLogo size={96} />
            </div>
          </div>
        </div>

        {/* Discreet Tutorial Video Area */}
        <div>
          <button
            type="button"
            onClick={() => setIsTutorialModalOpen(true)}
            className="w-full group text-left rounded-2xl bg-white border border-[#D5E5DA] hover:border-emerald-400 p-3.5 transition-all duration-200 hover:shadow-md cursor-pointer flex items-center gap-3.5 relative overflow-hidden"
          >
            <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl bg-gradient-to-br from-[#0B4D26] via-[#118447] to-[#16A34A] flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-103 transition-transform">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-[#075E37] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#075E37] ml-0.5" />
              </div>
              <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-bold text-white px-1 py-0.2 rounded font-mono">
                1:15
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-[#EAF7EE] text-[#075E37]">
                  <Video className="w-3 h-3 text-[#118447]" />
                  Vídeo Tutorial
                </span>
                <span className="text-[11px] text-[#647067] font-medium hidden sm:inline">
                  • 1 minuto
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#15251C] group-hover:text-[#075E37] transition-colors leading-snug">
                Como usar o Compra Certa no supermercado
              </h3>
              <p className="text-xs text-[#526356] truncate mt-0.5">
                Clique para assistir ao passo a passo e evitar sustos no caixa.
              </p>
            </div>

            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#EAF7EE] group-hover:text-[#075E37] text-slate-400 transition-colors shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Feature Highlights matching the approved premium visual cards */}
        <BenefitCards />
      </div>
    );
  }

  // Active Purchase View
  const budgetCents = activePurchase.budgetCents;
  const isNegative = balanceCents < 0;
  const clampedProgress = Math.min(100, Math.max(0, budgetStatus.percent));

  // Calculations for donut circle SVG
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const alertIcons = {
    normal: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning_70: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    alert_90: <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />,
    exceeded_100: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Active Purchase Name & Budget Quick Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#075E37] tracking-wider uppercase">
            Compra em Andamento
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#15251C] tracking-tight">
            {activePurchase.name || 'Minha Compra'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsEditBudgetModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#075E37] bg-white border border-[#D5E5DA] hover:bg-[#EAF7EE] rounded-xl transition cursor-pointer shadow-2xs"
          title="Editar nome ou valor limite"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#118447]" />
          <span>Editar Orçamento</span>
        </button>
      </div>

      {/* Modern Deep Forest Green Budget Hero Card (Matching Mockup 1 & 2) */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#063219] via-[#094D26] to-[#0E6835] text-white p-5 sm:p-6 shadow-[0_12px_36px_rgba(6,50,25,0.22)] relative overflow-hidden">
        {/* Subtle decorative inner radial glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top row: Saldo Disponível + Donut Circle */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/12 backdrop-blur-md text-emerald-200 text-xs font-medium mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isNegative ? 'Excesso do orçamento' : 'Saldo disponível'}</span>
                <Info className="w-3 h-3 text-emerald-300/80" />
              </div>
              <p
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums drop-shadow-sm ${
                  isNegative ? 'text-red-300' : 'text-white'
                }`}
              >
                {formatCentsToBRL(balanceCents)}
              </p>
            </div>

            {/* Donut Progress Ring */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 68 68">
                <circle
                  cx="34"
                  cy="34"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="34"
                  cy="34"
                  r={radius}
                  stroke={budgetStatus.isOverBudget ? '#EF4444' : '#22C55E'}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs sm:text-sm font-extrabold text-white leading-none tabular-nums">
                  {budgetStatus.percent}%
                </span>
                <span className="text-[9px] text-emerald-200/90 font-medium leading-none mt-0.5">
                  utilizado
                </span>
              </div>
            </div>
          </div>

          {/* Bottom row metrics */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
            <div>
              <span className="text-[11px] font-medium text-emerald-200/80 block">Orçamento Total</span>
              <strong className="text-base sm:text-lg font-bold text-white tabular-nums">
                {formatCentsToBRL(budgetCents)}
              </strong>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-emerald-200/80 block">Já no Carrinho</span>
              <strong className="text-base sm:text-lg font-bold text-white tabular-nums">
                {formatCentsToBRL(cartTotalCents)}
              </strong>
            </div>
          </div>

          {/* Smooth Linear Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetStatus.isOverBudget ? 'bg-red-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Shopping Action CTA */}
      <button
        type="button"
        onClick={() => setActiveTab('carrinho')}
        className="w-full py-4 px-6 rounded-2xl bg-[#118447] hover:bg-[#075E37] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Ir para o Carrinho de Compras</span>
        <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
      </button>

      {/* Dynamic Contextual Alert Card */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
          budgetStatus.level === 'exceeded_100'
            ? 'bg-red-50/90 border-red-200 text-red-900'
            : budgetStatus.level === 'alert_90'
            ? 'bg-orange-50/90 border-orange-200 text-orange-900'
            : budgetStatus.level === 'warning_70'
            ? 'bg-amber-50/90 border-amber-200 text-amber-900'
            : 'bg-[#EAF7EE] border-emerald-200 text-[#075E37]'
        }`}
      >
        {alertIcons[budgetStatus.level]}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold leading-tight">
            {budgetStatus.message}
          </p>
          <p className="text-[11px] opacity-80 mt-0.5 truncate">
            {budgetStatus.level === 'exceeded_100'
              ? `Você excedeu o limite em ${formatCentsToBRL(Math.abs(balanceCents))}.`
              : budgetStatus.level === 'alert_90'
              ? `Resta apenas ${formatCentsToBRL(balanceCents)} para concluir.`
              : budgetStatus.level === 'warning_70'
              ? `Você já utilizou mais de 70% do orçamento.`
              : `Continue assim e faça uma compra mais consciente.`}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
      </div>

      {/* Visão Geral (Category Overview matching Mockup 1) */}
      {categorySummary.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#15251C]">Visão geral</h3>
            <button
              type="button"
              onClick={() => setActiveTab('carrinho')}
              className="text-xs font-semibold text-[#118447] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categorySummary.map((cat) => (
              <div
                key={cat.category}
                className="p-3.5 rounded-2xl bg-white border border-[#E1EAE4] space-y-2 hover:border-emerald-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-xl ${cat.bg} flex items-center justify-center text-sm shadow-2xs`}>
                    {cat.icon}
                  </span>
                  <span className="text-xs font-bold text-[#15251C] truncate">{cat.category}</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#15251C] tabular-nums">
                    {formatCentsToBRL(cat.totalCents)}
                  </p>
                  <p className="text-[11px] text-[#526356] font-medium">
                    {cat.count} {cat.count === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <BenefitCards />
    </div>
  );
};

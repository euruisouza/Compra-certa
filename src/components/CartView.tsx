import React, { useState } from 'react';
import { usePurchase } from '../context/PurchaseContext.tsx';
import { type CartItem, UNITS } from '../types/index.ts';
import {
  formatCentsToBRL,
  formatQuantity,
  calculateSubtotalCents,
} from '../utils/money.ts';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Wallet,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    activePurchase,
    cartItems,
    cartTotalCents,
    balanceCents,
    budgetStatus,
    setIsNewPurchaseModalOpen,
    setIsAddDirectCartModalOpen,
    setIsEditBudgetModalOpen,
    setEditingCartItem,
    deleteCart,
    editCartItemWithCheck,
    confirmEditCartItem,
    setIsFinalizeModalOpen,
    setIsDiscardModalOpen,
  } = usePurchase();

  const [overBudgetPrompt, setOverBudgetPrompt] = useState<{
    itemId: string;
    updates: { quantity: number; unitPriceCents: number };
  } | null>(null);

  if (!activePurchase) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#15251C]">
            Nenhuma compra ativa
          </h2>
          <p className="text-xs text-[#526356]">
            Inicie uma compra e defina seu orçamento para adicionar produtos ao carrinho.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewPurchaseModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-md cursor-pointer"
        >
          Iniciar Compra
        </button>
      </div>
    );
  }

  const budgetCents = activePurchase.budgetCents;
  const isOver = balanceCents < 0;
  const clampedPercent = Math.min(100, Math.max(0, budgetStatus.percent));

  const handleQuickStep = async (item: CartItem, delta: number) => {
    const unitDef = UNITS.find((u) => u.value === item.unit);
    const step = unitDef?.step || 1;
    const newQty = Math.round((item.quantity + delta * step) * 1000) / 1000;

    if (newQty <= 0) {
      await deleteCart(item.id);
      return;
    }

    const updates = {
      quantity: newQty,
      unitPriceCents: item.unitPriceCents,
    };

    const res = await editCartItemWithCheck(item.id, updates);
    if (res.requiresOverBudgetConfirmation) {
      setOverBudgetPrompt({ itemId: item.id, updates });
    }
  };

  const confirmOverBudgetStep = async () => {
    if (overBudgetPrompt) {
      await confirmEditCartItem(overBudgetPrompt.itemId, overBudgetPrompt.updates);
      setOverBudgetPrompt(null);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Alimentos':
        return '🌾';
      case 'Hortifrúti':
        return '🍎';
      case 'Limpeza':
        return '🧴';
      case 'Higiene':
        return '🧼';
      case 'Bebidas':
        return '🧃';
      case 'Carnes':
        return '🥩';
      case 'Padaria':
        return '🥖';
      case 'Laticínios':
        return '🧀';
      default:
        return '🛒';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 sm:py-5 space-y-4 pb-28">
      {/* Top Header Row with Clear / Discard Option */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#15251C] tracking-tight">
            Carrinho de Compras
          </h2>
          <p className="text-xs text-[#526356] font-medium">
            {cartItems.length} {cartItems.length === 1 ? 'produto adicionado' : 'produtos adicionados'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDiscardModalOpen(true)}
            title="Descartar ou cancelar compra"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Compact Green Gradient Budget Bar (Matching Mockup 2 Carrinho) */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#063219] via-[#094D26] to-[#0E6835] text-white p-4 sm:p-5 shadow-[0_8px_24px_rgba(6,50,25,0.18)] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-200 font-medium">Orçamento da compra:</span>
            <strong className="text-white font-bold tabular-nums">
              {formatCentsToBRL(budgetCents)}
            </strong>
            <button
              type="button"
              onClick={() => setIsEditBudgetModalOpen(true)}
              className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-emerald-200 transition cursor-pointer"
            >
              Editar
            </button>
          </div>
          <span className="font-extrabold text-emerald-300 tabular-nums">
            {budgetStatus.percent}% utilizado
          </span>
        </div>

        {/* Total no Carrinho vs Saldo Disponível */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/15">
          <div>
            <span className="text-[11px] text-emerald-200/90 font-medium block">Total no carrinho</span>
            <p className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
              {formatCentsToBRL(cartTotalCents)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-emerald-200/90 font-medium block">
              {isOver ? 'Excesso' : 'Saldo disponível'}
            </span>
            <p
              className={`text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight ${
                isOver ? 'text-red-300' : 'text-[#4ADE80]'
              }`}
            >
              {formatCentsToBRL(balanceCents)}
            </p>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              budgetStatus.isOverBudget ? 'bg-red-400' : 'bg-[#22C55E]'
            }`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
      </div>

      {/* Over-budget confirmation alert */}
      {overBudgetPrompt && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="text-xs font-bold">
              Atenção: Aumentar esta quantidade fará você ultrapassar o orçamento.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOverBudgetPrompt(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmOverBudgetStep}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer shadow-xs"
            >
              Confirmar aumento
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Product Button */}
      <button
        type="button"
        onClick={() => setIsAddDirectCartModalOpen(true)}
        className="w-full py-3 px-4 rounded-2xl bg-[#EAF7EE] hover:bg-[#D5F2DD] text-[#075E37] font-bold text-sm flex items-center justify-center gap-2 transition border border-emerald-200/80 active:scale-[0.99] cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#118447]" />
        <span>+ Adicionar Produto no Carrinho</span>
      </button>

      {/* Cart Items List */}
      {cartItems.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E1EAE4] text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#EAF7EE] flex items-center justify-center text-[#118447] shadow-inner">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#15251C]">
            Seu carrinho está vazio
          </h3>
          <p className="text-xs text-[#526356] max-w-sm mx-auto leading-relaxed">
            Pegue itens da sua lista planejada ou adicione produtos diretamente com peso ou quantidade enquanto caminha pelos corredores.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddDirectCartModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#118447] hover:bg-[#075E37] transition shadow-xs cursor-pointer"
            >
              + Adicionar Primeiro Produto
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cartItems.map((item) => {
            const subtotal = calculateSubtotalCents(item.quantity, item.unitPriceCents);
            const isKg = item.unit === 'kg';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-[#E1EAE4] hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all text-left space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Category Icon Emoji & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-[#F4FBF6] border border-[#E1EAE4] flex items-center justify-center text-lg shrink-0 shadow-2xs">
                      {getCategoryEmoji(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-[#15251C] truncate leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#647067] font-medium mt-0.5 truncate">
                        {item.category} ·{' '}
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {formatCentsToBRL(item.unitPriceCents)}/{item.unit}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Real Subtotal */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                      Preço Real
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-[#15251C] tabular-nums">
                      {formatCentsToBRL(subtotal)}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Stepper and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {/* Stepper for Quantity / Weight */}
                  <div className="flex items-center gap-1.5 bg-[#F8FAF9] p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleQuickStep(item, -1)}
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-90 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="px-2 min-w-[64px] text-center">
                      <span className="text-xs font-extrabold text-slate-900 tabular-nums block">
                        {formatQuantity(item.quantity)}
                      </span>
                      <span className="text-[9px] text-[#647067] font-bold uppercase tracking-wider block">
                        {item.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickStep(item, 1)}
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-90 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCartItem(item)}
                      title="Editar preço ou quantidade"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#075E37] hover:bg-[#EAF7EE] rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCart(item.id)}
                      title="Remover do carrinho"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Sticky Action Bar for One-Hand Checkout */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-2.5 bg-white/95 backdrop-blur-md border-t border-[#E1EAE4] shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFinalizeModalOpen(true)}
              className="w-full min-h-[50px] rounded-2xl bg-[#118447] hover:bg-[#075E37] text-white text-base font-extrabold flex items-center justify-between px-5 transition active:scale-[0.99] shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Finalizar compra</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums">{formatCentsToBRL(cartTotalCents)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

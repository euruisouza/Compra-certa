import React, { useState, useEffect } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { formatCentsToBRL, parseCurrencyToCents, calculateBalanceCents } from '../../utils/money.ts';
import { X, CheckCircle, AlertTriangle, ShoppingBag, ArrowRight, Edit3, Check } from 'lucide-react';

interface FinalizeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinalizeConfirmModal: React.FC<FinalizeConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activePurchase,
    cartItems,
    cartTotalCents,
    finishActivePurchase,
    editBudget,
    setActiveTab,
  } = usePurchase();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [customBudgetInput, setCustomBudgetInput] = useState('');

  useEffect(() => {
    if (isOpen && activePurchase) {
      const cents = activePurchase.budgetCents;
      const reais = Math.floor(cents / 100);
      const centavos = (cents % 100).toString().padStart(2, '0');
      setCustomBudgetInput(`${reais},${centavos}`);
      setIsEditingBudget(false);
    }
  }, [isOpen, activePurchase?.id, activePurchase?.budgetCents]);

  if (!isOpen || !activePurchase) return null;

  const currentBudgetCents = isEditingBudget
    ? parseCurrencyToCents(customBudgetInput)
    : activePurchase.budgetCents;

  const effectiveBudgetCents = currentBudgetCents > 0 ? currentBudgetCents : activePurchase.budgetCents;
  const balanceCents = calculateBalanceCents(effectiveBudgetCents, cartTotalCents);
  const isOver = balanceCents < 0;

  const handleSaveInlineBudget = async () => {
    const cents = parseCurrencyToCents(customBudgetInput);
    if (cents > 0) {
      await editBudget(cents);
    }
    setIsEditingBudget(false);
  };

  const handleCancelInlineBudget = () => {
    const cents = activePurchase.budgetCents;
    const reais = Math.floor(cents / 100);
    const centavos = (cents % 100).toString().padStart(2, '0');
    setCustomBudgetInput(`${reais},${centavos}`);
    setIsEditingBudget(false);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      let finalBudget = activePurchase.budgetCents;
      if (isEditingBudget) {
        const cents = parseCurrencyToCents(customBudgetInput);
        if (cents > 0) {
          finalBudget = cents;
          await editBudget(cents);
        }
      }
      await finishActivePurchase(finalBudget);
      onClose();
      setActiveTab('historico');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="finalize-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="finalize-modal-title" className="text-base font-bold text-slate-900">
                Finalizar Compra
              </h2>
              <p className="text-xs text-slate-500">
                Revise o resumo antes de salvar no histórico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {isOver && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-800">
                  Atenção: Compra acima do orçamento definido
                </p>
                <p>
                  Você gastou {formatCentsToBRL(Math.abs(balanceCents))} além do limite estipulado. Você ainda pode finalizar e registrar a compra no histórico.
                </p>
              </div>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Orçamento previsto:</span>
              <div className="flex items-center gap-2">
                {isEditingBudget ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customBudgetInput}
                      onChange={(e) => setCustomBudgetInput(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-[#118447] rounded-md focus:outline-none tabular-nums"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveInlineBudget}
                      title="Confirmar novo orçamento"
                      className="p-1 bg-[#118447] text-white rounded hover:bg-[#075E37]"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelInlineBudget}
                      title="Cancelar alteração"
                      className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm tabular-nums">
                      {formatCentsToBRL(effectiveBudgetCents)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingBudget(true)}
                      title="Ajustar orçamento previsto"
                      className="text-[11px] font-semibold text-[#118447] hover:underline flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Alterar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total no carrinho ({cartItems.length} produtos):</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                {formatCentsToBRL(cartTotalCents)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {isOver ? 'Excesso em relação ao limite:' : 'Saldo economizado:'}
              </span>
              <span
                className={`text-base font-bold tabular-nums ${
                  isOver ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {formatCentsToBRL(Math.abs(balanceCents))}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-[#075E37] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#118447] shrink-0" />
            <span>
              Ao finalizar, um snapshot imutável será salvo com o orçamento exato de{' '}
              <strong>{formatCentsToBRL(effectiveBudgetCents)}</strong>.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Voltar ao Carrinho
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-sm"
            >
              <span>{isSubmitting ? 'Salvando...' : 'Confirmar e Finalizar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

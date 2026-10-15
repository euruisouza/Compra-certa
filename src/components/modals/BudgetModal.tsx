import React, { useState, useEffect } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { parseCurrencyToCents, formatCentsToBRL } from '../../utils/money.ts';
import { X, Wallet, AlertCircle } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, mode }) => {
  const { activePurchase, startPurchase, editBudget, setActiveTab } = usePurchase();
  const [name, setName] = useState('');
  const [rawBudget, setRawBudget] = useState('200,00');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && activePurchase) {
        setName(activePurchase.name || '');
        const cents = activePurchase.budgetCents;
        const reais = Math.floor(cents / 100);
        const centavos = (cents % 100).toString().padStart(2, '0');
        setRawBudget(`${reais},${centavos}`);
      } else {
        setName('');
        setRawBudget('200,00');
      }
      setError(null);
    }
  }, [isOpen, mode, activePurchase]);

  if (!isOpen) return null;

  const quickBudgets = ['100,00', '200,00', '300,00', '500,00'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseCurrencyToCents(rawBudget);

    if (cents <= 0) {
      setError('Por favor, informe um valor de orçamento maior que zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'create') {
        await startPurchase(cents, name);
        setActiveTab('lista');
      } else {
        await editBudget(cents, name);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar orçamento';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentParsedCents = parseCurrencyToCents(rawBudget);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="budget-modal-title" className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Começar Nova Compra' : 'Editar Orçamento'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'create'
                  ? 'Defina seu limite financeiro antes de começar'
                  : 'Ajuste o limite desta compra'}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="purchase-budget" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Valor máximo a gastar (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                R$
              </span>
              <input
                id="purchase-budget"
                type="text"
                inputMode="decimal"
                value={rawBudget}
                onChange={(e) => setRawBudget(e.target.value)}
                placeholder="200,00"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] focus:border-transparent tabular-nums"
              />
            </div>
            {currentParsedCents > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                Equivalente a: <strong className="text-emerald-700">{formatCentsToBRL(currentParsedCents)}</strong>
              </p>
            )}

            {/* Quick buttons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">Sugestões:</span>
              {quickBudgets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRawBudget(val)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg transition-colors"
                >
                  R$ {val.replace(',00', '')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="purchase-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nome da compra <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="purchase-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Supermercado — sábado, Feira semanal"
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] focus:border-transparent"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-sm"
            >
              {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Iniciar Compra' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

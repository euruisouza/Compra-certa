import React, { useState, useEffect } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { type Purchase } from '../../types/index.ts';
import { parseCurrencyToCents, formatCentsToBRL } from '../../utils/money.ts';
import { X, RefreshCw, AlertCircle } from 'lucide-react';

interface RepeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePurchase: Purchase | null;
}

export const RepeatModal: React.FC<RepeatModalProps> = ({
  isOpen,
  onClose,
  sourcePurchase,
}) => {
  const { repeatPastPurchase, activePurchase, setActiveTab } = usePurchase();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('200,00');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && sourcePurchase) {
      setName(`Repetida: ${sourcePurchase.name || 'Supermercado'}`);
      const cents = sourcePurchase.budgetCents;
      const r = Math.floor(cents / 100);
      const c = (cents % 100).toString().padStart(2, '0');
      setBudget(`${r},${c}`);
      setError(null);
    }
  }, [isOpen, sourcePurchase]);

  if (!isOpen || !sourcePurchase) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePurchase) {
      setError('Você já possui uma compra ativa em andamento. Finalize ou descarte-a antes de repetir outra lista.');
      return;
    }

    const cents = parseCurrencyToCents(budget);
    if (cents <= 0) {
      setError('Informe um orçamento válido para a nova compra.');
      return;
    }

    try {
      setIsSubmitting(true);
      await repeatPastPurchase(sourcePurchase.id, cents, name);
      onClose();
      setActiveTab('lista');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao repetir lista';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCents = parseCurrencyToCents(budget);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="repeat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 id="repeat-modal-title" className="text-base font-bold text-slate-900">
                Repetir Lista de Compras
              </h2>
              <p className="text-xs text-slate-500">
                Cria uma nova compra com os itens planejados desta compra
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
            <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="repeat-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da nova compra
            </label>
            <input
              id="repeat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447]"
            />
          </div>

          <div>
            <label htmlFor="repeat-budget" className="block text-xs font-semibold text-slate-700 mb-1">
              Novo orçamento (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                R$
              </span>
              <input
                id="repeat-budget"
                type="text"
                inputMode="decimal"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="200,00"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] tabular-nums"
              />
            </div>
            {currentCents > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                Equivalente a: <strong className="text-emerald-700">{formatCentsToBRL(currentCents)}</strong>
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
            ℹ️ Todos os produtos serão transferidos para a nova lista como planejados. O carrinho começará vazio (R$ 0,00) para você registrar os preços reais no mercado.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              {isSubmitting ? 'Criando...' : 'Iniciar Compra com Lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

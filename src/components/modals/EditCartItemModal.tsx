import React, { useState, useEffect } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { type CartItem, UNITS } from '../../types/index.ts';
import {
  parseCurrencyToCents,
  formatCentsToBRL,
  parseQuantity,
  formatQuantity,
  calculateSubtotalCents,
} from '../../utils/money.ts';
import { X, Edit2, Plus, Minus, AlertTriangle, Trash2 } from 'lucide-react';

interface EditCartItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
}

export const EditCartItemModal: React.FC<EditCartItemModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const {
    activePurchase,
    cartTotalCents,
    editCartItemWithCheck,
    confirmEditCartItem,
    deleteCart,
  } = usePurchase();

  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [showOverBudgetPrompt, setShowOverBudgetPrompt] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<{
    quantity: number;
    unitPriceCents: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(formatQuantity(item.quantity));
      const r = Math.floor(item.unitPriceCents / 100);
      const c = (item.unitPriceCents % 100).toString().padStart(2, '0');
      setUnitPrice(`${r},${c}`);
      setShowOverBudgetPrompt(false);
      setPendingUpdates(null);
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const currentQty = parseQuantity(quantity);
  const currentUnitPriceCents = parseCurrencyToCents(unitPrice);
  const newSubtotalCents = calculateSubtotalCents(currentQty, currentUnitPriceCents);

  const existingSubtotalCents = calculateSubtotalCents(item.quantity, item.unitPriceCents);
  const projectedTotalCents = cartTotalCents - existingSubtotalCents + newSubtotalCents;
  const budgetCents = activePurchase?.budgetCents || 0;
  const projectedBalanceCents = budgetCents - projectedTotalCents;

  const handleStepQty = (delta: number) => {
    const unitDef = UNITS.find((u) => u.value === item.unit);
    const step = unitDef?.step || 1;
    const next = Math.max(step, Math.round((currentQty + delta * step) * 1000) / 1000);
    setQuantity(formatQuantity(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQty <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }
    if (currentUnitPriceCents <= 0) {
      setError('Informe um preço unitário válido.');
      return;
    }

    const updates = {
      quantity: currentQty,
      unitPriceCents: currentUnitPriceCents,
    };

    const res = await editCartItemWithCheck(item.id, updates);
    if (res.requiresOverBudgetConfirmation) {
      setPendingUpdates(updates);
      setShowOverBudgetPrompt(true);
      return;
    }

    onClose();
  };

  const handleConfirmOverBudget = async () => {
    if (pendingUpdates) {
      await confirmEditCartItem(item.id, pendingUpdates);
      onClose();
    }
  };

  const handleDelete = async () => {
    await deleteCart(item.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-cart-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="edit-cart-title" className="text-base font-bold text-slate-900">
                Editar Item no Carrinho
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {item.name}
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

        {showOverBudgetPrompt ? (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Atenção: Limite do orçamento atingido!</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Essa alteração fará o total do carrinho ir para{' '}
                <strong>{formatCentsToBRL(projectedTotalCents)}</strong>, ultrapassando seu orçamento de{' '}
                <strong>{formatCentsToBRL(budgetCents)}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOverBudgetPrompt(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmOverBudget}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-sm"
              >
                Confirmar alteração
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Quantidade */}
            <div>
              <label htmlFor="edit-qty" className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade ({item.unit}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepQty(-1)}
                  aria-label="Diminuir quantidade"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="edit-qty"
                  type="text"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => handleStepQty(1)}
                  aria-label="Aumentar quantidade"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preço Unitário Real */}
            <div>
              <label htmlFor="edit-price" className="block text-xs font-semibold text-slate-700 mb-1">
                Preço unitário real (R$/{item.unit}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  R$
                </span>
                <input
                  id="edit-price"
                  type="text"
                  inputMode="decimal"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] tabular-nums"
                />
              </div>
            </div>

            {/* Subtotal card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal novo ({formatQuantity(currentQty)} {item.unit} × {formatCentsToBRL(currentUnitPriceCents)}):</span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">
                  {formatCentsToBRL(newSubtotalCents)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Novo saldo disponível:</span>
                <span
                  className={`font-semibold tabular-nums ${
                    projectedBalanceCents < 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {formatCentsToBRL(projectedBalanceCents)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

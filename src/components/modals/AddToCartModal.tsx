import React, { useState, useEffect } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { CATEGORIES, UNITS, type UnitType, type PlannedItem } from '../../types/index.ts';
import {
  parseCurrencyToCents,
  formatCentsToBRL,
  parseQuantity,
  formatQuantity,
  calculateSubtotalCents,
} from '../../utils/money.ts';
import { X, ShoppingCart, AlertTriangle, Plus, Minus } from 'lucide-react';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  plannedItem?: PlannedItem | null;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  plannedItem,
}) => {
  const {
    activePurchase,
    cartTotalCents,
    addToCartWithCheck,
    confirmAddToCart,
    cartItems,
  } = usePurchase();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Mercearia');
  const [unit, setUnit] = useState<UnitType>('un');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [showOverBudgetPrompt, setShowOverBudgetPrompt] = useState(false);
  const [pendingData, setPendingData] = useState<{
    plannedItemId?: string | null;
    name: string;
    category: string;
    unit: UnitType;
    quantity: number;
    unitPriceCents: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (plannedItem) {
        setName(plannedItem.name);
        setCategory(plannedItem.category);
        setUnit(plannedItem.unit);

        // Calculate how much has already been purchased for this planned item
        const existingBought = cartItems
          .filter((c) => c.plannedItemId === plannedItem.id)
          .reduce((acc, c) => acc + c.quantity, 0);

        const remaining = Math.max(0, plannedItem.plannedQuantity - existingBought);
        setQuantity(remaining > 0 ? formatQuantity(remaining) : formatQuantity(plannedItem.plannedQuantity));

        if (plannedItem.estimatedUnitPriceCents) {
          const r = Math.floor(plannedItem.estimatedUnitPriceCents / 100);
          const c = (plannedItem.estimatedUnitPriceCents % 100).toString().padStart(2, '0');
          setUnitPrice(`${r},${c}`);
        } else {
          setUnitPrice('');
        }
      } else {
        setName('');
        setCategory('Mercearia');
        setUnit('un');
        setQuantity('1');
        setUnitPrice('');
      }
      setShowOverBudgetPrompt(false);
      setPendingData(null);
      setError(null);
    }
  }, [isOpen, plannedItem, cartItems]);

  if (!isOpen) return null;

  const currentQty = parseQuantity(quantity);
  const currentUnitPriceCents = parseCurrencyToCents(unitPrice);
  const subtotalCents = calculateSubtotalCents(currentQty, currentUnitPriceCents);
  const projectedTotalCents = cartTotalCents + subtotalCents;
  const budgetCents = activePurchase?.budgetCents || 0;
  const projectedBalanceCents = budgetCents - projectedTotalCents;
  const willExceedBudget = budgetCents > 0 && projectedTotalCents > budgetCents && cartTotalCents <= budgetCents;

  const handleStepQty = (delta: number) => {
    const unitDef = UNITS.find((u) => u.value === unit);
    const step = unitDef?.step || 1;
    const next = Math.max(step, Math.round((currentQty + delta * step) * 1000) / 1000);
    setQuantity(formatQuantity(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }
    if (currentQty <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }
    if (currentUnitPriceCents <= 0) {
      setError('Informe o preço real unitário encontrado no supermercado.');
      return;
    }

    const payload = {
      plannedItemId: plannedItem ? plannedItem.id : null,
      name: name.trim(),
      category,
      unit,
      quantity: currentQty,
      unitPriceCents: currentUnitPriceCents,
    };

    const result = await addToCartWithCheck(payload);
    if (result.requiresOverBudgetConfirmation) {
      setPendingData(payload);
      setShowOverBudgetPrompt(true);
      return;
    }

    onClose();
  };

  const handleConfirmOverBudget = async () => {
    if (pendingData) {
      await confirmAddToCart(pendingData);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-cart-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 id="add-cart-modal-title" className="text-base font-bold text-slate-900">
                {plannedItem ? 'Colocar no Carrinho' : 'Adicionar Produto Avulso'}
              </h2>
              {plannedItem && (
                <p className="text-xs text-slate-500">
                  Item planejado na lista
                </p>
              )}
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
          /* RN05 Confirmation Dialog */
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Atenção: Limite do orçamento atingido!</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Adicionar este item fará o total do carrinho atingir{' '}
                <strong>{formatCentsToBRL(projectedTotalCents)}</strong>, ultrapassando seu orçamento de{' '}
                <strong>{formatCentsToBRL(budgetCents)}</strong> em{' '}
                <strong className="text-red-700">{formatCentsToBRL(Math.abs(projectedBalanceCents))}</strong>.
              </p>
              <p className="text-xs text-amber-800">
                Deseja colocar no carrinho mesmo assim?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOverBudgetPrompt(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Voltar e revisar
              </button>
              <button
                type="button"
                onClick={handleConfirmOverBudget}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-sm"
              >
                Confirmar adição
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

            {/* Nome do Produto */}
            <div>
              <label htmlFor="cart-item-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do produto <span className="text-red-500">*</span>
              </label>
              <input
                id="cart-item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leite Integral 1L"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447]"
              />
            </div>

            {/* Categoria e Unidade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cart-item-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  id="cart-item-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cart-item-unit" className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade
                </label>
                <select
                  id="cart-item-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] bg-white"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantidade Adquirida com controles de clique rápido */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="cart-qty" className="text-xs font-semibold text-slate-700">
                  Quantidade adquirida ({unit}) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Ex: 1 ou 0,750 para peso
                </span>
              </div>
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
                  id="cart-qty"
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
              <label htmlFor="cart-unit-price" className="block text-xs font-semibold text-slate-700 mb-1">
                Preço unitário real (R$/{unit}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  R$
                </span>
                <input
                  id="cart-unit-price"
                  type="text"
                  inputMode="decimal"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] tabular-nums"
                />
              </div>
            </div>

            {/* Subtotal do Item Preview Card (CA12) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Cálculo ({formatQuantity(currentQty)} {unit} × {formatCentsToBRL(currentUnitPriceCents)}):</span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">
                  {formatCentsToBRL(subtotalCents)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Saldo após adicionar:</span>
                <span
                  className={`font-semibold tabular-nums ${
                    projectedBalanceCents < 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {formatCentsToBRL(projectedBalanceCents)}
                </span>
              </div>
              {willExceedBudget && (
                <p className="text-[11px] text-amber-700 font-medium">
                  ⚠️ Este item fará você ultrapassar o orçamento. Uma confirmação será solicitada.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-sm"
              >
                Colocar no Carrinho
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

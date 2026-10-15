import React, { useState, useEffect } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { CATEGORIES, UNITS, type UnitType, type PriorityType, type PlannedItem } from '../../types/index.ts';
import { parseCurrencyToCents, parseQuantity } from '../../utils/money.ts';
import { X, PlusCircle, Check } from 'lucide-react';

interface PlannedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: PlannedItem | null;
}

export const PlannedItemModal: React.FC<PlannedItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { addPlanned, editPlanned } = usePurchase();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<UnitType>('un');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [priority, setPriority] = useState<PriorityType>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        setCategory(itemToEdit.category);
        setQuantity(itemToEdit.plannedQuantity.toString().replace('.', ','));
        setUnit(itemToEdit.unit);
        if (itemToEdit.estimatedUnitPriceCents) {
          const r = Math.floor(itemToEdit.estimatedUnitPriceCents / 100);
          const c = (itemToEdit.estimatedUnitPriceCents % 100).toString().padStart(2, '0');
          setEstimatedPrice(`${r},${c}`);
        } else {
          setEstimatedPrice('');
        }
        setPriority(itemToEdit.priority);
      } else {
        setName('');
        setCategory('Mercearia');
        setQuantity('1');
        setUnit('un');
        setEstimatedPrice('');
        setPriority('normal');
      }
      setError(null);
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    const qty = parseQuantity(quantity);
    if (qty <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    const estimatedCents = estimatedPrice ? parseCurrencyToCents(estimatedPrice) : null;

    try {
      setIsSubmitting(true);
      if (itemToEdit) {
        await editPlanned(itemToEdit.id, {
          name: name.trim(),
          category,
          plannedQuantity: qty,
          unit,
          estimatedUnitPriceCents: estimatedCents,
          priority,
        });
      } else {
        await addPlanned({
          name: name.trim(),
          category,
          plannedQuantity: qty,
          unit,
          estimatedUnitPriceCents: estimatedCents,
          priority,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar produto';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="planned-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h2 id="planned-modal-title" className="text-base font-bold text-slate-900">
              {itemToEdit ? 'Editar Item Planejado' : 'Adicionar à Lista'}
            </h2>
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
            <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Nome do Produto */}
          <div>
            <label htmlFor="item-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do produto <span className="text-red-500">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arroz 5kg, Leite integral, Tomate"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447]"
            />
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="item-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Categoria
            </label>
            <select
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-qty" className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade planejada
              </label>
              <input
                id="item-qty"
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="item-unit" className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade
              </label>
              <select
                id="item-unit"
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

          {/* Preço Estimado e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-price" className="block text-xs font-semibold text-slate-700 mb-1">
                Preço estimado unitário <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  id="item-price"
                  type="text"
                  inputMode="decimal"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#118447] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    priority === 'normal'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {priority === 'normal' && <Check className="w-3 h-3 text-[#118447]" />}
                  <span>Normal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('essential')}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    priority === 'essential'
                      ? 'bg-[#118447] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {priority === 'essential' && <Check className="w-3 h-3 text-white" />}
                  <span>Essencial</span>
                </button>
              </div>
            </div>
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
              {isSubmitting ? 'Salvando...' : itemToEdit ? 'Atualizar Item' : 'Adicionar à Lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

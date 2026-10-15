import React, { useState } from 'react';
import { usePurchase } from '../../context/PurchaseContext.tsx';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DiscardConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscardConfirmModal: React.FC<DiscardConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activePurchase, cartItems, plannedItems, discardActive, setActiveTab } = usePurchase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activePurchase) return null;

  const totalItems = plannedItems.length + cartItems.length;

  const handleDiscard = async () => {
    try {
      setIsSubmitting(true);
      await discardActive();
      onClose();
      setActiveTab('orcamento');
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
      aria-labelledby="discard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 id="discard-modal-title" className="text-base font-bold text-slate-900">
              Descartar Compra Atual?
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

        <div className="mt-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-red-800">
                Esta ação não pode ser desfeita
              </p>
              <p className="text-red-700 leading-relaxed">
                Você possui <strong>{plannedItems.length} itens planejados</strong> e{' '}
                <strong>{cartItems.length} itens no carrinho</strong> nesta compra. Ao descartar, esses dados serão excluídos.
              </p>
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
              type="button"
              onClick={handleDiscard}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-sm"
            >
              {isSubmitting ? 'Descartando...' : 'Sim, descartar compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { type CompletedPurchaseSnapshot } from '../../types/index.ts';
import { formatCentsToBRL, formatQuantity, calculateSubtotalCents } from '../../utils/money.ts';
import { exportPurchaseSnapshotToPdf } from '../../utils/pdfExport.ts';
import { X, Calendar, RefreshCw, FileDown } from 'lucide-react';
import { usePurchase } from '../../context/PurchaseContext.tsx';

interface SnapshotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: CompletedPurchaseSnapshot | null;
}

export const SnapshotDetailModal: React.FC<SnapshotDetailModalProps> = ({
  isOpen,
  onClose,
  snapshot,
}) => {
  const { setRepeatPurchaseSource, addToast } = usePurchase();
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !snapshot) return null;

  const { purchase, cartItems, totalSpentCents, balanceCents } = snapshot;
  const isOver = balanceCents < 0;

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(purchase.completedAt || purchase.createdAt));

  const handleRepeat = () => {
    onClose();
    setRepeatPurchaseSource(purchase);
  };

  const handleExportPdf = () => {
    try {
      setIsExporting(true);
      exportPurchaseSnapshotToPdf(snapshot);
      addToast('Resumo da compra exportado em PDF com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      addToast('Não foi possível gerar o arquivo PDF.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="snapshot-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 id="snapshot-modal-title" className="text-base font-bold text-slate-900">
              {purchase.name || 'Compra sem nome'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
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

        {/* Financial Summary Card */}
        <div className="grid grid-cols-3 gap-2.5 my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Orçamento</p>
            <p className="text-sm font-bold text-slate-900 tabular-nums">
              {formatCentsToBRL(purchase.budgetCents)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Gasto</p>
            <p className="text-sm font-bold text-slate-900 tabular-nums">
              {formatCentsToBRL(totalSpentCents)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">
              {isOver ? 'Excesso' : 'Saldo Final'}
            </p>
            <p
              className={`text-sm font-bold tabular-nums ${
                isOver ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {formatCentsToBRL(Math.abs(balanceCents))}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Itens Adquiridos ({cartItems.length})</span>
            <span>Subtotal</span>
          </div>

          {cartItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              Nenhum item registrado no carrinho desta compra.
            </p>
          ) : (
            cartItems.map((item) => {
              const subtotal = calculateSubtotalCents(item.quantity, item.unitPriceCents);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {item.category} · {formatQuantity(item.quantity)} {item.unit} × {formatCentsToBRL(item.unitPriceCents)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatCentsToBRL(subtotal)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-[#118447]" />
              <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleRepeat}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Repetir Lista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

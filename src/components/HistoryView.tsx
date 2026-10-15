import React, { useState, useMemo } from 'react';
import { usePurchase } from '../context/PurchaseContext.tsx';
import { type Purchase } from '../types/index.ts';
import { formatCentsToBRL } from '../utils/money.ts';
import { getSnapshot } from '../db/repository.ts';
import {
  exportPurchaseSnapshotToPdf,
  exportHistoryReportToPdf,
} from '../utils/pdfExport.ts';
import {
  History,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Search,
  ExternalLink,
  Wallet,
  FileDown,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const {
    historyPurchases,
    activePurchase,
    setViewingSnapshot,
    setRepeatPurchaseSource,
    setIsNewPurchaseModalOpen,
    addToast,
  } = usePurchase();

  const [search, setSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'todas' | 'mes' | '3meses'>('todas');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const filteredPurchases = useMemo(() => {
    const term = search.toLowerCase();
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;

    return historyPurchases.filter((p) => {
      const pTime = p.completedAt || p.createdAt;
      const matchesSearch = (p.name || 'Supermercado').toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (filterPeriod === 'mes') {
        return pTime >= oneMonthAgo;
      }
      if (filterPeriod === '3meses') {
        return pTime >= threeMonthsAgo;
      }
      return true;
    });
  }, [historyPurchases, search, filterPeriod]);

  const handleOpenDetails = async (purchase: Purchase) => {
    const snapshot = await getSnapshot(purchase.id);
    if (snapshot) {
      setViewingSnapshot(snapshot);
    }
  };

  const handleRepeat = (purchase: Purchase) => {
    setRepeatPurchaseSource(purchase);
  };

  const handleExportSinglePdf = async (e: React.MouseEvent, purchase: Purchase) => {
    e.stopPropagation();
    try {
      setExportingId(purchase.id);
      const snapshot = await getSnapshot(purchase.id);
      if (snapshot) {
        exportPurchaseSnapshotToPdf(snapshot);
        addToast(`PDF de "${purchase.name || 'Compra'}" exportado com sucesso!`, 'success');
      } else {
        addToast('Detalhes da compra não encontrados para exportar.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao exportar o PDF da compra.', 'error');
    } finally {
      setExportingId(null);
    }
  };

  const handleExportAllPdf = () => {
    if (historyPurchases.length === 0) return;
    try {
      setIsExportingAll(true);
      exportHistoryReportToPdf(historyPurchases);
      addToast('Relatório geral de histórico exportado em PDF!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao gerar relatório consolidado em PDF.', 'error');
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 sm:py-5 space-y-4 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#15251C] tracking-tight">
            Histórico
          </h2>
          <p className="text-xs text-[#526356] font-medium mt-0.5">
            Acompanhe e compare seus gastos anteriores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {historyPurchases.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllPdf}
              disabled={isExportingAll}
              title="Exportar todas as compras para PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-[#D5E5DA] hover:bg-slate-50 active:scale-95 transition shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#118447]" />
              <span>{isExportingAll ? 'Gerando...' : 'Exportar Relatório'}</span>
            </button>
          )}

          {!activePurchase && (
            <button
              type="button"
              onClick={() => setIsNewPurchaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition shadow-xs cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Nova Compra</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips (Matching Mockup 2: Todas, Esse mês, Últimos 3 meses) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterPeriod('todas')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            filterPeriod === 'todas'
              ? 'bg-[#118447] text-white shadow-xs'
              : 'bg-white border border-[#E1EAE4] text-[#526356] hover:bg-slate-50'
          }`}
        >
          Todas
        </button>

        <button
          type="button"
          onClick={() => setFilterPeriod('mes')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            filterPeriod === 'mes'
              ? 'bg-[#118447] text-white shadow-xs'
              : 'bg-white border border-[#E1EAE4] text-[#526356] hover:bg-slate-50'
          }`}
        >
          Esse mês
        </button>

        <button
          type="button"
          onClick={() => setFilterPeriod('3meses')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            filterPeriod === '3meses'
              ? 'bg-[#118447] text-white shadow-xs'
              : 'bg-white border border-[#E1EAE4] text-[#526356] hover:bg-slate-50'
          }`}
        >
          Últimos 3 meses
        </button>
      </div>

      {/* Search Input */}
      {historyPurchases.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por supermercado..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D5E5DA] bg-white text-sm text-[#15251C] placeholder-slate-400 focus:outline-none focus:border-[#118447] focus:ring-2 focus:ring-[#118447]/20 transition-all shadow-2xs"
          />
        </div>
      )}

      {/* History List */}
      {historyPurchases.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E1EAE4] text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#EAF7EE] flex items-center justify-center text-[#118447] shadow-inner">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#15251C]">
            Nenhuma compra finalizada
          </h3>
          <p className="text-xs text-[#526356] max-w-sm mx-auto leading-relaxed">
            Assim que você concluir sua primeira compra ativa, um relatório completo e imutável ficará salvo aqui com saldo e economia.
          </p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-[#E1EAE4] text-center text-xs text-[#526356]">
          Nenhuma compra encontrada para este período ou busca.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPurchases.map((purchase) => {
            const summary = purchase.snapshotSummary;
            const totalSpent = summary?.totalSpentCents || 0;
            const balance = summary ? summary.balanceCents : purchase.budgetCents - totalSpent;
            const isOver = summary ? summary.overBudget : balance < 0;
            const itemCount = summary?.itemCount || 0;

            const dateStr = new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(purchase.completedAt || purchase.createdAt));

            const isCurrentExporting = exportingId === purchase.id;

            return (
              <div
                key={purchase.id}
                onClick={() => handleOpenDetails(purchase)}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E1EAE4] hover:border-emerald-300 transition-all space-y-3 shadow-2xs hover:shadow-xs cursor-pointer text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icon & Store/Date */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isOver
                          ? 'bg-red-50 text-red-600'
                          : 'bg-[#EAF7EE] text-[#118447]'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#15251C]">{dateStr}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#15251C] truncate leading-tight mt-0.5">
                        {purchase.name || 'Supermercado'}
                      </h4>
                      <p className="text-[11px] text-[#647067] font-medium mt-0.5">
                        {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                  </div>

                  {/* Total Value & Status Badge (Matching Mockup 2) */}
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-base sm:text-lg font-extrabold text-[#15251C] tabular-nums">
                      {formatCentsToBRL(totalSpent)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOver
                          ? 'bg-red-50 text-red-700'
                          : 'bg-[#EAF7EE] text-[#075E37]'
                      }`}
                    >
                      {isOver ? 'Acima do orçamento' : 'Dentro do orçamento'}
                    </span>
                  </div>
                </div>

                {/* Footer Actions: Repeat & Export */}
                <div
                  className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleExportSinglePdf(e, purchase)}
                    disabled={isCurrentExporting}
                    className="flex items-center gap-1 text-slate-500 hover:text-[#118447] transition cursor-pointer font-medium"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{isCurrentExporting ? 'Exportando...' : 'Exportar PDF'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRepeat(purchase)}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#EAF7EE] hover:bg-[#D5F2DD] text-[#075E37] font-bold text-xs transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Repetir lista</span>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

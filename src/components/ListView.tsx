import React, { useState, useMemo } from 'react';
import { usePurchase } from '../context/PurchaseContext.tsx';
import { CATEGORIES, type PlannedItem } from '../types/index.ts';
import { formatCentsToBRL, formatQuantity } from '../utils/money.ts';
import {
  Search,
  ShoppingCart,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  Minus,
  Sparkles,
  Calculator,
  ChevronRight,
  Check,
  CheckSquare,
  Square,
  ListPlus,
} from 'lucide-react';

export const ListView: React.FC = () => {
  const {
    activePurchase,
    plannedItems,
    cartItems,
    setIsNewPurchaseModalOpen,
    setIsAddPlannedModalOpen,
    setEditingPlannedItem,
    setItemToAddToCart,
    deletePlanned,
    editPlanned,
    setActiveTab,
  } = usePurchase();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Calculate cart state for each planned item
  const itemsWithStatus = useMemo(() => {
    return plannedItems.map((item) => {
      const matchingCartItems = cartItems.filter((c) => c.plannedItemId === item.id);
      const boughtQuantity = matchingCartItems.reduce((sum, c) => sum + c.quantity, 0);

      let status: 'pending' | 'partial' | 'in_cart' = 'pending';
      if (boughtQuantity >= item.plannedQuantity) {
        status = 'in_cart';
      } else if (boughtQuantity > 0) {
        status = 'partial';
      }

      return {
        ...item,
        boughtQuantity,
        status,
      };
    });
  }, [plannedItems, cartItems]);

  const filteredItems = useMemo(() => {
    return itemsWithStatus.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [itemsWithStatus, search, selectedCategory]);

  // Group items by category for cleaner supermarket aisle shopping!
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Total Estimated Value of list
  const totalEstimatedCents = useMemo(() => {
    return plannedItems.reduce((sum, item) => {
      const unitEst = item.estimatedUnitPriceCents || 0;
      return sum + Math.round(unitEst * item.plannedQuantity);
    }, 0);
  }, [plannedItems]);

  const totalQuantityUnits = useMemo(() => {
    return plannedItems.reduce((sum, item) => sum + item.plannedQuantity, 0);
  }, [plannedItems]);

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

  const handleStepQty = async (item: PlannedItem, delta: number) => {
    const newQty = Math.max(1, Math.round((item.plannedQuantity + delta) * 100) / 100);
    await editPlanned(item.id, { plannedQuantity: newQty });
  };

  if (!activePurchase) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#EAF7EE] flex items-center justify-center text-[#118447]">
          <ListPlus className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#15251C]">
            Nenhuma compra ativa
          </h2>
          <p className="text-xs text-[#526356]">
            Comece definindo quanto você pode gastar para planejar sua lista de compras.
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 sm:py-5 space-y-4 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#15251C] tracking-tight">
            Minha lista
          </h2>
          <p className="text-xs text-[#526356] font-medium mt-0.5">
            Planeje antes de comprar e mantenha o foco no seu orçamento.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddPlannedModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#118447] hover:bg-[#075E37] active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto (ex.: arroz, leite, carne...)"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D5E5DA] bg-white text-sm text-[#15251C] placeholder-slate-400 focus:outline-none focus:border-[#118447] focus:ring-2 focus:ring-[#118447]/20 transition-all shadow-2xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Category Filter Pills (Matching Mockup 1 & 2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('Todas')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'Todas'
              ? 'bg-[#118447] text-white shadow-xs'
              : 'bg-white border border-[#E1EAE4] text-[#526356] hover:bg-slate-50'
          }`}
        >
          <span>Todos</span>
          <span className="text-[11px] opacity-80">({plannedItems.length})</span>
        </button>

        {CATEGORIES.map((catName) => {
          const isSelected = selectedCategory === catName;
          return (
            <button
              key={catName}
              type="button"
              onClick={() => setSelectedCategory(catName)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#118447] text-white shadow-xs'
                  : 'bg-white border border-[#E1EAE4] text-[#526356] hover:bg-slate-50'
              }`}
            >
              <span>{getCategoryEmoji(catName)}</span>
              <span>{catName}</span>
            </button>
          );
        })}
      </div>

      {/* List Items */}
      {plannedItems.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E1EAE4] text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#EAF7EE] flex items-center justify-center text-[#118447] shadow-inner">
            <ListPlus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#15251C]">
            Sua lista planejada está vazia
          </h3>
          <p className="text-xs text-[#526356] max-w-sm mx-auto leading-relaxed">
            Monte os itens que você precisa comprar antes de ir ao supermercado para evitar compras por impulso.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddPlannedModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#118447] hover:bg-[#075E37] transition shadow-xs cursor-pointer"
            >
              + Adicionar Primeiro Item
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-[#E1EAE4] text-center text-xs text-[#526356]">
          Nenhum produto encontrado para este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="space-y-2">
              {/* Category Group Header (Matching Mockup 2) */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{getCategoryEmoji(category)}</span>
                  <span className="text-xs font-extrabold text-[#15251C] tracking-wide uppercase">
                    {category}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#118447] bg-[#EAF7EE] px-2 py-0.5 rounded-md">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* Items in this category */}
              <div className="space-y-2">
                {items.map((item) => {
                  const isInCart = item.status === 'in_cart';
                  const estimatedUnit = item.estimatedUnitPriceCents || 0;
                  const estimatedTotal = Math.round(estimatedUnit * item.plannedQuantity);

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all flex items-center justify-between gap-3 text-left ${
                        isInCart
                          ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                          : 'border-[#E1EAE4] hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      {/* Checkbox & Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setItemToAddToCart(item)}
                          title={isInCart ? 'Item já no carrinho' : 'Colocar no carrinho'}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isInCart
                              ? 'bg-[#118447] text-white shadow-xs'
                              : 'border-2 border-slate-300 hover:border-[#118447] bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-sm sm:text-base font-bold text-[#15251C] truncate leading-tight ${
                              isInCart ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#647067] font-medium mt-0.5 truncate">
                            {item.category}
                            {item.estimatedUnitPriceCents ? (
                              <>
                                {' · '}
                                <span className="text-slate-500 font-normal">
                                  est. {formatCentsToBRL(item.estimatedUnitPriceCents)}/{item.unit}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      {/* Stepper for planned quantity */}
                      <div className="flex items-center gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStepQty(item, -1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-90 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-[28px] text-center tabular-nums">
                          {formatQuantity(item.plannedQuantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepQty(item, 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-90 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Estimated Price Pill (Clear differentiation from Real Price) */}
                      <div className="text-right shrink-0 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Estimado
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#15251C] tabular-nums">
                          {estimatedTotal > 0 ? `~ ${formatCentsToBRL(estimatedTotal)}` : '—'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setItemToAddToCart(item)}
                          title="Adicionar ao carrinho"
                          className="p-2 text-[#075E37] bg-[#EAF7EE] hover:bg-[#D5F2DD] rounded-xl transition cursor-pointer"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlannedItem(item)}
                          title="Editar item"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePlanned(item.id)}
                          title="Excluir item"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bottom Sticky Bar (Matching Mockup 1: "Estimativa da lista") */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-2.5 bg-white/95 backdrop-blur-md border-t border-[#E1EAE4] shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Summary Row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAF9] border border-[#E1EAE4]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#118447] flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#15251C]">Estimativa da lista</p>
                <p className="text-[11px] text-[#647067]">
                  {plannedItems.length} {plannedItems.length === 1 ? 'item' : 'itens'} · {totalQuantityUnits} unidades
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base sm:text-lg font-extrabold text-[#118447] tabular-nums">
                {formatCentsToBRL(totalEstimatedCents)}
              </span>
            </div>
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={() => setIsAddPlannedModalOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-[#118447] hover:bg-[#075E37] text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-md shadow-emerald-900/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar produto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

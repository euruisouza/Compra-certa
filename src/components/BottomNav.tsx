import React from 'react';
import { usePurchase, type TabType } from '../context/PurchaseContext.tsx';
import { Wallet, ListTodo, ShoppingCart, History } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, plannedItems, cartItems, historyPurchases } = usePurchase();

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'orcamento',
      label: 'Orçamento',
      icon: Wallet,
    },
    {
      id: 'lista',
      label: 'Lista',
      icon: ListTodo,
      badge: plannedItems.length > 0 ? plannedItems.length : undefined,
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'carrinho',
      label: 'Carrinho',
      icon: ShoppingCart,
      badge: cartItems.length > 0 ? cartItems.length : undefined,
      badgeColor: 'bg-red-500',
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: History,
      badge: historyPurchases.length > 0 ? historyPurchases.length : undefined,
      badgeColor: 'bg-slate-400',
    },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1EAE4] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#118447] ${
                isActive ? 'text-[#118447]' : 'text-[#647067] hover:text-[#15251C]'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-3 min-w-[17px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none shadow-xs ${
                      tab.badgeColor || 'bg-red-500'
                    }`}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight mt-1 transition-colors ${
                  isActive ? 'font-bold text-[#118447]' : 'font-medium text-[#647067]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#118447]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

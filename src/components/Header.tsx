import React, { useState } from 'react';
import { usePurchase } from '../context/PurchaseContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { Sparkles, Edit3, PlayCircle, LogOut, ChevronDown } from 'lucide-react';
import { AppLogo } from './logos/AppLogo.tsx';

export const Header: React.FC = () => {
  const {
    activePurchase,
    setIsEditBudgetModalOpen,
    loadDemoExperience,
    setIsTutorialModalOpen,
  } = usePurchase();

  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E1EAE4] px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5">
          <AppLogo size={38} />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#15251C] leading-none">
              Compra Certa
            </h1>
            <p className="text-[11px] text-[#526356] font-medium mt-0.5">
              Calculadora no Supermercado
            </p>
          </div>
        </div>

        {/* Center / Right Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Purchase Pill matching Mockup 1 */}
          {activePurchase && (
            <button
              type="button"
              onClick={() => setIsEditBudgetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EE] text-[#075E37] text-xs font-bold hover:bg-[#D5F2DD] transition cursor-pointer border border-emerald-200/80 shadow-2xs"
              title="Editar nome ou orçamento"
            >
              <span>🗓️</span>
              <span className="truncate max-w-[110px] sm:max-w-[180px]">
                {activePurchase.name || 'Compra do mês'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#118447] shrink-0" />
            </button>
          )}

          {/* Tutorial Button */}
          <button
            type="button"
            onClick={() => setIsTutorialModalOpen(true)}
            title="Assistir ao vídeo tutorial"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#526356] hover:text-[#075E37] hover:bg-[#EAF7EE] rounded-xl transition-colors cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-[#118447]" />
            <span className="hidden sm:inline">Como Usar</span>
          </button>

          {!activePurchase && (
            <button
              type="button"
              onClick={loadDemoExperience}
              title="Carregar dados de demonstração para testar o aplicativo"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#075E37] bg-[#EAF7EE] hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Demo</span>
            </button>
          )}

          <PWAInstallButton compact />

          {/* User Profile / Logout menu */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={user.email || 'Conta de Usuário'}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer border border-[#D5E5DA]"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email || 'Usuário'}
                    className="w-7 h-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#118447] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.displayName
                      ? user.displayName.charAt(0)
                      : user.email
                      ? user.email.charAt(0)
                      : 'U'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#D5E5DA] py-2 z-50 animate-in fade-in duration-100 text-left">
                    <div className="px-3.5 py-2 border-b border-[#E1EAE4]">
                      <p className="text-xs font-bold text-[#15251C] truncate">
                        {user.displayName || 'Usuário Compra Certa'}
                      </p>
                      <p className="text-[11px] text-[#526356] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

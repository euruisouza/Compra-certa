import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { PurchaseProvider, usePurchase } from './context/PurchaseContext.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { ListView } from './components/ListView.tsx';
import { CartView } from './components/CartView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { BudgetModal } from './components/modals/BudgetModal.tsx';
import { PlannedItemModal } from './components/modals/PlannedItemModal.tsx';
import { AddToCartModal } from './components/modals/AddToCartModal.tsx';
import { EditCartItemModal } from './components/modals/EditCartItemModal.tsx';
import { FinalizeConfirmModal } from './components/modals/FinalizeConfirmModal.tsx';
import { DiscardConfirmModal } from './components/modals/DiscardConfirmModal.tsx';
import { RepeatModal } from './components/modals/RepeatModal.tsx';
import { SnapshotDetailModal } from './components/modals/SnapshotDetailModal.tsx';
import { TutorialVideoModal } from './components/modals/TutorialVideoModal.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { AppLogo } from './components/logos/AppLogo.tsx';

function MainApp() {
  const {
    activeTab,
    isNewPurchaseModalOpen,
    setIsNewPurchaseModalOpen,
    isEditBudgetModalOpen,
    setIsEditBudgetModalOpen,
    isAddPlannedModalOpen,
    setIsAddPlannedModalOpen,
    editingPlannedItem,
    setEditingPlannedItem,
    itemToAddToCart,
    setItemToAddToCart,
    isAddDirectCartModalOpen,
    setIsAddDirectCartModalOpen,
    editingCartItem,
    setEditingCartItem,
    isFinalizeModalOpen,
    setIsFinalizeModalOpen,
    isDiscardModalOpen,
    setIsDiscardModalOpen,
    viewingSnapshot,
    setViewingSnapshot,
    repeatPurchaseSource,
    setRepeatPurchaseSource,
    isTutorialModalOpen,
    setIsTutorialModalOpen,
  } = usePurchase();

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col pb-24 text-[#15251C] antialiased selection:bg-[#EAF7EE] selection:text-[#075E37]">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === 'orcamento' && <BudgetView />}
        {activeTab === 'lista' && <ListView />}
        {activeTab === 'carrinho' && <CartView />}
        {activeTab === 'historico' && <HistoryView />}
      </main>

      <BottomNav />
      <ToastContainer />
      <OfflineIndicator />

      {/* Modals & Dialogs */}
      <BudgetModal
        isOpen={isNewPurchaseModalOpen}
        onClose={() => setIsNewPurchaseModalOpen(false)}
        mode="create"
      />

      <BudgetModal
        isOpen={isEditBudgetModalOpen}
        onClose={() => setIsEditBudgetModalOpen(false)}
        mode="edit"
      />

      <PlannedItemModal
        isOpen={isAddPlannedModalOpen || !!editingPlannedItem}
        onClose={() => {
          setIsAddPlannedModalOpen(false);
          setEditingPlannedItem(null);
        }}
        itemToEdit={editingPlannedItem}
      />

      <AddToCartModal
        isOpen={!!itemToAddToCart || isAddDirectCartModalOpen}
        onClose={() => {
          setItemToAddToCart(null);
          setIsAddDirectCartModalOpen(false);
        }}
        plannedItem={itemToAddToCart}
      />

      <EditCartItemModal
        isOpen={!!editingCartItem}
        onClose={() => setEditingCartItem(null)}
        item={editingCartItem}
      />

      <FinalizeConfirmModal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
      />

      <DiscardConfirmModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
      />

      <RepeatModal
        isOpen={!!repeatPurchaseSource}
        onClose={() => setRepeatPurchaseSource(null)}
        sourcePurchase={repeatPurchaseSource}
      />

      <SnapshotDetailModal
        isOpen={!!viewingSnapshot}
        onClose={() => setViewingSnapshot(null)}
        snapshot={viewingSnapshot}
      />

      <TutorialVideoModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
      />
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [isTutorialFromLoginOpen, setIsTutorialFromLoginOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-4">
        <div className="p-3 rounded-3xl bg-white shadow-md border border-emerald-100 animate-pulse mb-3">
          <AppLogo size={64} />
        </div>
        <div className="w-6 h-6 border-2 border-[#118447] border-t-transparent rounded-full animate-spin mt-2" />
        <p className="text-xs font-semibold text-[#526356] mt-3">Carregando Compra Certa...</p>
      </div>
    );
  }

  const isDemoParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

  // Mandatory Authentication Gate
  if (!user && !isDemoParam) {
    return (
      <>
        <LoginView onOpenTutorial={() => setIsTutorialFromLoginOpen(true)} />
        <TutorialVideoModal
          isOpen={isTutorialFromLoginOpen}
          onClose={() => setIsTutorialFromLoginOpen(false)}
        />
      </>
    );
  }

  return (
    <PurchaseProvider>
      <MainApp />
    </PurchaseProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Purchase,
  PlannedItem,
  CartItem,
  CompletedPurchaseSnapshot,
  UnitType,
  PriorityType,
  LogoModelType,
} from '../types/index.ts';
import {
  getActivePurchase,
  createPurchase,
  updatePurchaseBudget,
  getPlannedItems,
  addPlannedItem,
  updatePlannedItem,
  deletePlannedItem,
  getCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  finalizePurchase,
  discardPurchase,
  getCompletedPurchases,
  getSnapshot,
  repeatListFromPurchase,
  seedDemoData,
} from '../db/repository.ts';
import {
  calculateCartTotalCents,
  calculateBalanceCents,
  calculateBudgetStatus,
  calculateSubtotalCents,
  type BudgetStatusInfo,
} from '../utils/money.ts';
import confetti from 'canvas-confetti';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config.ts';

export type TabType = 'orcamento' | 'lista' | 'carrinho' | 'historico';

interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface PurchaseContextType {
  // State
  activePurchase: Purchase | null;
  plannedItems: PlannedItem[];
  cartItems: CartItem[];
  historyPurchases: Purchase[];
  isLoading: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Brand & Logo Model
  activeLogoModel: LogoModelType;
  setActiveLogoModel: (model: LogoModelType) => void;
  isLogoModalOpen: boolean;
  setIsLogoModalOpen: (open: boolean) => void;

  // Computed metrics
  cartTotalCents: number;
  balanceCents: number;
  budgetStatus: BudgetStatusInfo;
  
  // Actions
  refreshAll: () => Promise<void>;
  startPurchase: (budgetCents: number, name?: string) => Promise<Purchase>;
  editBudget: (budgetCents: number, name?: string) => Promise<void>;
  addPlanned: (data: {
    name: string;
    category: string;
    plannedQuantity: number;
    unit: UnitType;
    estimatedUnitPriceCents?: number | null;
    priority: PriorityType;
  }) => Promise<PlannedItem>;
  editPlanned: (id: string, updates: Partial<PlannedItem>) => Promise<void>;
  deletePlanned: (id: string) => Promise<void>;
  
  // Cart Actions (with over-budget checks)
  addToCartWithCheck: (data: {
    plannedItemId?: string | null;
    name: string;
    category: string;
    unit: UnitType;
    quantity: number;
    unitPriceCents: number;
  }) => Promise<{ requiresOverBudgetConfirmation: boolean }>;
  confirmAddToCart: (data: {
    plannedItemId?: string | null;
    name: string;
    category: string;
    unit: UnitType;
    quantity: number;
    unitPriceCents: number;
  }) => Promise<CartItem>;
  editCartItemWithCheck: (
    id: string,
    updates: { quantity: number; unitPriceCents: number }
  ) => Promise<{ requiresOverBudgetConfirmation: boolean }>;
  confirmEditCartItem: (
    id: string,
    updates: { quantity: number; unitPriceCents: number }
  ) => Promise<void>;
  deleteCart: (id: string) => Promise<void>;

  // Completion & Lifecycle
  finishActivePurchase: (explicitBudgetCents?: number) => Promise<CompletedPurchaseSnapshot>;
  discardActive: () => Promise<void>;
  repeatPastPurchase: (pastPurchaseId: string, budgetCents: number, name?: string) => Promise<Purchase>;
  loadDemoExperience: () => Promise<void>;
  
  // Modal controllers
  isNewPurchaseModalOpen: boolean;
  setIsNewPurchaseModalOpen: (open: boolean) => void;
  isEditBudgetModalOpen: boolean;
  setIsEditBudgetModalOpen: (open: boolean) => void;
  isAddPlannedModalOpen: boolean;
  setIsAddPlannedModalOpen: (open: boolean) => void;
  itemToAddToCart: PlannedItem | null;
  setItemToAddToCart: (item: PlannedItem | null) => void;
  isAddDirectCartModalOpen: boolean;
  setIsAddDirectCartModalOpen: (open: boolean) => void;
  editingCartItem: CartItem | null;
  setEditingCartItem: (item: CartItem | null) => void;
  editingPlannedItem: PlannedItem | null;
  setEditingPlannedItem: (item: PlannedItem | null) => void;
  isFinalizeModalOpen: boolean;
  setIsFinalizeModalOpen: (open: boolean) => void;
  isDiscardModalOpen: boolean;
  setIsDiscardModalOpen: (open: boolean) => void;
  viewingSnapshot: CompletedPurchaseSnapshot | null;
  setViewingSnapshot: (snapshot: CompletedPurchaseSnapshot | null) => void;
  repeatPurchaseSource: Purchase | null;
  setRepeatPurchaseSource: (purchase: Purchase | null) => void;
  isTutorialModalOpen: boolean;
  setIsTutorialModalOpen: (open: boolean) => void;
}

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [activePurchase, setActivePurchase] = useState<Purchase | null>(null);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [historyPurchases, setHistoryPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('orcamento');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
  const [isAddPlannedModalOpen, setIsAddPlannedModalOpen] = useState(false);
  const [itemToAddToCart, setItemToAddToCart] = useState<PlannedItem | null>(null);
  const [isAddDirectCartModalOpen, setIsAddDirectCartModalOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [editingPlannedItem, setEditingPlannedItem] = useState<PlannedItem | null>(null);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<CompletedPurchaseSnapshot | null>(null);
  const [repeatPurchaseSource, setRepeatPurchaseSource] = useState<Purchase | null>(null);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);

  // Logo Model selection with persistence
  const [activeLogoModel, setActiveLogoModelState] = useState<LogoModelType>(() => {
    try {
      const saved = localStorage.getItem('compra_certa_logo_model');
      if (saved === 'sustentavel' || saved === 'carrinho-verde') return saved;
    } catch {
      // ignore
    }
    return 'sustentavel';
  });

  const setActiveLogoModel = useCallback((model: LogoModelType) => {
    setActiveLogoModelState(model);
    try {
      localStorage.setItem('compra_certa_logo_model', model);
    } catch (e) {
      console.warn('Could not persist logo model preference', e);
    }
  }, []);

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const active = await getActivePurchase();
      setActivePurchase(active);

      if (active) {
        const [planned, cart] = await Promise.all([
          getPlannedItems(active.id),
          getCartItems(active.id),
        ]);
        setPlannedItems(planned);
        setCartItems(cart);
      } else {
        setPlannedItems([]);
        setCartItems([]);
      }

      const history = await getCompletedPurchases();
      setHistoryPurchases(history);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      addToast('Não foi possível carregar os dados locais.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Derived metrics
  const cartTotalCents = calculateCartTotalCents(cartItems);
  const budgetCents = activePurchase?.budgetCents || 0;
  const balanceCents = calculateBalanceCents(budgetCents, cartTotalCents);
  const budgetStatus = calculateBudgetStatus(budgetCents, cartTotalCents);

  // Actions
  const startPurchase = async (newBudgetCents: number, name?: string): Promise<Purchase> => {
    const created = await createPurchase(newBudgetCents, name, true);
    setActivePurchase(created);
    setPlannedItems([]);
    setCartItems([]);
    addToast('Compra iniciada com sucesso!', 'success');
    return created;
  };

  const editBudget = async (newBudgetCents: number, name?: string): Promise<void> => {
    if (!activePurchase) return;
    await updatePurchaseBudget(activePurchase.id, newBudgetCents, name);
    setActivePurchase((prev) =>
      prev
        ? {
            ...prev,
            budgetCents: newBudgetCents,
            ...(name !== undefined && name.trim() ? { name: name.trim() } : {}),
          }
        : null
    );
    addToast('Orçamento atualizado com sucesso!', 'success');
  };

  const addPlanned = async (data: {
    name: string;
    category: string;
    plannedQuantity: number;
    unit: UnitType;
    estimatedUnitPriceCents?: number | null;
    priority: PriorityType;
  }): Promise<PlannedItem> => {
    if (!activePurchase) throw new Error('Nenhuma compra ativa');
    const item = await addPlannedItem({
      purchaseId: activePurchase.id,
      ...data,
    });
    setPlannedItems((prev) => [...prev, item]);
    addToast(`"${item.name}" adicionado à lista.`, 'success');
    return item;
  };

  const editPlanned = async (id: string, updates: Partial<PlannedItem>): Promise<void> => {
    await updatePlannedItem(id, updates);
    setPlannedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    addToast('Item atualizado.', 'info');
  };

  const deletePlanned = async (id: string): Promise<void> => {
    await deletePlannedItem(id);
    setPlannedItems((prev) => prev.filter((item) => item.id !== id));
    addToast('Item removido da lista.', 'info');
  };

  // Cart operations
  const addToCartWithCheck = async (data: {
    plannedItemId?: string | null;
    name: string;
    category: string;
    unit: UnitType;
    quantity: number;
    unitPriceCents: number;
  }): Promise<{ requiresOverBudgetConfirmation: boolean }> => {
    if (!activePurchase) throw new Error('Nenhuma compra ativa');
    const itemSubtotal = calculateSubtotalCents(data.quantity, data.unitPriceCents);
    const projectedTotal = cartTotalCents + itemSubtotal;
    
    // Check RN05: Inclusão que ultrapasse 100% solicita confirmação explícita
    if (projectedTotal > activePurchase.budgetCents && cartTotalCents <= activePurchase.budgetCents) {
      return { requiresOverBudgetConfirmation: true };
    }

    await confirmAddToCart(data);
    return { requiresOverBudgetConfirmation: false };
  };

  const confirmAddToCart = async (data: {
    plannedItemId?: string | null;
    name: string;
    category: string;
    unit: UnitType;
    quantity: number;
    unitPriceCents: number;
  }): Promise<CartItem> => {
    if (!activePurchase) throw new Error('Nenhuma compra ativa');
    const created = await addCartItem({
      purchaseId: activePurchase.id,
      ...data,
    });
    setCartItems((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
    addToast(`"${data.name}" adicionado ao carrinho!`, 'success');
    return created;
  };

  const editCartItemWithCheck = async (
    id: string,
    updates: { quantity: number; unitPriceCents: number }
  ): Promise<{ requiresOverBudgetConfirmation: boolean }> => {
    if (!activePurchase) throw new Error('Nenhuma compra ativa');
    const existing = cartItems.find((i) => i.id === id);
    if (!existing) throw new Error('Item não encontrado');

    const currentSubtotal = calculateSubtotalCents(existing.quantity, existing.unitPriceCents);
    const newSubtotal = calculateSubtotalCents(updates.quantity, updates.unitPriceCents);
    const delta = newSubtotal - currentSubtotal;
    const projectedTotal = cartTotalCents + delta;

    if (projectedTotal > activePurchase.budgetCents && cartTotalCents <= activePurchase.budgetCents) {
      return { requiresOverBudgetConfirmation: true };
    }

    await confirmEditCartItem(id, updates);
    return { requiresOverBudgetConfirmation: false };
  };

  const confirmEditCartItem = async (
    id: string,
    updates: { quantity: number; unitPriceCents: number }
  ): Promise<void> => {
    await updateCartItem(id, updates);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );
    addToast('Item do carrinho atualizado.', 'info');
  };

  const deleteCart = async (id: string): Promise<void> => {
    const item = cartItems.find((i) => i.id === id);
    await deleteCartItem(id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    addToast(`"${item?.name || 'Item'}" removido do carrinho.`, 'info');
  };

  // Completion
  const finishActivePurchase = async (explicitBudgetCents?: number): Promise<CompletedPurchaseSnapshot> => {
    if (!activePurchase) throw new Error('Nenhuma compra ativa');
    const budgetToUse =
      explicitBudgetCents !== undefined && explicitBudgetCents > 0
        ? explicitBudgetCents
        : activePurchase.budgetCents;

    const snapshot = await finalizePurchase(activePurchase.id, budgetToUse);
    setActivePurchase(null);
    setPlannedItems([]);
    setCartItems([]);
    setHistoryPurchases((prev) => [
      snapshot.purchase,
      ...prev.filter((p) => p.id !== snapshot.purchase.id),
    ]);

    // Sync to Firestore if authenticated
    try {
      if (auth.currentUser) {
        const purchaseDocRef = doc(firestore, 'users', auth.currentUser.uid, 'purchases', snapshot.purchase.id);
        await setDoc(purchaseDocRef, {
          id: snapshot.purchase.id,
          userId: auth.currentUser.uid,
          name: snapshot.purchase.name || 'Compra Finalizada',
          budgetCents: snapshot.purchase.budgetCents,
          status: 'completed',
          createdAt: snapshot.purchase.createdAt,
          completedAt: snapshot.purchase.completedAt || Date.now(),
        });
      }
    } catch (e) {
      console.warn('Could not sync purchase to Firestore:', e);
    }
    
    // Celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#118447', '#075E37', '#EAF7EE', '#F59E0B'],
      });
    } catch {
      // ignore
    }

    addToast('Compra finalizada com sucesso! Registro salvo no histórico.', 'success');
    return snapshot;
  };

  const discardActive = async (): Promise<void> => {
    if (!activePurchase) return;
    await discardPurchase(activePurchase.id);
    setActivePurchase(null);
    setPlannedItems([]);
    setCartItems([]);
    addToast('Compra descartada.', 'info');
  };

  const repeatPastPurchase = async (
    pastPurchaseId: string,
    newBudgetCents: number,
    name?: string
  ): Promise<Purchase> => {
    const created = await repeatListFromPurchase(pastPurchaseId, newBudgetCents, name);
    setActivePurchase(created);
    const items = await getPlannedItems(created.id);
    setPlannedItems(items);
    setCartItems([]);
    setActiveTab('lista');
    addToast('Nova compra criada com os itens da lista anterior!', 'success');
    return created;
  };

  const loadDemoExperience = async (): Promise<void> => {
    const currentBudget = activePurchase?.budgetCents;
    const currentName = activePurchase?.name;
    await seedDemoData(currentBudget, currentName);
    await refreshAll();
    setActiveTab('orcamento');
    addToast('Modo demonstração ativado com sucesso!', 'success');
  };

  return (
    <PurchaseContext.Provider
      value={{
        activePurchase,
        plannedItems,
        cartItems,
        historyPurchases,
        isLoading,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        removeToast,
        activeLogoModel,
        setActiveLogoModel,
        isLogoModalOpen,
        setIsLogoModalOpen,
        cartTotalCents,
        balanceCents,
        budgetStatus,
        refreshAll,
        startPurchase,
        editBudget,
        addPlanned,
        editPlanned,
        deletePlanned,
        addToCartWithCheck,
        confirmAddToCart,
        editCartItemWithCheck,
        confirmEditCartItem,
        deleteCart,
        finishActivePurchase,
        discardActive,
        repeatPastPurchase,
        loadDemoExperience,
        // Modals
        isNewPurchaseModalOpen,
        setIsNewPurchaseModalOpen,
        isEditBudgetModalOpen,
        setIsEditBudgetModalOpen,
        isAddPlannedModalOpen,
        setIsAddPlannedModalOpen,
        itemToAddToCart,
        setItemToAddToCart,
        isAddDirectCartModalOpen,
        setIsAddDirectCartModalOpen,
        editingCartItem,
        setEditingCartItem,
        editingPlannedItem,
        setEditingPlannedItem,
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
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchaseSafe() {
  return useContext(PurchaseContext);
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase deve ser usado dentro de um PurchaseProvider');
  }
  return context;
}

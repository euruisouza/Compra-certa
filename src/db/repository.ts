import { db } from './index.ts';
import type {
  Purchase,
  PlannedItem,
  CartItem,
  CompletedPurchaseSnapshot,
  UnitType,
  PriorityType,
} from '../types/index.ts';
import {
  calculateCartTotalCents,
  calculateBalanceCents,
} from '../utils/money.ts';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export async function getActivePurchase(): Promise<Purchase | null> {
  const active = await db.purchases.where('status').equals('active').first();
  return active || null;
}

export async function createPurchase(
  budgetCents: number,
  name?: string,
  forceReplace: boolean = true
): Promise<Purchase> {
  const existingActive = await getActivePurchase();
  if (existingActive) {
    if (forceReplace) {
      await discardPurchase(existingActive.id);
    } else {
      throw new Error('Já existe uma compra ativa. Finalize ou descarte a compra atual antes de iniciar outra.');
    }
  }

  const trimmedName = name?.trim();
  const newPurchase: Purchase = {
    id: generateId(),
    ...(trimmedName ? { name: trimmedName } : {}),
    budgetCents,
    status: 'active',
    createdAt: Date.now(),
  };

  await db.purchases.add(newPurchase);
  return newPurchase;
}

export async function updatePurchaseBudget(
  purchaseId: string,
  budgetCents: number,
  name?: string
): Promise<void> {
  const updates: { budgetCents: number; name?: string } = { budgetCents };
  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed) {
      updates.name = trimmed;
    }
  }
  await db.purchases.update(purchaseId, updates);
}

export async function getPlannedItems(purchaseId: string): Promise<PlannedItem[]> {
  return await db.plannedItems
    .where('purchaseId')
    .equals(purchaseId)
    .sortBy('createdAt');
}

export async function addPlannedItem(data: {
  purchaseId: string;
  name: string;
  category: string;
  plannedQuantity: number;
  unit: UnitType;
  estimatedUnitPriceCents?: number | null;
  priority: PriorityType;
}): Promise<PlannedItem> {
  const newItem: PlannedItem = {
    id: generateId(),
    purchaseId: data.purchaseId,
    name: data.name.trim(),
    category: data.category,
    plannedQuantity: data.plannedQuantity,
    unit: data.unit,
    estimatedUnitPriceCents: data.estimatedUnitPriceCents,
    priority: data.priority,
    createdAt: Date.now(),
  };

  await db.plannedItems.add(newItem);
  return newItem;
}

export async function updatePlannedItem(
  id: string,
  updates: Partial<Omit<PlannedItem, 'id' | 'purchaseId' | 'createdAt'>>
): Promise<void> {
  await db.plannedItems.update(id, updates);
}

export async function deletePlannedItem(id: string): Promise<void> {
  await db.plannedItems.delete(id);
}

export async function getCartItems(purchaseId: string): Promise<CartItem[]> {
  return await db.cartItems
    .where('purchaseId')
    .equals(purchaseId)
    .reverse()
    .sortBy('updatedAt');
}

export async function addCartItem(data: {
  purchaseId: string;
  plannedItemId?: string | null;
  name: string;
  category: string;
  unit: UnitType;
  quantity: number;
  unitPriceCents: number;
}): Promise<CartItem> {
  const now = Date.now();
  const newItem: CartItem = {
    id: generateId(),
    purchaseId: data.purchaseId,
    plannedItemId: data.plannedItemId || null,
    name: data.name.trim(),
    category: data.category,
    unit: data.unit,
    quantity: data.quantity,
    unitPriceCents: data.unitPriceCents,
    createdAt: now,
    updatedAt: now,
  };

  await db.cartItems.add(newItem);
  return newItem;
}

export async function updateCartItem(
  id: string,
  updates: Partial<Omit<CartItem, 'id' | 'purchaseId' | 'createdAt'>>
): Promise<void> {
  await db.cartItems.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteCartItem(id: string): Promise<void> {
  await db.cartItems.delete(id);
}

export async function finalizePurchase(
  purchaseId: string,
  explicitBudgetCents?: number
): Promise<CompletedPurchaseSnapshot> {
  const purchase = await db.purchases.get(purchaseId);
  if (!purchase) {
    throw new Error('Compra não encontrada');
  }

  const finalBudgetCents =
    explicitBudgetCents !== undefined && explicitBudgetCents > 0
      ? explicitBudgetCents
      : purchase.budgetCents;

  const plannedItems = await db.plannedItems.where('purchaseId').equals(purchaseId).toArray();
  const cartItems = await db.cartItems.where('purchaseId').equals(purchaseId).toArray();

  const totalSpentCents = calculateCartTotalCents(cartItems);
  const balanceCents = calculateBalanceCents(finalBudgetCents, totalSpentCents);
  const budgetUsedPercent = finalBudgetCents > 0 
    ? Math.round((totalSpentCents / finalBudgetCents) * 1000) / 10 
    : 0;

  const completedAt = Date.now();
  const updatedPurchase: Purchase = {
    ...purchase,
    budgetCents: finalBudgetCents,
    status: 'completed',
    completedAt,
    snapshotSummary: {
      totalSpentCents,
      balanceCents,
      itemCount: cartItems.length,
      overBudget: totalSpentCents > finalBudgetCents,
    },
  };

  const snapshot: CompletedPurchaseSnapshot & { id: string } = {
    id: purchaseId,
    purchase: updatedPurchase,
    plannedItems,
    cartItems,
    totalSpentCents,
    balanceCents,
    budgetUsedPercent,
  };

  // Perform in transaction to ensure atomicity
  await db.transaction('rw', db.purchases, db.completedSnapshots, async () => {
    await db.purchases.put(updatedPurchase);
    await db.completedSnapshots.put(snapshot);
  });

  return snapshot;
}

export async function discardPurchase(purchaseId: string): Promise<void> {
  await db.transaction('rw', db.purchases, db.plannedItems, db.cartItems, async () => {
    await db.purchases.update(purchaseId, { status: 'discarded' });
  });
}

export async function getCompletedPurchases(): Promise<Purchase[]> {
  const completed = await db.purchases
    .where('status')
    .equals('completed')
    .toArray();
  return completed.sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));
}

export async function getSnapshot(purchaseId: string): Promise<CompletedPurchaseSnapshot | null> {
  const snapshot = await db.completedSnapshots.get(purchaseId);
  return snapshot || null;
}

export async function repeatListFromPurchase(
  pastPurchaseId: string,
  newBudgetCents: number,
  newName?: string
): Promise<Purchase> {
  const existingActive = await getActivePurchase();
  if (existingActive) {
    throw new Error('Finalize ou descarte a compra atual antes de repetir uma lista.');
  }

  // Look up snapshot first, or planned items
  const snapshot = await getSnapshot(pastPurchaseId);
  let itemsToCopy: {
    name: string;
    category: string;
    plannedQuantity: number;
    unit: UnitType;
    estimatedUnitPriceCents?: number | null;
    priority: PriorityType;
  }[] = [];

  if (snapshot && snapshot.plannedItems && snapshot.plannedItems.length > 0) {
    itemsToCopy = snapshot.plannedItems.map(p => ({
      name: p.name,
      category: p.category,
      plannedQuantity: p.plannedQuantity,
      unit: p.unit,
      estimatedUnitPriceCents: p.estimatedUnitPriceCents,
      priority: p.priority,
    }));
  } else if (snapshot && snapshot.cartItems && snapshot.cartItems.length > 0) {
    // If the past purchase had no planned items but had cart items, copy them as planned items!
    itemsToCopy = snapshot.cartItems.map(c => ({
      name: c.name,
      category: c.category,
      plannedQuantity: c.quantity,
      unit: c.unit,
      estimatedUnitPriceCents: c.unitPriceCents,
      priority: 'normal' as PriorityType,
    }));
  } else {
    const rawPlanned = await db.plannedItems.where('purchaseId').equals(pastPurchaseId).toArray();
    itemsToCopy = rawPlanned.map(p => ({
      name: p.name,
      category: p.category,
      plannedQuantity: p.plannedQuantity,
      unit: p.unit,
      estimatedUnitPriceCents: p.estimatedUnitPriceCents,
      priority: p.priority,
    }));
  }

  const newPurchase: Purchase = {
    id: generateId(),
    name: newName?.trim() || `Compra Repetida`,
    budgetCents: newBudgetCents,
    status: 'active',
    createdAt: Date.now(),
  };

  await db.transaction('rw', db.purchases, db.plannedItems, async () => {
    await db.purchases.add(newPurchase);
    for (const item of itemsToCopy) {
      const planned: PlannedItem = {
        id: generateId(),
        purchaseId: newPurchase.id,
        name: item.name,
        category: item.category,
        plannedQuantity: item.plannedQuantity,
        unit: item.unit,
        estimatedUnitPriceCents: item.estimatedUnitPriceCents,
        priority: item.priority,
        createdAt: Date.now(),
      };
      await db.plannedItems.add(planned);
    }
  });

  return newPurchase;
}

export async function seedDemoData(
  customBudgetCents?: number,
  customName?: string
): Promise<Purchase> {
  const existing = await getActivePurchase();
  if (existing) {
    await discardPurchase(existing.id);
  }

  const budgetCents =
    customBudgetCents !== undefined && customBudgetCents > 0
      ? customBudgetCents
      : 50000; // Default R$ 500,00

  const demoPurchase: Purchase = {
    id: generateId(),
    name: customName || 'Supermercado Mensal — Demo',
    budgetCents,
    status: 'active',
    createdAt: Date.now(),
  };

  const plannedItemsData: Omit<PlannedItem, 'id' | 'createdAt'>[] = [
    {
      purchaseId: demoPurchase.id,
      name: 'Arroz Tipo 1 5kg',
      category: 'Mercearia',
      plannedQuantity: 1,
      unit: 'pct',
      estimatedUnitPriceCents: 2600,
      priority: 'essential',
    },
    {
      purchaseId: demoPurchase.id,
      name: 'Feijão Carioca 1kg',
      category: 'Mercearia',
      plannedQuantity: 2,
      unit: 'pct',
      estimatedUnitPriceCents: 750,
      priority: 'essential',
    },
    {
      purchaseId: demoPurchase.id,
      name: 'Leite Integral 1L',
      category: 'Laticínios e Frios',
      plannedQuantity: 4,
      unit: 'un',
      estimatedUnitPriceCents: 520,
      priority: 'essential',
    },
    {
      purchaseId: demoPurchase.id,
      name: 'Filé de Frango',
      category: 'Carnes e Aves',
      plannedQuantity: 1.5,
      unit: 'kg',
      estimatedUnitPriceCents: 2190,
      priority: 'normal',
    },
    {
      purchaseId: demoPurchase.id,
      name: 'Maçã Gala',
      category: 'Hortifrúti',
      plannedQuantity: 0.8,
      unit: 'kg',
      estimatedUnitPriceCents: 1290,
      priority: 'normal',
    },
    {
      purchaseId: demoPurchase.id,
      name: 'Detergente Neutro',
      category: 'Limpeza',
      plannedQuantity: 2,
      unit: 'un',
      estimatedUnitPriceCents: 280,
      priority: 'normal',
    },
  ];

  await db.transaction('rw', db.purchases, db.plannedItems, db.cartItems, async () => {
    await db.purchases.add(demoPurchase);
    
    // Add planned items and put some in cart to demonstrate active shopping state
    const createdPlanned: PlannedItem[] = [];
    for (const p of plannedItemsData) {
      const item: PlannedItem = {
        ...p,
        id: generateId(),
        createdAt: Date.now(),
      };
      await db.plannedItems.add(item);
      createdPlanned.push(item);
    }

    // In-cart item 1: Arroz (R$ 25,90)
    await db.cartItems.add({
      id: generateId(),
      purchaseId: demoPurchase.id,
      plannedItemId: createdPlanned[0].id,
      name: createdPlanned[0].name,
      category: createdPlanned[0].category,
      unit: createdPlanned[0].unit,
      quantity: 1,
      unitPriceCents: 2590,
      createdAt: Date.now() - 300000,
      updatedAt: Date.now() - 300000,
    });

    // In-cart item 2: Leite Integral (2 of 4 bought so far at R$ 5,30)
    await db.cartItems.add({
      id: generateId(),
      purchaseId: demoPurchase.id,
      plannedItemId: createdPlanned[2].id,
      name: createdPlanned[2].name,
      category: createdPlanned[2].category,
      unit: createdPlanned[2].unit,
      quantity: 2,
      unitPriceCents: 530,
      createdAt: Date.now() - 150000,
      updatedAt: Date.now() - 150000,
    });
  });

  return demoPurchase;
}

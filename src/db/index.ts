import Dexie, { type Table } from 'dexie';
import type { Purchase, PlannedItem, CartItem, CompletedPurchaseSnapshot } from '../types/index.ts';

export class CompraCertaDatabase extends Dexie {
  purchases!: Table<Purchase, string>;
  plannedItems!: Table<PlannedItem, string>;
  cartItems!: Table<CartItem, string>;
  completedSnapshots!: Table<CompletedPurchaseSnapshot & { id: string }, string>;

  constructor() {
    super('CompraCertaDB');
    this.version(1).stores({
      purchases: 'id, status, createdAt',
      plannedItems: 'id, purchaseId, category, priority, createdAt',
      cartItems: 'id, purchaseId, plannedItemId, category, createdAt',
      completedSnapshots: 'id, purchase.id, purchase.completedAt',
    });
  }
}

export const db = new CompraCertaDatabase();

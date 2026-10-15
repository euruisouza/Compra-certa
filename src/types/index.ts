export type UnitType = 'un' | 'kg' | 'g' | 'L' | 'mL' | 'pct';

export type PriorityType = 'essential' | 'normal';

export type PurchaseStatus = 'active' | 'completed' | 'discarded';

export type LogoModelType = 'sustentavel' | 'carrinho-verde';

export interface Purchase {
  id: string;
  name?: string;
  budgetCents: number;
  status: PurchaseStatus;
  createdAt: number;
  completedAt?: number;
  // Snapshot saved upon completion
  snapshotSummary?: {
    totalSpentCents: number;
    balanceCents: number;
    itemCount: number;
    overBudget: boolean;
  };
}

export interface PlannedItem {
  id: string;
  purchaseId: string;
  name: string;
  category: string;
  plannedQuantity: number;
  unit: UnitType;
  estimatedUnitPriceCents?: number | null;
  priority: PriorityType;
  createdAt: number;
}

export interface CartItem {
  id: string;
  purchaseId: string;
  plannedItemId?: string | null;
  name: string;
  category: string;
  unit: UnitType;
  quantity: number;
  unitPriceCents: number;
  createdAt: number;
  updatedAt: number;
}

export interface CompletedPurchaseSnapshot {
  purchase: Purchase;
  plannedItems: PlannedItem[];
  cartItems: CartItem[];
  totalSpentCents: number;
  balanceCents: number;
  budgetUsedPercent: number;
}

export const CATEGORIES = [
  'Hortifrúti',
  'Carnes e Aves',
  'Laticínios e Frios',
  'Padaria',
  'Bebidas',
  'Mercearia',
  'Limpeza',
  'Higiene e Beleza',
  'Congelados',
  'Doces e Lanches',
  'Pet Shop',
  'Outros',
] as const;

export type CategoryType = typeof CATEGORIES[number];

export const UNITS: { value: UnitType; label: string; step: number }[] = [
  { value: 'un', label: 'un (unidade)', step: 1 },
  { value: 'kg', label: 'kg (quilo)', step: 0.05 },
  { value: 'g', label: 'g (gramas)', step: 50 },
  { value: 'L', label: 'L (litro)', step: 0.1 },
  { value: 'mL', label: 'mL (mililitro)', step: 50 },
  { value: 'pct', label: 'pct (pacote)', step: 1 },
];

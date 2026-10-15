/**
 * Pure monetary and calculation utilities for Compra Certa.
 * All monetary values are handled in integer cents to prevent floating-point drift.
 */

/**
 * Parses user input into integer cents.
 * Handles Brazilian format ("5,50", "1.234,56", "25,90"), dot format ("5.50"), or pure integers ("200").
 * Satisfies CA11: "5,50 deve ser interpretado como R$ 5,50, nunca R$ 550,00".
 */
export function parseCurrencyToCents(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === '') {
    return 0;
  }

  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) return 0;
    return Math.round(input * 100);
  }

  let cleaned = input.trim();
  // Remove "R$", spaces, etc.
  cleaned = cleaned.replace(/^R\$\s*/i, '').trim();

  if (!cleaned) return 0;

  const isNegative = cleaned.startsWith('-') || cleaned.endsWith('-');
  cleaned = cleaned.replace(/^-|\+|-$/g, '').trim();

  // If contains comma, comma is the decimal separator (pt-BR standard: "1.234,56" or "5,50")
  if (cleaned.includes(',')) {
    // Remove thousands dots
    const withoutDots = cleaned.replace(/\./g, '');
    const [intPart, decPart = ''] = withoutDots.split(',');
    const paddedDec = (decPart + '00').slice(0, 2);
    const cents = parseInt(intPart || '0', 10) * 100 + parseInt(paddedDec, 10);
    return isNegative ? -cents : cents;
  }

  // If contains dot: check if it's decimal ("5.50") or thousands ("1.000")
  if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    // If multiple dots like "1.200.000", they are thousands separators
    if (parts.length > 2) {
      const integerOnly = parts.join('');
      const cents = parseInt(integerOnly, 10) * 100;
      return isNegative ? -cents : cents;
    }
    // Single dot: e.g. "5.50" or "25.9"
    const [intPart, decPart = ''] = parts;
    if (decPart.length <= 2) {
      const paddedDec = (decPart + '00').slice(0, 2);
      const cents = parseInt(intPart || '0', 10) * 100 + parseInt(paddedDec, 10);
      return isNegative ? -cents : cents;
    }
    // If decPart has 3 digits and intPart >= 1, could be thousands separator like "1.000"
    if (decPart.length === 3 && parseInt(intPart, 10) > 0) {
      const cents = parseInt(intPart + decPart, 10) * 100;
      return isNegative ? -cents : cents;
    }
    // Otherwise standard decimal rounded
    const floatVal = parseFloat(cleaned);
    const cents = Math.round(floatVal * 100);
    return isNegative ? -cents : cents;
  }

  // Integer without separators: "200" -> 20000 cents (R$ 200,00)
  const integerVal = parseInt(cleaned, 10);
  if (isNaN(integerVal)) return 0;
  const cents = integerVal * 100;
  return isNegative ? -cents : cents;
}

/**
 * Formats integer cents into pt-BR currency string (e.g. "R$ 1.234,56" or "-R$ 16,50").
 */
export function formatCentsToBRL(cents: number): string {
  if (isNaN(cents) || !isFinite(cents)) return 'R$ 0,00';
  
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const reais = Math.floor(absCents / 100);
  const centavos = absCents % 100;
  
  const reaisFormatted = reais.toLocaleString('pt-BR');
  const centavosFormatted = centavos.toString().padStart(2, '0');
  
  return `${isNegative ? '-' : ''}R$ ${reaisFormatted},${centavosFormatted}`;
}

/**
 * Parses user input for quantity (handles "0,750", "0.75", "1", "2,5").
 */
export function parseQuantity(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === '') return 1;
  if (typeof input === 'number') {
    return isNaN(input) || input <= 0 ? 1 : input;
  }
  const normalized = input.trim().replace(',', '.');
  const val = parseFloat(normalized);
  if (isNaN(val) || val <= 0) return 1;
  return Math.round(val * 1000) / 1000;
}

/**
 * Formats quantity for display (e.g. 1 -> "1", 0.75 -> "0,75", 1.5 -> "1,5").
 */
export function formatQuantity(qty: number): string {
  if (qty % 1 === 0) return qty.toString();
  return qty.toString().replace('.', ',');
}

/**
 * Calculates item subtotal in cents.
 * Satisfies CA12: 0.750 kg @ R$ 19,90 = R$ 14,93 (1493 cents).
 */
export function calculateSubtotalCents(quantity: number, unitPriceCents: number): number {
  if (quantity <= 0 || unitPriceCents <= 0) return 0;
  // Standard monetary rounding: Math.round(quantity * unitPriceCents)
  return Math.round(quantity * unitPriceCents);
}

/**
 * Calculates sum of all cart item subtotals.
 */
export function calculateCartTotalCents(items: { quantity: number; unitPriceCents: number }[]): number {
  return items.reduce((sum, item) => sum + calculateSubtotalCents(item.quantity, item.unitPriceCents), 0);
}

/**
 * Calculates remaining balance in cents. Can be negative (RN03).
 */
export function calculateBalanceCents(budgetCents: number, cartTotalCents: number): number {
  return budgetCents - cartTotalCents;
}

export type BudgetStatusLevel = 'normal' | 'warning_70' | 'alert_90' | 'exceeded_100';

export interface BudgetStatusInfo {
  percent: number;
  level: BudgetStatusLevel;
  message: string;
  isOverBudget: boolean;
  barColor: string;
  badgeBg: string;
  badgeText: string;
}

/**
 * Calculates budget status and triggers informative alerts as per RN04 & Section 12:
 * - < 70%: Normal ("Orçamento sob controle")
 * - 70% to < 90%: "Você já usou boa parte do seu orçamento."
 * - 90% to < 100%: "Atenção: seu saldo está acabando."
 * - >= 100%: "Você atingiu ou ultrapassou seu orçamento."
 */
export function calculateBudgetStatus(budgetCents: number, cartTotalCents: number): BudgetStatusInfo {
  if (budgetCents <= 0) {
    return {
      percent: cartTotalCents > 0 ? 100 : 0,
      level: cartTotalCents > 0 ? 'exceeded_100' : 'normal',
      message: 'Defina um orçamento para a compra.',
      isOverBudget: cartTotalCents > 0,
      barColor: '#DC2626',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-700',
    };
  }

  const exactPercent = (cartTotalCents / budgetCents) * 100;
  const percent = Math.round(exactPercent * 10) / 10;
  const isOverBudget = cartTotalCents > budgetCents;

  if (cartTotalCents >= budgetCents) {
    return {
      percent,
      level: 'exceeded_100',
      message: 'Você atingiu ou ultrapassou seu orçamento.',
      isOverBudget: true,
      barColor: '#DC2626',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-700',
    };
  }

  if (exactPercent >= 90) {
    return {
      percent,
      level: 'alert_90',
      message: 'Atenção: seu saldo está acabando.',
      isOverBudget: false,
      barColor: '#EA580C',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
    };
  }

  if (exactPercent >= 70) {
    return {
      percent,
      level: 'warning_70',
      message: 'Você já usou boa parte do seu orçamento.',
      isOverBudget: false,
      barColor: '#D97706',
      badgeBg: 'bg-amber-50/70',
      badgeText: 'text-amber-700',
    };
  }

  return {
    percent,
    level: 'normal',
    message: 'Orçamento sob controle.',
    isOverBudget: false,
    barColor: '#118447',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCurrencyToCents,
  formatCentsToBRL,
  parseQuantity,
  calculateSubtotalCents,
  calculateCartTotalCents,
  calculateBalanceCents,
  calculateBudgetStatus,
} from './money.ts';

test('CA11: currency parsing correctly handles pt-BR comma and integer inputs', () => {
  assert.equal(parseCurrencyToCents('5,50'), 550, '5,50 must be 550 cents');
  assert.equal(parseCurrencyToCents('5.50'), 550, '5.50 must be 550 cents');
  assert.equal(parseCurrencyToCents('25,90'), 2590, '25,90 must be 2590 cents');
  assert.equal(parseCurrencyToCents('200'), 20000, '200 must be 20000 cents (R$ 200,00)');
  assert.equal(parseCurrencyToCents('R$ 300,00'), 30000, 'R$ 300,00 must be 30000 cents');
  assert.equal(parseCurrencyToCents('1.234,56'), 123456, '1.234,56 must be 123456 cents');
  assert.equal(parseCurrencyToCents(5.5), 550, 'numeric 5.5 must be 550 cents');
});

test('CA12: weighted product calculation (0,750 kg @ R$ 19,90 = R$ 14,93)', () => {
  const qty = parseQuantity('0,750');
  assert.equal(qty, 0.75);
  const unitPriceCents = parseCurrencyToCents('19,90'); // 1990 cents
  assert.equal(unitPriceCents, 1990);
  
  const subtotal = calculateSubtotalCents(qty, unitPriceCents);
  // 0.75 * 1990 = 1492.5 -> rounded to 1493 cents = R$ 14,93
  assert.equal(subtotal, 1493);
  assert.equal(formatCentsToBRL(subtotal), 'R$ 14,93');
});

test('CA01: initial budget R$ 200,00 with empty cart', () => {
  const budgetCents = parseCurrencyToCents('200,00');
  const cartTotal = calculateCartTotalCents([]);
  const balance = calculateBalanceCents(budgetCents, cartTotal);
  
  assert.equal(budgetCents, 20000);
  assert.equal(cartTotal, 0);
  assert.equal(balance, 20000);
  assert.equal(formatCentsToBRL(balance), 'R$ 200,00');
  
  const status = calculateBudgetStatus(budgetCents, cartTotal);
  assert.equal(status.percent, 0);
  assert.equal(status.level, 'normal');
  assert.equal(status.isOverBudget, false);
});

test('CA03: adding rice (R$ 25,90) and 2 milks (R$ 5,50 each)', () => {
  const budgetCents = 20000; // R$ 200,00
  const items = [
    { quantity: 1, unitPriceCents: 2590 },
    { quantity: 2, unitPriceCents: 550 },
  ];
  const cartTotal = calculateCartTotalCents(items);
  const balance = calculateBalanceCents(budgetCents, cartTotal);
  
  assert.equal(cartTotal, 3690, 'Total should be R$ 36,90 (3690 cents)');
  assert.equal(balance, 16310, 'Balance should be R$ 163,10 (16310 cents)');
  assert.equal(formatCentsToBRL(cartTotal), 'R$ 36,90');
  assert.equal(formatCentsToBRL(balance), 'R$ 163,10');
});

test('CA04: editing item from 2 milks to 3 milks', () => {
  const budgetCents = 20000;
  const items = [
    { quantity: 1, unitPriceCents: 2590 },
    { quantity: 3, unitPriceCents: 550 }, // changed to 3
  ];
  const cartTotal = calculateCartTotalCents(items);
  const balance = calculateBalanceCents(budgetCents, cartTotal);
  
  assert.equal(cartTotal, 4240, 'Total should be R$ 42,40 (4240 cents)');
  assert.equal(balance, 15760, 'Balance should be R$ 157,60 (15760 cents)');
  assert.equal(formatCentsToBRL(cartTotal), 'R$ 42,40');
  assert.equal(formatCentsToBRL(balance), 'R$ 157,60');
});

test('CA05: removing rice leaves only 3 milks', () => {
  const budgetCents = 20000;
  const items = [
    { quantity: 3, unitPriceCents: 550 },
  ];
  const cartTotal = calculateCartTotalCents(items);
  const balance = calculateBalanceCents(budgetCents, cartTotal);
  
  assert.equal(cartTotal, 1650, 'Total should be R$ 16,50 (1650 cents)');
  assert.equal(balance, 18350, 'Balance should be R$ 183,50 (18350 cents)');
  assert.equal(formatCentsToBRL(cartTotal), 'R$ 16,50');
  assert.equal(formatCentsToBRL(balance), 'R$ 183,50');
});

test('CA06: exceeding budget produces negative balance and exceeded status', () => {
  const budgetCents = 20000; // R$ 200,00
  const items = [
    { quantity: 1, unitPriceCents: 21650 }, // R$ 216,50
  ];
  const cartTotal = calculateCartTotalCents(items);
  const balance = calculateBalanceCents(budgetCents, cartTotal);
  
  assert.equal(balance, -1650, 'Balance should be -1650 cents');
  assert.equal(formatCentsToBRL(balance), '-R$ 16,50');
  
  const status = calculateBudgetStatus(budgetCents, cartTotal);
  assert.equal(status.isOverBudget, true);
  assert.equal(status.level, 'exceeded_100');
  assert.equal(status.message, 'Você atingiu ou ultrapassou seu orçamento.');
});

test('RN04: budget threshold triggers at 70%, 90% and 100%', () => {
  const budgetCents = 10000; // R$ 100,00
  
  // 69% -> normal
  assert.equal(calculateBudgetStatus(budgetCents, 6900).level, 'normal');
  
  // 70% -> warning_70
  const status70 = calculateBudgetStatus(budgetCents, 7000);
  assert.equal(status70.level, 'warning_70');
  assert.equal(status70.message, 'Você já usou boa parte do seu orçamento.');
  
  // 90% -> alert_90
  const status90 = calculateBudgetStatus(budgetCents, 9000);
  assert.equal(status90.level, 'alert_90');
  assert.equal(status90.message, 'Atenção: seu saldo está acabando.');
  
  // 100% -> exceeded_100
  const status100 = calculateBudgetStatus(budgetCents, 10000);
  assert.equal(status100.level, 'exceeded_100');
  assert.equal(status100.message, 'Você atingiu ou ultrapassou seu orçamento.');
});

test('Exact calculation with budget R$ 500,00 upon finalizing', () => {
  const budgetCents = parseCurrencyToCents('500,00');
  assert.equal(budgetCents, 50000);
  assert.equal(formatCentsToBRL(budgetCents), 'R$ 500,00');

  // Items totaling R$ 36,50
  const items = [
    { quantity: 1, unitPriceCents: 2590 },
    { quantity: 2, unitPriceCents: 530 },
  ];
  const cartTotal = calculateCartTotalCents(items);
  assert.equal(cartTotal, 3650);
  assert.equal(formatCentsToBRL(cartTotal), 'R$ 36,50');

  // Exact balance: 500,00 - 36,50 = 463,50
  const balance = calculateBalanceCents(budgetCents, cartTotal);
  assert.equal(balance, 46350);
  assert.equal(formatCentsToBRL(balance), 'R$ 463,50');

  const status = calculateBudgetStatus(budgetCents, cartTotal);
  assert.equal(status.percent, 7.3);
  assert.equal(status.isOverBudget, false);
});


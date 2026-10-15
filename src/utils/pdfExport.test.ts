import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePdfFilename } from './pdfExport.ts';

test('generatePdfFilename sanitizes names and adds dates correctly', () => {
  const fixedDate = new Date(2026, 9, 15); // October 15, 2026
  
  const fn1 = generatePdfFilename('Compras da Semana', fixedDate);
  assert.equal(fn1, 'compras-da-semana-2026-10-15.pdf');

  const fn2 = generatePdfFilename('Supermercado — sábado!', fixedDate);
  assert.equal(fn2, 'supermercado-sabado-2026-10-15.pdf');

  const fn3 = generatePdfFilename('', fixedDate);
  assert.equal(fn3, 'compra-certa-2026-10-15.pdf');
});

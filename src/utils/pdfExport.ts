import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompletedPurchaseSnapshot, Purchase } from '../types/index.ts';
import { formatCentsToBRL, formatQuantity, calculateSubtotalCents } from './money.ts';

/**
 * Sanitizes a string for use in filenames.
 */
export function generatePdfFilename(prefix: string, date: Date = new Date()): string {
  const safePrefix = prefix
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${safePrefix || 'compra-certa'}-${yyyy}-${mm}-${dd}.pdf`;
}

/**
 * Exports a single completed purchase snapshot to a high quality PDF receipt.
 */
export function exportPurchaseSnapshotToPdf(snapshot: CompletedPurchaseSnapshot): void {
  const { purchase, cartItems, totalSpentCents, balanceCents } = snapshot;
  const isOver = balanceCents < 0;
  const purchaseDate = new Date(purchase.completedAt || purchase.createdAt);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Active brand logo model
  const activeLogo =
    typeof localStorage !== 'undefined' && localStorage.getItem('compra_certa_logo_model') === 'carrinho-verde'
      ? 'carrinho-verde'
      : 'sustentavel';

  // Header banner in brand green
  doc.setFillColor(17, 132, 71); // #118447
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPRA CERTA', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(234, 247, 238);
  doc.text('Relatório Oficial de Compra no Supermercado', 14, 20);

  // Date on the right of header
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(purchaseDate);

  doc.text(formattedDate, pageWidth - 14, 20, { align: 'right' });

  // Purchase Name Section
  let currentY = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(21, 37, 28);
  doc.text(purchase.name || 'Supermercado', 14, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 112, 103);
  doc.text(`Identificador: ${purchase.id}`, 14, currentY);

  // Financial KPI Cards Row
  currentY += 8;
  const cardWidth = (pageWidth - 28 - 6) / 3;
  const cardHeight = 22;

  // Box 1: Orçamento
  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(225, 234, 228);
  doc.roundedRect(14, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 112, 103);
  doc.text('ORÇAMENTO PREVISTO', 18, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(21, 37, 28);
  doc.text(formatCentsToBRL(purchase.budgetCents), 18, currentY + 16);

  // Box 2: Total Gasto
  const x2 = 14 + cardWidth + 3;
  doc.roundedRect(x2, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 112, 103);
  doc.text('TOTAL NO CARRINHO', x2 + 4, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(7, 94, 55);
  doc.text(formatCentsToBRL(totalSpentCents), x2 + 4, currentY + 16);

  // Box 3: Saldo / Excesso
  const x3 = x2 + cardWidth + 3;
  if (isOver) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
  } else {
    doc.setFillColor(234, 247, 238);
    doc.setDrawColor(167, 243, 208);
  }
  doc.roundedRect(x3, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(isOver ? 185 : 7, isOver ? 28 : 94, isOver ? 28 : 55);
  doc.text(isOver ? 'EXCESSO ORÇAMENTÁRIO' : 'ECONOMIA OBTIDA', x3 + 4, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(isOver ? 220 : 17, isOver ? 38 : 132, isOver ? 38 : 71);
  doc.text(formatCentsToBRL(Math.abs(balanceCents)), x3 + 4, currentY + 16);

  currentY += cardHeight + 8;

  // Items Table
  const tableRows = cartItems.map((item, index) => {
    const subtotal = calculateSubtotalCents(item.quantity, item.unitPriceCents);
    return [
      (index + 1).toString(),
      item.name,
      item.category,
      `${formatQuantity(item.quantity)} ${item.unit}`,
      formatCentsToBRL(item.unitPriceCents),
      formatCentsToBRL(subtotal),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Produto', 'Categoria', 'Quantidade', 'Preço Unit.', 'Subtotal']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [17, 132, 71],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      textColor: [21, 37, 28],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 249],
    },
    foot: [
      [
        '',
        `Total de produtos: ${cartItems.length}`,
        '',
        '',
        'Total Gasto:',
        formatCentsToBRL(totalSpentCents),
      ],
    ],
    footStyles: {
      fillColor: [234, 247, 238],
      textColor: [7, 94, 55],
      fontStyle: 'bold',
      fontSize: 9.5,
      halign: 'right',
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 145);
      doc.text(
        `Compra Certa · Página ${data.pageNumber} de ${pageCount} · Registro pessoal de gastos`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  const filename = generatePdfFilename(`compra-${purchase.name || 'supermercado'}`, purchaseDate);
  doc.save(filename);
}

/**
 * Exports all completed purchases history report to a consolidated PDF document.
 */
export function exportHistoryReportToPdf(purchases: Purchase[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header banner
  doc.setFillColor(17, 132, 71); // #118447
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPRA CERTA', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(234, 247, 238);
  doc.text('Relatório Consolidado de Histórico', 14, 20);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now);
  doc.text(`Emitido em ${formattedDate}`, pageWidth - 14, 20, { align: 'right' });

  // Totals calculations
  let totalBudgetCents = 0;
  let totalSpentCents = 0;
  let totalItemsCount = 0;

  purchases.forEach((p) => {
    totalBudgetCents += p.budgetCents;
    if (p.snapshotSummary) {
      totalSpentCents += p.snapshotSummary.totalSpentCents;
      totalItemsCount += p.snapshotSummary.itemCount;
    }
  });

  const totalBalanceCents = totalBudgetCents - totalSpentCents;
  const isNetOver = totalBalanceCents < 0;

  // KPI Summary Boxes
  let currentY = 36;
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 20;

  const kpis = [
    { label: 'COMPRAS', value: purchases.length.toString() },
    { label: 'ORÇAMENTO TOTAL', value: formatCentsToBRL(totalBudgetCents) },
    { label: 'GASTO TOTAL', value: formatCentsToBRL(totalSpentCents) },
    {
      label: isNetOver ? 'EXCESSO TOTAL' : 'ECONOMIA TOTAL',
      value: formatCentsToBRL(Math.abs(totalBalanceCents)),
      color: isNetOver ? [220, 38, 38] : [17, 132, 71],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 249);
    doc.setDrawColor(225, 234, 228);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 112, 103);
    doc.text(kpi.label, x + 3.5, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    if (kpi.color) {
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    } else {
      doc.setTextColor(21, 37, 28);
    }
    doc.text(kpi.value, x + 3.5, currentY + 15);
  });

  currentY += cardHeight + 8;

  // Purchases Table
  const tableRows = purchases.map((p, idx) => {
    const summary = p.snapshotSummary;
    const spent = summary?.totalSpentCents || 0;
    const balance = summary ? summary.balanceCents : p.budgetCents - spent;
    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(p.completedAt || p.createdAt));

    const statusText = balance < 0 ? 'Acima do limite' : 'Dentro do limite';

    return [
      (idx + 1).toString(),
      date,
      p.name || 'Supermercado',
      formatCentsToBRL(p.budgetCents),
      formatCentsToBRL(spent),
      formatCentsToBRL(balance),
      (summary?.itemCount || 0).toString(),
      statusText,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Data', 'Compra', 'Orçamento', 'Gasto', 'Saldo', 'Itens', 'Situação']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [17, 132, 71],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      textColor: [21, 37, 28],
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 'auto', fontStyle: 'bold' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 26, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 249],
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 145);
      doc.text(
        `Compra Certa · Página ${data.pageNumber} de ${pageCount} · Histórico consolidado de gastos`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  doc.save(generatePdfFilename('relatorio-historico-compra-certa', now));
}

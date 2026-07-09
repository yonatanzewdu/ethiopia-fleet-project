import { Injectable } from '@nestjs/common';
// npm i pdfkit && npm i -D @types/pdfkit
import PDFDocument from 'pdfkit';
import { FullReportData, ComplianceAlert, VehicleReportRow } from './reports.service';

const PAGE_MARGIN = 40;

const PALETTE = {
  text: '#1f2937',
  muted: '#6b7280',
  border: '#d6dbe1',
  accent: '#2563eb',
  critical: '#b91c1c',
  warning: '#b45309',
  success: '#15803d',
  fuel: '#c2410c',
  headerBg: '#f3f4f6',
};

function money(n: number | null | undefined): string {
  return `ETB ${new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(n ?? 0)}`;
}
function num(n: number | null | undefined, digits = 1): string {
  return new Intl.NumberFormat('en-ET', { maximumFractionDigits: digits }).format(n ?? 0);
}
function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

@Injectable()
export class ReportsPdfService {
  generate(data: FullReportData): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', bufferPages: true });

    this.renderCover(doc, data);
    this.renderKpis(doc, data);
    this.renderAlerts(doc, data);
    this.renderVehicles(doc, data);
    this.renderExpenseBreakdown(doc, data);
    this.renderFuelSummary(doc, data);
    this.renderVehicleComparison(doc, data);
    this.renderPageNumbers(doc);

    return doc;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
    const bottom = doc.page.height - doc.page.margins.bottom;
    if (doc.y + needed > bottom) doc.addPage();
  }

  private sectionTitle(doc: PDFKit.PDFDocument, title: string) {
    this.ensureSpace(doc, 40);
    doc.moveDown(0.6);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(PALETTE.text).text(title);
    const y = doc.y + 2;
    doc.moveTo(PAGE_MARGIN, y).lineTo(doc.page.width - PAGE_MARGIN, y)
      .strokeColor(PALETTE.border).lineWidth(1).stroke();
    doc.moveDown(0.6);
  }

  private drawTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    colWidths: number[],
    options: { colColors?: (string | null)[][]; boldCols?: number[] } = {},
  ) {
    const startX = PAGE_MARGIN;
    const rowHeight = 20;

    const drawHeader = () => {
      this.ensureSpace(doc, rowHeight + 4);
      let x = startX;
      const y = doc.y;
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(PALETTE.headerBg);
      doc.fillColor(PALETTE.muted).font('Helvetica-Bold').fontSize(9);
      headers.forEach((h, i) => {
        doc.text(h, x + 4, y + 6, { width: colWidths[i] - 8, ellipsis: true });
        x += colWidths[i];
      });
      doc.y = y + rowHeight;
    };

    drawHeader();

    rows.forEach((row, rowIdx) => {
      this.ensureSpace(doc, rowHeight);
      if (doc.y === doc.page.margins.top) drawHeader(); // re-draw header after a page break
      let x = startX;
      const y = doc.y;
      if (rowIdx % 2 === 1) {
        doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#fafafa');
      }
      doc.font('Helvetica').fontSize(9);
      row.forEach((cell, i) => {
        const color = options.colColors?.[rowIdx]?.[i] ?? PALETTE.text;
        doc.fillColor(color).font(options.boldCols?.includes(i) ? 'Helvetica-Bold' : 'Helvetica');
        doc.text(cell, x + 4, y + 6, { width: colWidths[i] - 8, ellipsis: true });
        x += colWidths[i];
      });
      doc.y = y + rowHeight;
    });
    doc.moveDown(0.4);
  }

  private renderPageNumbers(doc: PDFKit.PDFDocument) {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.fontSize(8).fillColor(PALETTE.muted).text(
        `Page ${i + 1} of ${range.count}`,
        PAGE_MARGIN,
        doc.page.height - 28,
        { width: doc.page.width - PAGE_MARGIN * 2, align: 'center' },
      );
    }
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  private renderCover(doc: PDFKit.PDFDocument, data: FullReportData) {
    doc.fontSize(20).font('Helvetica-Bold').fillColor(PALETTE.text)
      .text(data.company?.name ?? 'Fleet Report', { align: 'left' });
    doc.fontSize(12).font('Helvetica').fillColor(PALETTE.muted)
      .text('Full Fleet & Compliance Report', { align: 'left' });
    doc.moveDown(0.6);

    doc.fontSize(9).fillColor(PALETTE.muted);
    doc.text(`Report period: inception → ${fmtDate(data.asOfDate)}`);
    if (data.company?.registrationNumber) doc.text(`Registration No: ${data.company.registrationNumber}`);
    if (data.company?.address) doc.text(`Address: ${data.company.address}`);
    doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString('en-US')}`);

    const y = doc.y + 8;
    doc.moveTo(PAGE_MARGIN, y).lineTo(doc.page.width - PAGE_MARGIN, y)
      .strokeColor(PALETTE.accent).lineWidth(2).stroke();
    doc.moveDown(1);
  }

  private renderKpis(doc: PDFKit.PDFDocument, data: FullReportData) {
    this.sectionTitle(doc, 'Fleet Summary');
    const k = data.dashboard.kpis;
    const fuel = data.dashboard.fuelSummary;

    const rows: [string, string][] = [
      ['Total Vehicles', String(data.vehicles.length)],
      ['Non-Fuel Expenses', money(k.cumulativeCompanySpend)],
      ['Fuel Spend', `${money(k.totalFuelSpend)} (${num(fuel.totalLitres)} L)`],
      ['Total Fleet Cost', money(k.totalCombinedSpend)],
      ['Distance Logged', `${num(k.totalDistanceLogged)} km`],
      ['Fleet Efficiency (CPK)', k.averageFleetEfficiency == null ? 'N/A' : `${money(k.averageFleetEfficiency)}/km`],
      ['Fuel Consumption', k.avgLitresPer100km == null ? 'N/A' : `${num(k.avgLitresPer100km)} L/100km`],
      ['Open Alerts', String(data.alerts.length)],
    ];

    const colW = (doc.page.width - PAGE_MARGIN * 2) / 2;
    rows.forEach(([label, value], i) => {
      const col = i % 2;
      if (col === 0) this.ensureSpace(doc, 18);
      const x = PAGE_MARGIN + col * colW;
      const y = doc.y;
      doc.fontSize(9).font('Helvetica').fillColor(PALETTE.muted).text(label, x, y, { continued: false, width: colW - 10 });
      doc.fontSize(9).font('Helvetica-Bold').fillColor(PALETTE.text)
        .text(value, x + colW - 140, y, { width: 140, align: 'right' });
      if (col === 1) doc.moveDown(0.9);
    });
    doc.moveDown(0.6);
  }

  private renderAlerts(doc: PDFKit.PDFDocument, data: FullReportData) {
    this.sectionTitle(doc, `Compliance & Geofence Alerts (${data.alerts.length})`);
    if (!data.alerts.length) {
      doc.fontSize(10).fillColor(PALETTE.success).text('✓ No open alerts — all assets compliant as of this date.');
      doc.moveDown(0.6);
      return;
    }
    const sorted = [...data.alerts].sort((a, b) =>
      a.severity === b.severity ? 0 : a.severity === 'CRITICAL' ? -1 : 1);

    const colWidths = [70, 100, 140, 190];
    const rows = sorted.map((a) => [a.severity, a.type.replace('_', ' '), a.assetName, a.detail]);
    const colColors = sorted.map((a) => {
      const c = a.severity === 'CRITICAL' ? PALETTE.critical : PALETTE.warning;
      return [c, null, null, null];
    });
    this.drawTable(doc, ['Severity', 'Type', 'Asset', 'Detail'], rows, colWidths, { colColors, boldCols: [0] });
  }

  private renderVehicles(doc: PDFKit.PDFDocument, data: FullReportData) {
    this.sectionTitle(doc, `Per-Vehicle Detail (${data.vehicles.length} vehicles)`);

    data.vehicles.forEach((v: VehicleReportRow, idx: number) => {
      this.ensureSpace(doc, 100);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(PALETTE.accent)
        .text(`${idx + 1}. ${v.plateNumber} — ${v.model ?? 'Unknown model'}`);
      doc.moveDown(0.2);

      const line = (label: string, value: string, color = PALETTE.text) => {
        this.ensureSpace(doc, 14);
        doc.fontSize(9).font('Helvetica').fillColor(PALETTE.muted).text(label, PAGE_MARGIN + 10, doc.y, { continued: true, width: 160 });
        doc.font('Helvetica-Bold').fillColor(color).text(`  ${value}`);
      };

      line('Status:', v.status);
      line('Chassis Number:', v.chassisNumber ?? '—');
      line('Current Mileage:', v.currentMileage != null ? `${num(v.currentMileage, 0)} km` : '—');
      line('Insurance Expiry:', fmtDate(v.insuranceExpiry));
      line('Inspection Expiry:', fmtDate(v.inspectionExpiry));
      line('Assigned Driver:', v.assignedDriver ? `${v.assignedDriver.fullName} (Lic. #${v.assignedDriver.licenseNumber}, exp. ${fmtDate(v.assignedDriver.licenseExpiry)})` : 'Unassigned');
      line('Distance Covered:', `${num(v.totalDistanceCovered)} km`);
      line('Total Cost:', money(v.totalCost), PALETTE.accent);
      line('Cost per Kilometer:', v.costPerKilometer == null ? 'N/A' : `${money(v.costPerKilometer)}/km`);

      // Recent transactions for this vehicle
      if (v.transactions.length) {
        doc.moveDown(0.3);
        this.ensureSpace(doc, 20);
        doc.fontSize(9).font('Helvetica-Bold').fillColor(PALETTE.muted).text('Expense History:', PAGE_MARGIN + 10);
        const rows = v.transactions.map((t) => [fmtDate(t.date), t.category.replace('_', ' '), money(t.amount)]);
        this.drawTable(doc, ['Date', 'Category', 'Amount'], rows, [100, 200, 100]);
      }

      // Fuel logs for this vehicle
      if (v.fuelLogs.length) {
        this.ensureSpace(doc, 20);
        doc.fontSize(9).font('Helvetica-Bold').fillColor(PALETTE.fuel).text('⛽ Fuel Log:', PAGE_MARGIN + 10);
        const rows = v.fuelLogs.map((f) => [fmtDate(f.date), `${num(f.litres)} L`, money(f.totalCost)]);
        this.drawTable(doc, ['Date', 'Litres', 'Cost'], rows, [100, 150, 150]);
      }

      doc.moveDown(0.8);
    });
  }

  private renderExpenseBreakdown(doc: PDFKit.PDFDocument, data: FullReportData) {
    this.sectionTitle(doc, 'Expense Breakdown by Category');
    const rows = data.dashboard.expenseBreakdown.map((r) => [
      r.category === 'fuel' ? '⛽ Fuel' : r.category.replace('_', ' '),
      money(r.total),
    ]);
    if (!rows.length) {
      doc.fontSize(10).fillColor(PALETTE.muted).text('No expenses in this range.');
      doc.moveDown(0.6);
      return;
    }
    this.drawTable(doc, ['Category', 'Total'], rows, [300, 190]);
  }

  private renderFuelSummary(doc: PDFKit.PDFDocument, data: FullReportData) {
    this.sectionTitle(doc, 'Fuel Cost per Vehicle');
    const perVehicle = data.dashboard.fuelSummary.perVehicle;
    if (!perVehicle.length) {
      doc.fontSize(10).fillColor(PALETTE.muted).text('No fuel logs in this range.');
      doc.moveDown(0.6);
      return;
    }
    const plateFor = (id: number) => data.vehicles.find((v) => v.id === id)?.plateNumber ?? `#${id}`;
    const rows = perVehicle.map((r) => [
      plateFor(r.vehicleId),
      money(r.totalSpend),
      `${num(r.totalLitres)} L`,
      `${num(r.totalKm)} km`,
      r.avgLitresPer100km == null ? 'N/A' : `${num(r.avgLitresPer100km)} L/100km`,
    ]);
    this.drawTable(doc, ['Vehicle', 'Fuel Spend', 'Litres', 'Distance', 'Avg L/100km'], rows, [90, 100, 90, 90, 120]);
  }

  private renderVehicleComparison(doc: PDFKit.PDFDocument, data: FullReportData) {
    this.sectionTitle(doc, 'Vehicle Comparison');
    const rows = data.dashboard.vehicleComparison.map((r) => [
      r.plateNumber ?? `#${r.vehicleId}`,
      `${num(r.totalDistanceCovered)} km`,
      money(r.totalApprovedCost),
      money(r.totalFuelCost),
      money(r.totalCost),
      r.costPerKilometer == null ? 'N/A' : `${money(r.costPerKilometer)}/km`,
    ]);
    if (!rows.length) {
      doc.fontSize(10).fillColor(PALETTE.muted).text('No vehicle data in this range.');
      return;
    }
    this.drawTable(doc, ['Vehicle', 'Distance', 'Other Costs', 'Fuel Cost', 'Total Cost', 'CPK'], rows, [80, 80, 90, 90, 90, 70]);
  }
}

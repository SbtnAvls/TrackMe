import * as XLSX from 'xlsx';
import { formatDate, getMonthName } from './formatters';

export const exportToExcel = (transactions, year, month) => {
  const data = transactions.map(t => ({
    Fecha: formatDate(t.date),
    Tipo: t.type === 'income' ? 'Ingreso' : t.type === 'card_payment' ? 'Pago deuda' : 'Gasto',
    Categoría: t.category,
    'Método de pago': t.creditCardId ? 'Tarjeta' : (t.paymentMethod === 'cash' ? 'Efectivo' : 'Débito'),
    Descripción: t.description,
    Monto: t.amount
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

  const fileName = `gastos_${getMonthName(month)}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToCSV = (transactions, year, month) => {
  const data = transactions.map(t => ({
    Fecha: formatDate(t.date),
    Tipo: t.type === 'income' ? 'Ingreso' : t.type === 'card_payment' ? 'Pago deuda' : 'Gasto',
    Categoría: t.category,
    'Método de pago': t.creditCardId ? 'Tarjeta' : (t.paymentMethod === 'cash' ? 'Efectivo' : 'Débito'),
    Descripción: t.description,
    Monto: t.amount
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `gastos_${getMonthName(month)}_${year}.csv`;
  link.click();
};

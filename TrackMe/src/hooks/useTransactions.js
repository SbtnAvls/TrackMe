import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useTransactions(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const transactions = useLiveQuery(
    () => db.transactions
      .where('date')
      .between(startDate.toISOString(), endDate.toISOString(), true, true)
      .reverse()
      .sortBy('date'),
    [year, month]
  );

  // Balance acumulado: todas las transacciones hasta el final del mes seleccionado
  // IMPORTANTE: Los gastos con tarjeta de crédito NO afectan el saldo (no salió dinero del bolsillo)
  const accumulatedBalance = useLiveQuery(
    () => db.transactions
      .where('date')
      .belowOrEqual(endDate.toISOString())
      .toArray()
      .then(allTransactions => {
        return allTransactions.reduce((acc, t) => {
          if (t.type === 'income') {
            // Ingresos suman al saldo
            return acc + t.amount;
          } else if (t.type === 'expense' && t.creditCardId) {
            // Gastos con tarjeta de crédito NO afectan el saldo (es deuda, no salió dinero)
            return acc;
          } else {
            // Gastos en efectivo/débito y pagos a tarjeta restan del saldo
            return acc - t.amount;
          }
        }, 0);
      }),
    [year, month]
  );

  const addTransaction = async (transaction) => {
    const dateWithTime = transaction.date + 'T12:00:00';
    return await db.transactions.add({
      ...transaction,
      date: new Date(dateWithTime).toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  const updateTransaction = async (id, updates) => {
    if (updates.date) {
      const dateWithTime = updates.date + 'T12:00:00';
      updates.date = new Date(dateWithTime).toISOString();
    }
    return await db.transactions.update(id, updates);
  };

  const deleteTransaction = async (id) => {
    return await db.transactions.delete(id);
  };

  // Summary del mes (incluye todos los gastos para ver el total gastado)
  const summary = transactions?.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.totalIncome += t.amount;
      } else if (t.type === 'expense') {
        acc.totalExpense += t.amount;
        if (t.creditCardId) {
          acc.creditCardExpense += t.amount;
        } else {
          acc.cashExpense += t.amount;
        }
      } else if (t.type === 'card_payment') {
        acc.cardPayments += t.amount;
      }
      acc.balance = acc.totalIncome - acc.cashExpense - acc.cardPayments;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, cashExpense: 0, creditCardExpense: 0, cardPayments: 0, balance: 0 }
  ) || { totalIncome: 0, totalExpense: 0, cashExpense: 0, creditCardExpense: 0, cardPayments: 0, balance: 0 };

  const categoryData = transactions?.reduce((acc, t) => {
    if (t.type === 'card_payment') return acc; // No incluir pagos a tarjeta en las categorías
    const existing = acc.find(item => item.category === t.category && item.type === t.type);
    if (existing) {
      existing.amount += t.amount;
    } else {
      acc.push({ category: t.category, type: t.type, amount: t.amount });
    }
    return acc;
  }, []) || [];

  return {
    transactions: transactions || [],
    summary,
    categoryData,
    accumulatedBalance: accumulatedBalance || 0,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading: transactions === undefined || accumulatedBalance === undefined
  };
}

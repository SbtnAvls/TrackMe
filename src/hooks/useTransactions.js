import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addTransaction as addTransactionFS,
  updateTransaction as updateTransactionFS,
  deleteTransaction as deleteTransactionFS,
  subscribeTransactionsByMonth,
  subscribeTransactionsUpTo,
  subscribeTransfersUpTo
} from '../services/firestoreService';

export function useTransactions(year, month) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(null);
  const [txnsUpTo, setTxnsUpTo] = useState(null);
  const [transfersUpTo, setTransfersUpTo] = useState(null);

  const endDateISO = useMemo(
    () => new Date(year, month + 1, 0, 23, 59, 59).toISOString(),
    [year, month]
  );

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setTxnsUpTo([]);
      setTransfersUpTo([]);
      return;
    }

    setTransactions(null);
    setTxnsUpTo(null);
    setTransfersUpTo(null);

    const unsub1 = subscribeTransactionsByMonth(
      user.uid, year, month, setTransactions,
      (e) => console.error('Error loading monthly transactions:', e)
    );

    const unsub2 = subscribeTransactionsUpTo(
      user.uid, endDateISO, setTxnsUpTo,
      (e) => console.error('Error loading transactions for balance:', e)
    );

    const unsub3 = subscribeTransfersUpTo(
      user.uid, endDateISO, setTransfersUpTo,
      (e) => console.error('Error loading transfers for balance:', e)
    );

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user, year, month, endDateISO]);

  const accumulatedBalance = useMemo(() => {
    if (!txnsUpTo || !transfersUpTo) return 0;

    const txBalance = txnsUpTo.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense' && t.creditCardId) return acc;
      return acc - t.amount;
    }, 0);

    const advanceBalance = transfersUpTo
      .filter(t => t.type === 'credit_to_cash' || t.type === 'credit_to_debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return txBalance + advanceBalance;
  }, [txnsUpTo, transfersUpTo]);

  const addTransaction = useCallback(async (transaction) => {
    if (!user) return;
    const dateWithTime = transaction.date + 'T12:00:00';
    return await addTransactionFS(user.uid, {
      ...transaction,
      date: new Date(dateWithTime).toISOString(),
      createdAt: new Date().toISOString()
    });
  }, [user]);

  const updateTransaction = useCallback(async (id, updates) => {
    if (!user) return;
    if (updates.date) {
      const dateWithTime = updates.date + 'T12:00:00';
      updates = { ...updates, date: new Date(dateWithTime).toISOString() };
    }
    return await updateTransactionFS(user.uid, id, updates);
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return;
    return await deleteTransactionFS(user.uid, id);
  }, [user]);

  const summary = useMemo(() => {
    if (!transactions) {
      return { totalIncome: 0, totalExpense: 0, cashExpense: 0, creditCardExpense: 0, cardPayments: 0, balance: 0 };
    }

    return transactions.reduce(
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
    );
  }, [transactions]);

  const categoryData = useMemo(() => {
    if (!transactions) return [];

    return transactions.reduce((acc, t) => {
      if (t.type === 'card_payment') return acc;
      const existing = acc.find(item => item.category === t.category && item.type === t.type);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: t.category, type: t.type, amount: t.amount });
      }
      return acc;
    }, []);
  }, [transactions]);

  return {
    transactions: transactions || [],
    summary,
    categoryData,
    accumulatedBalance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading: transactions === null || txnsUpTo === null || transfersUpTo === null
  };
}

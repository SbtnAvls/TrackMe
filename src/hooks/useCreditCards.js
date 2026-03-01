import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addCreditCard as addCreditCardFS,
  updateCreditCard as updateCreditCardFS,
  deleteCreditCard as deleteCreditCardFS,
  subscribeCreditCards,
  subscribeAllTransactions,
  subscribeTransfers
} from '../services/firestoreService';

export function useCreditCards() {
  const { user } = useAuth();
  const [rawCards, setRawCards] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [allTransfers, setAllTransfers] = useState([]);

  useEffect(() => {
    if (!user) {
      setRawCards([]);
      setAllTransactions([]);
      setAllTransfers([]);
      return;
    }

    const unsub1 = subscribeCreditCards(user.uid, setRawCards);
    const unsub2 = subscribeAllTransactions(user.uid, setAllTransactions);
    const unsub3 = subscribeTransfers(user.uid, setAllTransfers);

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user]);

  const creditCards = useMemo(() => {
    if (!rawCards) return [];

    const cardTransactions = allTransactions.filter(t => t.creditCardId);
    const creditTransfers = allTransfers.filter(t => t.creditCardId);

    return rawCards.map(card => {
      const cardTxns = cardTransactions.filter(t => String(t.creditCardId) === String(card.id));

      const expenses = cardTxns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const payments = cardTxns
        .filter(t => t.type === 'card_payment')
        .reduce((sum, t) => sum + t.amount, 0);

      const advances = creditTransfers
        .filter(t => String(t.creditCardId) === String(card.id))
        .reduce((sum, t) => sum + t.amount, 0);

      const dynamicBalance = (card.currentBalance || 0) + expenses + advances - payments;

      return {
        ...card,
        initialBalance: card.currentBalance || 0,
        expensesTotal: expenses,
        advancesTotal: advances,
        paymentsTotal: payments,
        dynamicBalance: Math.max(0, dynamicBalance)
      };
    });
  }, [rawCards, allTransactions, allTransfers]);

  const addCreditCard = useCallback(async (card) => {
    if (!user) return;
    return await addCreditCardFS(user.uid, {
      ...card,
      currentBalance: card.currentBalance || 0,
      createdAt: new Date().toISOString()
    });
  }, [user]);

  const updateCreditCard = useCallback(async (id, updates) => {
    if (!user) return;
    return await updateCreditCardFS(user.uid, id, updates);
  }, [user]);

  const deleteCreditCard = useCallback(async (id) => {
    if (!user) return;
    return await deleteCreditCardFS(user.uid, id);
  }, [user]);

  const totalDebt = creditCards.reduce((sum, card) => sum + (card.dynamicBalance || 0), 0);
  const totalLimit = creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0);
  const availableCredit = totalLimit - totalDebt;

  return {
    creditCards,
    totalDebt,
    totalLimit,
    availableCredit,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    isLoading: rawCards === null
  };
}

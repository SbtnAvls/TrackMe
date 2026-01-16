import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useCreditCards() {
  // Obtener tarjetas y transacciones asociadas
  const data = useLiveQuery(async () => {
    const cards = await db.creditCards.orderBy('createdAt').reverse().toArray();
    const cardTransactions = await db.transactions
      .where('creditCardId')
      .above(0)
      .toArray();

    // Calcular saldo dinámico para cada tarjeta
    const cardsWithBalance = cards.map(card => {
      const cardTxns = cardTransactions.filter(t => t.creditCardId === card.id);

      // Gastos con esta tarjeta (aumentan deuda)
      const expenses = cardTxns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Pagos a esta tarjeta (reducen deuda)
      const payments = cardTxns
        .filter(t => t.type === 'card_payment')
        .reduce((sum, t) => sum + t.amount, 0);

      // Saldo dinámico = saldo inicial + gastos - pagos
      const dynamicBalance = (card.currentBalance || 0) + expenses - payments;

      return {
        ...card,
        initialBalance: card.currentBalance || 0,
        expensesTotal: expenses,
        paymentsTotal: payments,
        dynamicBalance: Math.max(0, dynamicBalance) // No puede ser negativo
      };
    });

    return cardsWithBalance;
  });

  const creditCards = data || [];

  const addCreditCard = async (card) => {
    return await db.creditCards.add({
      ...card,
      currentBalance: card.currentBalance || 0,
      createdAt: new Date().toISOString()
    });
  };

  const updateCreditCard = async (id, updates) => {
    return await db.creditCards.update(id, updates);
  };

  const deleteCreditCard = async (id) => {
    // También eliminar transacciones asociadas a esta tarjeta
    await db.transactions.where('creditCardId').equals(id).delete();
    return await db.creditCards.delete(id);
  };

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
    isLoading: data === undefined
  };
}

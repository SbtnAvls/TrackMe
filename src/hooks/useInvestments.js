import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addInvestment as addInvestmentFS,
  updateInvestment as updateInvestmentFS,
  deleteInvestment as deleteInvestmentFS,
  subscribeInvestments
} from '../services/firestoreService';

export function useInvestments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setInvestments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return subscribeInvestments(user.uid, (items) => {
      setInvestments(items);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading investments:', error);
      setIsLoading(false);
    });
  }, [user]);

  const addInvestment = useCallback(async (investmentData) => {
    if (!user) return;
    const id = await addInvestmentFS(user.uid, {
      ...investmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return id;
  }, [user]);

  const updateInvestment = useCallback(async (id, investmentData) => {
    if (!user) return;
    await updateInvestmentFS(user.uid, id, {
      ...investmentData,
      updatedAt: new Date().toISOString()
    });
  }, [user]);

  const deleteInvestment = useCallback(async (id) => {
    if (!user) return;
    await deleteInvestmentFS(user.uid, id);
  }, [user]);

  const totals = useMemo(() => {
    const result = investments.reduce((acc, inv) => {
      const invested = inv.quantity * inv.purchasePrice;
      const current = inv.quantity * (inv.currentPrice || inv.purchasePrice);
      const profit = current - invested;

      acc.totalInvested += invested;
      acc.totalCurrent += current;
      acc.totalProfit += profit;

      if (!acc.byType[inv.type]) {
        acc.byType[inv.type] = { invested: 0, current: 0, profit: 0, count: 0 };
      }
      acc.byType[inv.type].invested += invested;
      acc.byType[inv.type].current += current;
      acc.byType[inv.type].profit += profit;
      acc.byType[inv.type].count += 1;

      return acc;
    }, {
      totalInvested: 0,
      totalCurrent: 0,
      totalProfit: 0,
      byType: {}
    });

    result.totalProfitPercent = result.totalInvested > 0
      ? (result.totalProfit / result.totalInvested) * 100
      : 0;

    return result;
  }, [investments]);

  return {
    investments,
    isLoading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    totals
  };
}

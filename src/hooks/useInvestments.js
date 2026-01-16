import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

export function useInvestments() {
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar inversiones
  const loadInvestments = useCallback(async () => {
    try {
      const data = await db.investments.orderBy('createdAt').reverse().toArray();
      setInvestments(data);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  // Agregar inversión
  const addInvestment = useCallback(async (investmentData) => {
    try {
      const newInvestment = {
        ...investmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const id = await db.investments.add(newInvestment);
      await loadInvestments();
      return id;
    } catch (error) {
      console.error('Error adding investment:', error);
      throw error;
    }
  }, [loadInvestments]);

  // Actualizar inversión
  const updateInvestment = useCallback(async (id, investmentData) => {
    try {
      await db.investments.update(id, {
        ...investmentData,
        updatedAt: new Date()
      });
      await loadInvestments();
    } catch (error) {
      console.error('Error updating investment:', error);
      throw error;
    }
  }, [loadInvestments]);

  // Eliminar inversión
  const deleteInvestment = useCallback(async (id) => {
    try {
      await db.investments.delete(id);
      await loadInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  }, [loadInvestments]);

  // Calcular totales
  const totals = investments.reduce((acc, inv) => {
    const invested = inv.quantity * inv.purchasePrice;
    const current = inv.quantity * (inv.currentPrice || inv.purchasePrice);
    const profit = current - invested;
    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

    acc.totalInvested += invested;
    acc.totalCurrent += current;
    acc.totalProfit += profit;

    // Por tipo
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

  totals.totalProfitPercent = totals.totalInvested > 0
    ? (totals.totalProfit / totals.totalInvested) * 100
    : 0;

  return {
    investments,
    isLoading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    totals
  };
}

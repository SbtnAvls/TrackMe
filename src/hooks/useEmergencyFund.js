import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

const SETTINGS_KEY = 'emergencyFund';

const defaultFund = {
  currentAmount: 0,
  targetMonths: 6,
  monthlyExpenseEstimate: 0,
  lastUpdated: null
};

export function useEmergencyFund(averageMonthlyExpense = 0) {
  const [fund, setFund] = useState(defaultFund);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del fondo
  useEffect(() => {
    const loadFund = async () => {
      try {
        const saved = await db.settings.get(SETTINGS_KEY);
        if (saved) {
          setFund({
            currentAmount: saved.currentAmount || 0,
            targetMonths: saved.targetMonths || 6,
            monthlyExpenseEstimate: saved.monthlyExpenseEstimate || 0,
            lastUpdated: saved.lastUpdated || null
          });
        }
      } catch (error) {
        console.error('Error loading emergency fund:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFund();
  }, []);

  // Guardar fondo
  const saveFund = useCallback(async (newFund) => {
    try {
      await db.settings.put({
        key: SETTINGS_KEY,
        ...newFund,
        lastUpdated: new Date()
      });
      setFund({ ...newFund, lastUpdated: new Date() });
    } catch (error) {
      console.error('Error saving emergency fund:', error);
    }
  }, []);

  // Actualizar monto actual
  const updateAmount = useCallback((amount) => {
    saveFund({ ...fund, currentAmount: amount });
  }, [fund, saveFund]);

  // Actualizar meses objetivo
  const updateTargetMonths = useCallback((months) => {
    saveFund({ ...fund, targetMonths: months });
  }, [fund, saveFund]);

  // Actualizar estimación de gastos mensuales
  const updateMonthlyExpense = useCallback((amount) => {
    saveFund({ ...fund, monthlyExpenseEstimate: amount });
  }, [fund, saveFund]);

  // Agregar dinero al fondo
  const addToFund = useCallback((amount) => {
    saveFund({ ...fund, currentAmount: fund.currentAmount + amount });
  }, [fund, saveFund]);

  // Retirar dinero del fondo
  const withdrawFromFund = useCallback((amount) => {
    const newAmount = Math.max(0, fund.currentAmount - amount);
    saveFund({ ...fund, currentAmount: newAmount });
  }, [fund, saveFund]);

  // Calcular métricas
  const monthlyExpense = fund.monthlyExpenseEstimate || averageMonthlyExpense || 0;
  const targetAmount = monthlyExpense * fund.targetMonths;
  const progress = targetAmount > 0 ? (fund.currentAmount / targetAmount) * 100 : 0;
  const monthsCovered = monthlyExpense > 0 ? fund.currentAmount / monthlyExpense : 0;
  const amountNeeded = Math.max(0, targetAmount - fund.currentAmount);

  // Determinar estado del fondo
  const getStatus = () => {
    if (progress >= 100) return { level: 'excellent', label: 'Excelente', color: 'emerald' };
    if (progress >= 75) return { level: 'good', label: 'Muy bien', color: 'green' };
    if (progress >= 50) return { level: 'fair', label: 'En progreso', color: 'yellow' };
    if (progress >= 25) return { level: 'building', label: 'Construyendo', color: 'orange' };
    return { level: 'starting', label: 'Iniciando', color: 'red' };
  };

  return {
    fund,
    isLoading,
    saveFund,
    updateAmount,
    updateTargetMonths,
    updateMonthlyExpense,
    addToFund,
    withdrawFromFund,
    // Métricas calculadas
    targetAmount,
    progress: Math.min(100, progress),
    monthsCovered,
    amountNeeded,
    status: getStatus()
  };
}

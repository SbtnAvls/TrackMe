import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { putSetting, subscribeSetting } from '../services/firestoreService';

const SETTINGS_KEY = 'emergencyFund';

const defaultFund = {
  currentAmount: 0,
  targetMonths: 6,
  monthlyExpenseEstimate: 0,
  lastUpdated: null
};

export function useEmergencyFund(averageMonthlyExpense = 0) {
  const { user } = useAuth();
  const [fund, setFund] = useState(defaultFund);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFund(defaultFund);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return subscribeSetting(user.uid, SETTINGS_KEY, (data) => {
      if (data) {
        setFund({
          currentAmount: data.currentAmount || 0,
          targetMonths: data.targetMonths || 6,
          monthlyExpenseEstimate: data.monthlyExpenseEstimate || 0,
          lastUpdated: data.lastUpdated || null
        });
      } else {
        setFund(defaultFund);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading emergency fund:', error);
      setIsLoading(false);
    });
  }, [user]);

  const saveFund = useCallback(async (newFund) => {
    if (!user) return;
    try {
      await putSetting(user.uid, SETTINGS_KEY, {
        ...newFund,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving emergency fund:', error);
    }
  }, [user]);

  const updateAmount = useCallback((amount) => {
    saveFund({ ...fund, currentAmount: amount });
  }, [fund, saveFund]);

  const updateTargetMonths = useCallback((months) => {
    saveFund({ ...fund, targetMonths: months });
  }, [fund, saveFund]);

  const updateMonthlyExpense = useCallback((amount) => {
    saveFund({ ...fund, monthlyExpenseEstimate: amount });
  }, [fund, saveFund]);

  const addToFund = useCallback((amount) => {
    saveFund({ ...fund, currentAmount: fund.currentAmount + amount });
  }, [fund, saveFund]);

  const withdrawFromFund = useCallback((amount) => {
    const newAmount = Math.max(0, fund.currentAmount - amount);
    saveFund({ ...fund, currentAmount: newAmount });
  }, [fund, saveFund]);

  const monthlyExpense = fund.monthlyExpenseEstimate || averageMonthlyExpense || 0;
  const targetAmount = monthlyExpense * fund.targetMonths;
  const progress = targetAmount > 0 ? (fund.currentAmount / targetAmount) * 100 : 0;
  const monthsCovered = monthlyExpense > 0 ? fund.currentAmount / monthlyExpense : 0;
  const amountNeeded = Math.max(0, targetAmount - fund.currentAmount);

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
    targetAmount,
    progress: Math.min(100, progress),
    monthsCovered,
    amountNeeded,
    status: getStatus()
  };
}

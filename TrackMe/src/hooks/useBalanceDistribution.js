import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

const SETTINGS_KEY = 'balanceDistribution';

const defaultDistribution = {
  cash: 0,
  savings: 0
};

export function useBalanceDistribution() {
  const [distribution, setDistribution] = useState(defaultDistribution);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar distribución guardada
  useEffect(() => {
    const loadDistribution = async () => {
      try {
        const saved = await db.settings.get(SETTINGS_KEY);
        if (saved) {
          setDistribution({
            cash: saved.cash || 0,
            savings: saved.savings || 0
          });
        }
      } catch (error) {
        console.error('Error loading balance distribution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDistribution();
  }, []);

  // Guardar distribución
  const saveDistribution = useCallback(async (newDistribution) => {
    try {
      await db.settings.put({
        key: SETTINGS_KEY,
        cash: newDistribution.cash,
        savings: newDistribution.savings,
        updatedAt: new Date()
      });
      setDistribution(newDistribution);
    } catch (error) {
      console.error('Error saving balance distribution:', error);
    }
  }, []);

  // Actualizar solo efectivo
  const updateCash = useCallback((amount) => {
    const newDist = { ...distribution, cash: amount };
    saveDistribution(newDist);
  }, [distribution, saveDistribution]);

  // Actualizar solo ahorros
  const updateSavings = useCallback((amount) => {
    const newDist = { ...distribution, savings: amount };
    saveDistribution(newDist);
  }, [distribution, saveDistribution]);

  return {
    distribution,
    isLoading,
    saveDistribution,
    updateCash,
    updateSavings
  };
}

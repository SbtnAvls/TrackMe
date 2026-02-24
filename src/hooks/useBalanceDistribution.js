import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

const SETTINGS_KEY = 'balanceDistribution';

export function useBalanceDistribution() {
  const [distribution, setDistribution] = useState({ cash: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDistribution = async () => {
      try {
        const saved = await db.settings.get(SETTINGS_KEY);
        if (saved) {
          setDistribution({ cash: saved.cash || 0 });
        }
      } catch (error) {
        console.error('Error loading balance distribution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDistribution();
  }, []);

  // Override manual del efectivo
  const updateCash = useCallback(async (amount) => {
    try {
      await db.settings.put({
        key: SETTINGS_KEY,
        cash: amount,
        updatedAt: new Date()
      });
      setDistribution({ cash: amount });
    } catch (error) {
      console.error('Error updating cash:', error);
    }
  }, []);

  // Ajuste por delta (lee de DB para evitar race conditions)
  const adjustCash = useCallback(async (delta) => {
    try {
      const saved = await db.settings.get(SETTINGS_KEY);
      const current = saved?.cash || 0;
      const newCash = current + delta;
      await db.settings.put({
        key: SETTINGS_KEY,
        cash: newCash,
        updatedAt: new Date()
      });
      setDistribution({ cash: newCash });
    } catch (error) {
      console.error('Error adjusting cash:', error);
    }
  }, []);

  return {
    distribution,
    isLoading,
    updateCash,
    adjustCash
  };
}

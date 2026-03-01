import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSetting, putSetting, subscribeSetting } from '../services/firestoreService';

const SETTINGS_KEY = 'balanceDistribution';

export function useBalanceDistribution() {
  const { user } = useAuth();
  const [distribution, setDistribution] = useState({ cash: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDistribution({ cash: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return subscribeSetting(user.uid, SETTINGS_KEY, (data) => {
      setDistribution({ cash: data?.cash || 0 });
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading balance distribution:', error);
      setIsLoading(false);
    });
  }, [user]);

  const updateCash = useCallback(async (amount) => {
    if (!user) return;
    try {
      await putSetting(user.uid, SETTINGS_KEY, {
        cash: amount,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating cash:', error);
    }
  }, [user]);

  const adjustCash = useCallback(async (delta) => {
    if (!user) return;
    try {
      const saved = await getSetting(user.uid, SETTINGS_KEY);
      const current = saved?.cash || 0;
      const newCash = current + delta;
      await putSetting(user.uid, SETTINGS_KEY, {
        cash: newCash,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adjusting cash:', error);
    }
  }, [user]);

  return {
    distribution,
    isLoading,
    updateCash,
    adjustCash
  };
}

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addTransfer as addTransferFS,
  deleteTransfer as deleteTransferFS,
  subscribeTransfers
} from '../services/firestoreService';

export function useTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransfers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return subscribeTransfers(user.uid, (items) => {
      setTransfers(items);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading transfers:', error);
      setIsLoading(false);
    });
  }, [user]);

  const addTransfer = useCallback(async (transferData) => {
    if (!user) return;
    const dateWithTime = transferData.date
      ? transferData.date + 'T12:00:00'
      : new Date().toISOString();
    const id = await addTransferFS(user.uid, {
      type: transferData.type,
      amount: transferData.amount,
      description: transferData.description || '',
      creditCardId: transferData.creditCardId || null,
      date: new Date(dateWithTime).toISOString(),
      createdAt: new Date().toISOString()
    });
    return id;
  }, [user]);

  const deleteTransfer = useCallback(async (id) => {
    if (!user) return;
    await deleteTransferFS(user.uid, id);
  }, [user]);

  const getTransfersByMonth = useCallback((year, month) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    return transfers.filter(t => {
      const d = new Date(t.date);
      return d >= startDate && d <= endDate;
    });
  }, [transfers]);

  return {
    transfers,
    addTransfer,
    deleteTransfer,
    getTransfersByMonth,
    isLoading
  };
}

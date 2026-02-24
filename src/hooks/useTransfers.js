import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

export function useTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await db.transfers.orderBy('date').reverse().toArray();
      setTransfers(data);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTransfer = useCallback(async (transferData) => {
    try {
      const dateWithTime = transferData.date
        ? transferData.date + 'T12:00:00'
        : new Date().toISOString();
      const id = await db.transfers.add({
        type: transferData.type,
        amount: transferData.amount,
        description: transferData.description || '',
        creditCardId: transferData.creditCardId || null,
        date: new Date(dateWithTime).toISOString(),
        createdAt: new Date().toISOString()
      });
      await loadData();
      return id;
    } catch (error) {
      console.error('Error adding transfer:', error);
      throw error;
    }
  }, [loadData]);

  const deleteTransfer = useCallback(async (id) => {
    try {
      await db.transfers.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting transfer:', error);
      throw error;
    }
  }, [loadData]);

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

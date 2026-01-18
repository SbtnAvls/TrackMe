import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

export function usePockets() {
  const [pockets, setPockets] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar bolsillos y movimientos
  const loadData = useCallback(async () => {
    try {
      const pocketsData = await db.pockets.orderBy('createdAt').reverse().toArray();
      const movementsData = await db.pocketMovements.orderBy('date').reverse().toArray();

      // Calcular el monto actual de cada bolsillo basado en movimientos
      const pocketsWithBalance = pocketsData.map(pocket => {
        const pocketMovements = movementsData.filter(m => m.pocketId === pocket.id);
        const currentAmount = pocketMovements.reduce((sum, m) => {
          return m.type === 'deposit' ? sum + m.amount : sum - m.amount;
        }, 0);
        return { ...pocket, currentAmount };
      });

      setPockets(pocketsWithBalance);
      setMovements(movementsData);
    } catch (error) {
      console.error('Error loading pockets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Crear bolsillo
  const addPocket = useCallback(async (pocketData) => {
    try {
      const newPocket = {
        ...pocketData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const id = await db.pockets.add(newPocket);

      // Si hay monto inicial, crear movimiento de depósito
      if (pocketData.initialAmount > 0) {
        await db.pocketMovements.add({
          pocketId: id,
          type: 'deposit',
          amount: pocketData.initialAmount,
          description: 'Monto inicial',
          date: new Date(),
          createdAt: new Date()
        });
      }

      await loadData();
      return id;
    } catch (error) {
      console.error('Error adding pocket:', error);
      throw error;
    }
  }, [loadData]);

  // Actualizar bolsillo
  const updatePocket = useCallback(async (id, pocketData) => {
    try {
      await db.pockets.update(id, {
        ...pocketData,
        updatedAt: new Date()
      });
      await loadData();
    } catch (error) {
      console.error('Error updating pocket:', error);
      throw error;
    }
  }, [loadData]);

  // Eliminar bolsillo
  const deletePocket = useCallback(async (id) => {
    try {
      // Eliminar movimientos asociados
      await db.pocketMovements.where('pocketId').equals(id).delete();
      // Eliminar bolsillo
      await db.pockets.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting pocket:', error);
      throw error;
    }
  }, [loadData]);

  // Agregar dinero a un bolsillo
  const depositToPocket = useCallback(async (pocketId, amount, description = '') => {
    try {
      await db.pocketMovements.add({
        pocketId,
        type: 'deposit',
        amount,
        description,
        date: new Date(),
        createdAt: new Date()
      });
      await loadData();
    } catch (error) {
      console.error('Error depositing to pocket:', error);
      throw error;
    }
  }, [loadData]);

  // Retirar dinero de un bolsillo
  const withdrawFromPocket = useCallback(async (pocketId, amount, description = '') => {
    try {
      await db.pocketMovements.add({
        pocketId,
        type: 'withdraw',
        amount,
        description,
        date: new Date(),
        createdAt: new Date()
      });
      await loadData();
    } catch (error) {
      console.error('Error withdrawing from pocket:', error);
      throw error;
    }
  }, [loadData]);

  // Obtener movimientos de un bolsillo específico
  const getPocketMovements = useCallback((pocketId) => {
    return movements.filter(m => m.pocketId === pocketId);
  }, [movements]);

  // Calcular totales
  const totals = pockets.reduce((acc, pocket) => {
    acc.totalSaved += pocket.currentAmount;
    acc.totalTarget += pocket.targetAmount || 0;
    return acc;
  }, { totalSaved: 0, totalTarget: 0 });

  totals.overallProgress = totals.totalTarget > 0
    ? (totals.totalSaved / totals.totalTarget) * 100
    : 0;

  return {
    pockets,
    movements,
    isLoading,
    addPocket,
    updatePocket,
    deletePocket,
    depositToPocket,
    withdrawFromPocket,
    getPocketMovements,
    totals
  };
}

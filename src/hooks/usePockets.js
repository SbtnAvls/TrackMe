import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addPocket as addPocketFS,
  updatePocket as updatePocketFS,
  deletePocket as deletePocketFS,
  subscribePockets,
  addPocketMovement,
  subscribePocketMovements
} from '../services/firestoreService';

export function usePockets() {
  const { user } = useAuth();
  const [rawPockets, setRawPockets] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRawPockets([]);
      setMovements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let pocketsLoaded = false;
    let movementsLoaded = false;

    const checkLoaded = () => {
      if (pocketsLoaded && movementsLoaded) setIsLoading(false);
    };

    const unsub1 = subscribePockets(user.uid, (items) => {
      setRawPockets(items);
      pocketsLoaded = true;
      checkLoaded();
    }, (error) => {
      console.error('Error loading pockets:', error);
      pocketsLoaded = true;
      checkLoaded();
    });

    const unsub2 = subscribePocketMovements(user.uid, (items) => {
      setMovements(items);
      movementsLoaded = true;
      checkLoaded();
    }, (error) => {
      console.error('Error loading pocket movements:', error);
      movementsLoaded = true;
      checkLoaded();
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  const pockets = useMemo(() => {
    return rawPockets.map(pocket => {
      const pocketMovements = movements.filter(m => String(m.pocketId) === String(pocket.id));
      const currentAmount = pocketMovements.reduce((sum, m) => {
        return m.type === 'deposit' ? sum + m.amount : sum - m.amount;
      }, 0);
      return { ...pocket, currentAmount };
    });
  }, [rawPockets, movements]);

  const addPocket = useCallback(async (pocketData) => {
    if (!user) return;
    const id = await addPocketFS(user.uid, {
      ...pocketData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (pocketData.initialAmount > 0) {
      await addPocketMovement(user.uid, {
        pocketId: id,
        type: 'deposit',
        amount: pocketData.initialAmount,
        description: 'Monto inicial',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    return id;
  }, [user]);

  const updatePocket = useCallback(async (id, pocketData) => {
    if (!user) return;
    await updatePocketFS(user.uid, id, {
      ...pocketData,
      updatedAt: new Date().toISOString()
    });
  }, [user]);

  const deletePocket = useCallback(async (id) => {
    if (!user) return;
    await deletePocketFS(user.uid, id);
  }, [user]);

  const depositToPocket = useCallback(async (pocketId, amount, description = '') => {
    if (!user) return;
    await addPocketMovement(user.uid, {
      pocketId,
      type: 'deposit',
      amount,
      description,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  }, [user]);

  const withdrawFromPocket = useCallback(async (pocketId, amount, description = '') => {
    if (!user) return;
    await addPocketMovement(user.uid, {
      pocketId,
      type: 'withdraw',
      amount,
      description,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  }, [user]);

  const getPocketMovements = useCallback((pocketId) => {
    return movements.filter(m => String(m.pocketId) === String(pocketId));
  }, [movements]);

  const totals = useMemo(() => {
    const result = pockets.reduce((acc, pocket) => {
      acc.totalSaved += pocket.currentAmount;
      acc.totalTarget += pocket.targetAmount || 0;
      return acc;
    }, { totalSaved: 0, totalTarget: 0 });

    result.overallProgress = result.totalTarget > 0
      ? (result.totalSaved / result.totalTarget) * 100
      : 0;

    return result;
  }, [pockets]);

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

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  cloudHasData,
  getLocalDataSnapshot,
  getLocalDataSummary,
  uploadSnapshotToCloud
} from '../services/cloudSyncService';
import { db } from '../db/database';

const SyncContext = createContext({
  hasLegacyData: false,
  isMigrating: false,
  error: null,
  migrateData: async () => {}
});

export function SyncProvider({ children }) {
  const { user } = useAuth();
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setHasLegacyData(false);
      return;
    }

    let cancelled = false;

    const checkLegacy = async () => {
      try {
        const summary = await getLocalDataSummary();
        if (!cancelled) setHasLegacyData(summary.total > 0);
      } catch (e) {
        console.error('Error checking legacy data:', e);
        if (!cancelled) setHasLegacyData(false);
      }
    };

    checkLegacy();

    return () => { cancelled = true; };
  }, [user]);

  const migrateData = useCallback(async () => {
    if (!user || isMigrating) return;

    setIsMigrating(true);
    setError(null);

    try {
      const hasCloud = await cloudHasData(user.uid);

      if (!hasCloud) {
        const snapshot = await getLocalDataSnapshot();
        await uploadSnapshotToCloud(user.uid, snapshot);
      }

      // Clear all Dexie tables
      await Promise.all([
        db.transactions.clear(),
        db.creditCards.clear(),
        db.investments.clear(),
        db.pockets.clear(),
        db.pocketMovements.clear(),
        db.settings.clear(),
        db.transfers.clear()
      ]);

      setHasLegacyData(false);
    } catch (e) {
      console.error('Error migrating data:', e);
      setError(e);
    } finally {
      setIsMigrating(false);
    }
  }, [user, isMigrating]);

  return (
    <SyncContext.Provider value={{ hasLegacyData, isMigrating, error, migrateData }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}

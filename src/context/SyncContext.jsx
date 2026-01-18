import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  cloudHasData,
  fetchCloudData,
  getLocalDataSnapshot,
  getLocalDataSummary,
  replaceLocalData,
  trackLocalChanges,
  uploadSnapshotToCloud
} from '../services/cloudSyncService';

const initialState = {
  status: 'idle',
  hasLocalData: false,
  hasCloudData: false,
  needsMigration: false,
  isSyncing: false,
  isRestoring: false,
  pendingChanges: false,
  lastSync: null,
  error: null
};

const SyncContext = createContext({
  ...initialState,
  migrateLocalToCloud: async () => {},
  syncNow: async () => {},
  restoreFromCloud: async () => {}
});

export function SyncProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(() => ({ ...initialState }));
  const changeUnsubRef = useRef(null);
  const trackingEnabledRef = useRef(false);
  const autoSyncTimeoutRef = useRef(null);

  const resetState = useCallback(() => {
    setState(() => ({ ...initialState }));
    trackingEnabledRef.current = false;
    if (changeUnsubRef.current) {
      changeUnsubRef.current();
      changeUnsubRef.current = null;
    }
    if (autoSyncTimeoutRef.current) {
      clearTimeout(autoSyncTimeoutRef.current);
      autoSyncTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      resetState();
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      setState((prev) => ({ ...prev, status: 'checking', error: null }));

      try {
        const [localSummary, hasCloud] = await Promise.all([
          getLocalDataSummary(),
          cloudHasData(user.uid)
        ]);

        if (cancelled) return;

        const localHasData = localSummary.total > 0;

        if (hasCloud) {
          trackingEnabledRef.current = false;
          const cloudData = await fetchCloudData(user.uid);
          if (cancelled) return;
          await replaceLocalData(cloudData);
          if (cancelled) return;
          trackingEnabledRef.current = true;
          const newSummary = await getLocalDataSummary();

          setState((prev) => ({
            ...prev,
            status: 'ready',
            hasCloudData: true,
            hasLocalData: newSummary.total > 0,
            needsMigration: false,
            pendingChanges: false,
            lastSync: new Date(),
            error: null
          }));
        } else {
          trackingEnabledRef.current = true;
          setState((prev) => ({
            ...prev,
            status: 'ready',
            hasCloudData: false,
            hasLocalData: localHasData,
            needsMigration: localHasData,
            pendingChanges: false,
            lastSync: null,
            error: null
          }));
        }

        if (changeUnsubRef.current) {
          changeUnsubRef.current();
        }

        changeUnsubRef.current = trackLocalChanges(() => {
          if (!trackingEnabledRef.current) return;
          setState((prev) => ({
            ...prev,
            hasLocalData: true,
            pendingChanges: true
          }));
        });
      } catch (error) {
        console.error('Error initializing sync:', error);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          status: 'error',
          error
        }));
      }
    };

    initialize();

    return () => {
      cancelled = true;
      resetState();
    };
  }, [user, resetState]);

  const performCloudUpload = useCallback(async () => {
    if (!user) return;
    setState((prev) => ({
      ...prev,
      isSyncing: true,
      error: null
    }));

    try {
      const snapshot = await getLocalDataSnapshot();
      await uploadSnapshotToCloud(user.uid, snapshot);
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        pendingChanges: false,
        hasCloudData: true,
        needsMigration: false,
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error syncing data:', error);
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error
      }));
      throw error;
    }
  }, [user]);

  const restoreFromCloud = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({
      ...prev,
      isRestoring: true,
      error: null
    }));

    trackingEnabledRef.current = false;

    try {
      const data = await fetchCloudData(user.uid);
      await replaceLocalData(data);
      setState((prev) => ({
        ...prev,
        isRestoring: false,
        hasCloudData: true,
        hasLocalData: true,
        pendingChanges: false,
        lastSync: new Date(),
        error: null
      }));
    } catch (error) {
      console.error('Error restoring cloud data:', error);
      setState((prev) => ({
        ...prev,
        isRestoring: false,
        error
      }));
      throw error;
    } finally {
      trackingEnabledRef.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (autoSyncTimeoutRef.current) {
      clearTimeout(autoSyncTimeoutRef.current);
      autoSyncTimeoutRef.current = null;
    }

    if (
      !user ||
      !state.pendingChanges ||
      !state.hasCloudData ||
      state.isSyncing
    ) {
      return undefined;
    }

    autoSyncTimeoutRef.current = setTimeout(() => {
      performCloudUpload().catch(() => {});
      autoSyncTimeoutRef.current = null;
    }, 2000);

    return () => {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
        autoSyncTimeoutRef.current = null;
      }
    };
  }, [user, state.pendingChanges, state.hasCloudData, state.isSyncing, performCloudUpload]);

  const value = {
    ...state,
    migrateLocalToCloud: performCloudUpload,
    syncNow: performCloudUpload,
    restoreFromCloud
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}

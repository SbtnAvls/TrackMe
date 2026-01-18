import { motion } from 'framer-motion';
import { CloudUpload, RefreshCw, CheckCircle, AlertCircle, CloudDownload } from 'lucide-react';
import { useMemo } from 'react';
import { useSync } from '../../context/SyncContext';

function formatDate(date) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch {
    return date.toString();
  }
}

export default function DataSyncBanner() {
  const {
    needsMigration,
    hasCloudData,
    isSyncing,
    isRestoring,
    pendingChanges,
    lastSync,
    error,
    migrateLocalToCloud,
    syncNow,
    restoreFromCloud
  } = useSync();

  const shouldRender = needsMigration || hasCloudData || isSyncing || isRestoring || error;

  const statusLabel = useMemo(() => {
    if (isRestoring) return 'Restaurando datos desde la nube...';
    if (isSyncing) return 'Sincronizando tus datos con Firebase...';
    if (pendingChanges) return 'Hay cambios pendientes, se sincronizarán automáticamente.';
    if (lastSync) return `Última sincronización: ${formatDate(lastSync)}`;
    if (hasCloudData) return 'Sincronización en la nube activa.';
    return '';
  }, [hasCloudData, isRestoring, isSyncing, lastSync, pendingChanges]);

  if (!shouldRender) return null;

  const handlePrimaryAction = async () => {
    if (needsMigration) {
      await migrateLocalToCloud();
    } else {
      await syncNow();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-4 border border-white/10 flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          {needsMigration ? (
            <CloudUpload className="w-5 h-5 text-amber-400" />
          ) : pendingChanges ? (
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          )}
          {needsMigration ? 'Respalda tus datos locales' : 'Sincronización con Firebase'}
        </div>

        <p className="text-sm text-zinc-400">
          {needsMigration
            ? 'Detectamos datos guardados en este navegador que aún no están en la nube. Súbelos a Firebase para usarlos en cualquier dispositivo.'
            : 'Todos tus movimientos se guardan automáticamente en Firebase para que puedas usarlos con cualquier cuenta o dispositivo.'}
        </p>

        {statusLabel && (
          <p className="text-xs text-zinc-500">
            {statusLabel}
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            {error.message || 'No pudimos sincronizar los datos. Intenta nuevamente.'}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handlePrimaryAction}
          disabled={isSyncing || isRestoring}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSyncing || isRestoring ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : needsMigration ? (
            <CloudUpload className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {needsMigration ? 'Migrar datos a Firebase' : 'Sincronizar ahora'}
        </button>

        {hasCloudData && !needsMigration && (
          <button
            onClick={restoreFromCloud}
            disabled={isSyncing || isRestoring}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CloudDownload className="w-4 h-4" />
            Restaurar desde la nube
          </button>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { CloudUpload, RefreshCw, AlertCircle } from 'lucide-react';
import { useSync } from '../../context/SyncContext';

export default function DataSyncBanner() {
  const { hasLegacyData, isMigrating, error, migrateData } = useSync();

  if (!hasLegacyData && !isMigrating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-4 border border-amber-500/20 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <CloudUpload className="w-5 h-5 text-amber-400" />
        Datos locales encontrados
      </div>

      <p className="text-sm text-zinc-400">
        Detectamos datos guardados en este navegador que aún no están en Firebase.
        Migra tus datos para acceder desde cualquier dispositivo.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          {error.message || 'Error al migrar los datos. Intenta nuevamente.'}
        </div>
      )}

      <button
        onClick={migrateData}
        disabled={isMigrating}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed w-fit"
      >
        {isMigrating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <CloudUpload className="w-4 h-4" />
        )}
        {isMigrating ? 'Migrando datos...' : 'Migrar datos a Firebase'}
      </button>
    </motion.div>
  );
}

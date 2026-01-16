import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../../utils/exportData';

export default function ExportButton({ transactions, year, month }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(transactions, year, month);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(transactions, year, month);
    setIsOpen(false);
  };

  if (transactions.length === 0) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-zinc-300 hover:text-white transition-colors group"
      >
        <Download className="w-4 h-4 group-hover:text-violet-400 transition-colors" />
        <span className="text-sm font-medium">Exportar</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-52 glass rounded-xl z-20 overflow-hidden border border-white/10"
            >
              <div className="p-2">
                <motion.button
                  onClick={handleExportExcel}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Excel</p>
                    <p className="text-xs text-zinc-500">.xlsx</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={handleExportCSV}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">CSV</p>
                    <p className="text-xs text-zinc-500">.csv</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

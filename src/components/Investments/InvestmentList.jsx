import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Filter, Inbox, PieChart, Wallet } from 'lucide-react';
import InvestmentItem from './InvestmentItem';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';
import { INVESTMENT_TYPES } from '../../db/database';

const filterOptions = [
  { id: 'all', label: 'Todas' },
  { id: 'crypto', label: 'Cripto' },
  { id: 'stock', label: 'Acciones' },
  { id: 'etf', label: 'ETF' },
  { id: 'cdt', label: 'CDT' },
  { id: 'forex', label: 'Divisas' },
  { id: 'other', label: 'Otras' }
];

export default function InvestmentList({ investments, totals, onEdit, onDelete, onUpdatePrice }) {
  const { isHidden } = usePrivacy();
  const [filterType, setFilterType] = useState('all');

  const filteredInvestments = investments.filter((inv) => {
    if (filterType === 'all') return true;
    if (filterType === 'other') {
      return ['commodity', 'stablecoin', 'bond', 'real_estate', 'other'].includes(inv.type);
    }
    return inv.type === filterType;
  });

  const isProfit = totals.totalProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Total invertido</span>
            <Wallet className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-xl font-bold text-white">
            {isHidden ? '••••••' : formatCurrency(totals.totalInvested)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Valor actual</span>
            <PieChart className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-400">
            {isHidden ? '••••••' : formatCurrency(totals.totalCurrent)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Ganancia/Pérdida</span>
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className={`text-xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {isHidden ? '••••••' : `${isProfit ? '+' : ''}${formatCurrency(totals.totalProfit)}`}
          </p>
          <p className={`text-xs ${isProfit ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {isHidden ? '••' : `${isProfit ? '+' : ''}${totals.totalProfitPercent.toFixed(2)}%`}
          </p>
        </motion.div>
      </div>

      {/* Type Distribution */}
      {Object.keys(totals.byType).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4"
        >
          <h4 className="text-sm font-medium text-zinc-400 mb-3">Distribución por tipo</h4>
          <div className="space-y-2">
            {Object.entries(totals.byType)
              .sort((a, b) => b[1].current - a[1].current)
              .map(([typeId, data]) => {
                const typeInfo = INVESTMENT_TYPES.find(t => t.id === typeId);
                const percentage = totals.totalCurrent > 0
                  ? (data.current / totals.totalCurrent) * 100
                  : 0;
                const typeProfit = data.current - data.invested;
                const isTypeProfit = typeProfit >= 0;

                return (
                  <div key={typeId} className="flex items-center gap-3">
                    <div className="w-24 truncate">
                      <span className="text-xs text-zinc-400">{typeInfo?.label || typeId}</span>
                    </div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`h-full rounded-full ${
                          typeId === 'crypto' ? 'bg-orange-500' :
                          typeId === 'stock' ? 'bg-blue-500' :
                          typeId === 'etf' ? 'bg-emerald-500' :
                          typeId === 'cdt' ? 'bg-violet-500' :
                          typeId === 'forex' ? 'bg-green-500' :
                          'bg-zinc-500'
                        }`}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-xs text-white">
                        {isHidden ? '••••' : formatCurrency(data.current)}
                      </span>
                    </div>
                    <div className="w-16 text-right">
                      <span className={`text-xs ${isTypeProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isHidden ? '••' : `${isTypeProfit ? '+' : ''}${((typeProfit / data.invested) * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Investments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Mis inversiones</h3>
              <p className="text-xs text-zinc-500">{filteredInvestments.length} activos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 overflow-x-auto">
              {filterOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setFilterType(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    filterType === option.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-500 hover:text-white border border-transparent'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredInvestments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4"
              >
                <Inbox className="w-10 h-10 text-zinc-600" />
              </motion.div>
              <p className="text-zinc-400 font-medium">No hay inversiones</p>
              <p className="text-sm text-zinc-600">Agrega tu primera inversión</p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              {filteredInvestments.map((investment, index) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <InvestmentItem
                    investment={investment}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdatePrice={onUpdatePrice}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

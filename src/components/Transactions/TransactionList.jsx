import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Inbox } from 'lucide-react';
import TransactionItem from './TransactionItem';

const filterOptions = [
  { id: 'all', label: 'Todos', color: 'violet' },
  { id: 'income', label: 'Ingresos', color: 'emerald' },
  { id: 'expense', label: 'Gastos', color: 'red' },
  { id: 'card_expense', label: 'Deuda', color: 'orange' },
  { id: 'card_payment', label: 'Pagos', color: 'blue' },
];

export default function TransactionList({ transactions, onEdit, onDelete, creditCards = [] }) {
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'card_expense') return t.type === 'expense' && t.creditCardId;
    return t.type === filterType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Transacciones</h3>
            <p className="text-xs text-zinc-500">{filteredTransactions.length} registros</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <div className="flex gap-1 p-1 rounded-xl bg-white/5">
            {filterOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setFilterType(option.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filterType === option.id
                    ? option.color === 'violet'
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : option.color === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : option.color === 'red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : option.color === 'orange'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
        {filteredTransactions.length === 0 ? (
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
            <p className="text-zinc-400 font-medium">No hay transacciones</p>
            <p className="text-sm text-zinc-600">en este período</p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <TransactionItem
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  creditCards={creditCards}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

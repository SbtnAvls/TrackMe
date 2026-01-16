import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check, X, Edit2, Trash2, Calendar, Target, TrendingUp, History, ChevronDown, ChevronUp, Wallet, Shield, Plane, Car, Home, GraduationCap, Smartphone, Heart, Gift, PartyPopper, Palmtree, Briefcase } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';
import { POCKET_CATEGORIES } from '../../db/database';

const iconMap = {
  Shield,
  Plane,
  Car,
  Home,
  GraduationCap,
  Smartphone,
  Heart,
  Gift,
  PartyPopper,
  Palmtree,
  Briefcase,
  Wallet
};

const colorClasses = {
  red: { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  blue: { bg: 'from-blue-500/20 to-sky-500/20', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  slate: { bg: 'from-slate-500/20 to-gray-500/20', border: 'border-slate-500/30', text: 'text-slate-400', bar: 'bg-slate-500' },
  amber: { bg: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' },
  indigo: { bg: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  cyan: { bg: 'from-cyan-500/20 to-teal-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  pink: { bg: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', text: 'text-pink-400', bar: 'bg-pink-500' },
  purple: { bg: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500' },
  orange: { bg: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
  emerald: { bg: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  zinc: { bg: 'from-zinc-500/20 to-gray-500/20', border: 'border-zinc-500/30', text: 'text-zinc-400', bar: 'bg-zinc-500' },
  violet: { bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', text: 'text-violet-400', bar: 'bg-violet-500' }
};

export default function PocketItem({
  pocket,
  movements,
  onDeposit,
  onWithdraw,
  onEdit,
  onDelete
}) {
  const { isHidden } = usePrivacy();
  const [actionType, setActionType] = useState(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const category = POCKET_CATEGORIES.find(c => c.id === pocket.category) || POCKET_CATEGORIES.find(c => c.id === 'other');
  const Icon = iconMap[category?.icon] || Wallet;
  const colors = colorClasses[category?.color] || colorClasses.violet;

  const progress = pocket.targetAmount > 0
    ? Math.min(100, (pocket.currentAmount / pocket.targetAmount) * 100)
    : 0;

  const amountNeeded = Math.max(0, (pocket.targetAmount || 0) - pocket.currentAmount);

  const getDaysRemaining = () => {
    if (!pocket.deadline) return null;
    const deadline = new Date(pocket.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const handleAction = () => {
    const amount = parseFloat(actionAmount);
    if (amount > 0) {
      if (actionType === 'deposit') {
        onDeposit(pocket.id, amount, actionDescription);
      } else {
        onWithdraw(pocket.id, amount, actionDescription);
      }
      setActionAmount('');
      setActionDescription('');
      setActionType(null);
    }
  };

  const pocketMovements = movements.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`glass rounded-2xl overflow-hidden border ${colors.border}`}
    >
      {/* Header */}
      <div className={`p-5 bg-gradient-to-br ${colors.bg}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}
            >
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </motion.div>
            <div>
              <h3 className="font-bold text-white text-lg">{pocket.name}</h3>
              <p className={`text-sm ${colors.text}`}>{category.label}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <motion.button
              onClick={() => onEdit(pocket)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onDelete(pocket.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-sm text-zinc-400 mb-1">Ahorrado</p>
          <p className="text-3xl font-bold text-white">
            {isHidden ? '••••••' : formatCurrency(pocket.currentAmount)}
          </p>
          {pocket.targetAmount > 0 && (
            <p className="text-sm text-zinc-500">
              de {isHidden ? '••••••' : formatCurrency(pocket.targetAmount)}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {pocket.targetAmount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progreso</span>
              <span className={colors.text}>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${colors.bar} rounded-full`}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {pocket.targetAmount > 0 && (
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-400">Falta</span>
              </div>
              <p className="font-bold text-white">
                {isHidden ? '••••' : formatCurrency(amountNeeded)}
              </p>
            </div>
          )}
          {daysRemaining !== null && (
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-400">Días restantes</span>
              </div>
              <p className={`font-bold ${daysRemaining < 0 ? 'text-red-400' : daysRemaining < 30 ? 'text-yellow-400' : 'text-white'}`}>
                {daysRemaining < 0 ? 'Vencido' : daysRemaining}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {pocket.notes && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 text-sm text-zinc-400">
            {pocket.notes}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <motion.button
            onClick={() => setActionType(actionType === 'deposit' ? null : 'deposit')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              actionType === 'deposit'
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            Agregar
          </motion.button>
          <motion.button
            onClick={() => setActionType(actionType === 'withdraw' ? null : 'withdraw')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              actionType === 'withdraw'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
            }`}
          >
            <Minus className="w-4 h-4" />
            Retirar
          </motion.button>
        </div>

        {/* Action Input */}
        <AnimatePresence>
          {actionType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="Monto"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-violet-500"
                    autoFocus
                  />
                </div>
                <motion.button
                  onClick={handleAction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 rounded-xl ${
                    actionType === 'deposit' ? 'bg-emerald-500' : 'bg-orange-500'
                  } text-white`}
                >
                  <Check className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => {
                    setActionType(null);
                    setActionAmount('');
                    setActionDescription('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 rounded-xl bg-white/10 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <input
                type="text"
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Toggle */}
      {movements.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-t border-white/10"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <History className="w-4 h-4" />
              <span>Historial de movimientos</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                {movements.length}
              </span>
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10"
              >
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {pocketMovements.map((movement, index) => (
                    <motion.div
                      key={movement.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          movement.type === 'deposit'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {movement.type === 'deposit' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {movement.description || (movement.type === 'deposit' ? 'Depósito' : 'Retiro')}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatDate(movement.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`font-medium ${
                        movement.type === 'deposit' ? 'text-emerald-400' : 'text-orange-400'
                      }`}>
                        {movement.type === 'deposit' ? '+' : '-'}
                        {isHidden ? '••••' : formatCurrency(movement.amount)}
                      </p>
                    </motion.div>
                  ))}
                  {movements.length > 5 && (
                    <p className="text-center text-xs text-zinc-500 py-2">
                      Mostrando los últimos 5 movimientos
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

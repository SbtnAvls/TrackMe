import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles, Banknote, Building2, Pencil, Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

function AnimatedNumber({ value, className, isHidden }) {
  return (
    <motion.span
      key={isHidden ? 'hidden' : value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {isHidden ? '••••••' : formatCurrency(value)}
    </motion.span>
  );
}

function EditableAmount({ value, onSave, icon: Icon, label, color, isHidden }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const num = parseFloat(inputValue) || 0;
    onSave(num);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        <span className="text-lg">$</span>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-24 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleSave}
          className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={() => {
        setInputValue(value.toString());
        setIsEditing(true);
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group`}
    >
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-left">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-white">
          {isHidden ? '••••••' : formatCurrency(value)}
        </p>
      </div>
      <Pencil className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
    </motion.button>
  );
}

export default function Summary({ summary, accumulatedBalance, distribution, onUpdateDistribution }) {
  const { isHidden } = usePrivacy();
  const isPositive = accumulatedBalance >= 0;

  const unallocated = accumulatedBalance - (distribution.cash + distribution.savings);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Saldo acumulado - Hero Card */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.01, y: -2 }}
        className="relative overflow-hidden rounded-2xl p-6"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-fuchsia-600/20" />
        <div className="absolute inset-0 glass" />

        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 left-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-zinc-400">Saldo actual</p>
              </div>
              <motion.p
                className={`text-4xl font-bold ${isPositive ? 'text-white' : 'text-red-400'}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <AnimatedNumber value={accumulatedBalance} isHidden={isHidden} />
              </motion.p>
              <p className="text-xs text-zinc-500 mt-1">Balance acumulado total</p>
            </div>

            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <div className={`absolute inset-0 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} rounded-2xl blur-xl opacity-30`} />
              <div className={`relative p-4 rounded-2xl ${isPositive ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <PiggyBank className={`w-10 h-10 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
            </motion.div>
          </div>

          {/* Balance Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4 border-t border-white/10"
          >
            <p className="text-xs text-zinc-500 mb-3">Distribución del saldo (clic para editar)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <EditableAmount
                value={distribution.cash}
                onSave={(amount) => onUpdateDistribution({ ...distribution, cash: amount })}
                icon={Banknote}
                label="Efectivo"
                color="bg-green-500/20 text-green-400"
                isHidden={isHidden}
              />
              <EditableAmount
                value={distribution.savings}
                onSave={(amount) => onUpdateDistribution({ ...distribution, savings: amount })}
                icon={Building2}
                label="Cuentas de ahorro"
                color="bg-blue-500/20 text-blue-400"
                isHidden={isHidden}
              />
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-lg bg-zinc-500/20 text-zinc-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500">Sin asignar</p>
                  <p className={`text-sm font-medium ${unallocated < 0 ? 'text-orange-400' : 'text-zinc-400'}`}>
                    {isHidden ? '••••••' : formatCurrency(unallocated)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ingresos */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass rounded-2xl p-5 card-hover relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">Ingresos del mes</p>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              <AnimatedNumber value={summary.totalIncome} isHidden={isHidden} />
            </p>
          </div>
        </motion.div>

        {/* Gastos */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass rounded-2xl p-5 card-hover relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">Gastos del mes</p>
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400">
              <AnimatedNumber value={summary.totalExpense} isHidden={isHidden} />
            </p>
            {summary.creditCardExpense > 0 && !isHidden && (
              <p className="text-xs text-orange-400 mt-1">
                {formatCurrency(summary.creditCardExpense)} en deudas
              </p>
            )}
          </div>
        </motion.div>

        {/* Balance del mes */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass rounded-2xl p-5 card-hover relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">Balance del mes</p>
              <div className={`p-2 rounded-xl ${summary.balance >= 0 ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-orange-500/10 border-orange-500/20'} border`}>
                <Wallet className={`w-5 h-5 ${summary.balance >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
              <AnimatedNumber value={summary.balance} isHidden={isHidden} />
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

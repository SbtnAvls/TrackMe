import { motion } from 'framer-motion';
import { CreditCard, Pencil, Trash2, Calendar, TrendingUp, TrendingDown, Sparkles, User, Landmark, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';

const iconMap = {
  credit_card: CreditCard,
  person: User,
  loan: Landmark,
  other: Wallet
};

const debtTypeLabels = {
  credit_card: 'Tarjeta de crédito',
  person: 'Deuda personal',
  loan: 'Préstamo',
  other: 'Otra deuda'
};

export default function CreditCardItem({ card, onEdit, onDelete }) {
  const { isHidden } = usePrivacy();
  const balance = card.dynamicBalance ?? card.currentBalance ?? 0;
  const isCreditCard = card.debtType === 'credit_card' || !card.debtType;
  const hasLimit = isCreditCard && card.creditLimit > 0;

  const usedPercent = hasLimit
    ? (balance / card.creditLimit) * 100
    : 100;

  const getBarColor = () => {
    if (!hasLimit) return 'from-orange-500 to-red-500';
    if (usedPercent >= 80) return 'from-red-500 to-red-600';
    if (usedPercent >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-emerald-500 to-green-500';
  };

  const getGlowColor = () => {
    if (!hasLimit) return 'shadow-orange-500/20';
    if (usedPercent >= 80) return 'shadow-red-500/20';
    if (usedPercent >= 50) return 'shadow-yellow-500/20';
    return 'shadow-emerald-500/20';
  };

  const displayValue = (value) => isHidden ? '••••••' : formatCurrency(value);

  const Icon = iconMap[card.debtType] || CreditCard;
  const debtLabel = debtTypeLabels[card.debtType] || 'Tarjeta de crédito';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-2xl p-5 transition-shadow duration-300 hover:shadow-xl ${getGlowColor()}`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900" />

      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-2xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-full blur-2xl"
      />

      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <p className="text-xs text-zinc-400">{debtLabel}</p>
            </div>
            <p className="text-xl font-bold text-white">{card.bank}</p>
          </div>
          <div className="flex gap-1">
            <motion.button
              onClick={() => onEdit(card)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-zinc-500 hover:text-violet-400 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onDelete(card.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Icon and identifier */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
          {isCreditCard && card.lastFourDigits ? (
            <span className="text-lg text-zinc-300 tracking-widest font-mono">
              •••• •••• •••• {card.lastFourDigits}
            </span>
          ) : (
            <span className="text-sm text-zinc-400">
              {card.debtType === 'person' ? 'Deuda personal' :
               card.debtType === 'loan' ? 'Préstamo activo' :
               'Deuda registrada'}
            </span>
          )}
        </div>

        {/* Balance info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Deuda actual</span>
            <motion.span
              key={isHidden ? 'hidden' : balance}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-xl text-red-400"
            >
              {displayValue(balance)}
            </motion.span>
          </div>

          {hasLimit && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Límite</span>
                <span className="text-zinc-300">{displayValue(card.creditLimit)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Disponible</span>
                <span className="text-emerald-400 font-medium">
                  {displayValue(Math.max(0, card.creditLimit - balance))}
                </span>
              </div>
            </>
          )}

          {/* Progress bar */}
          {hasLimit && (
            <div className="mt-4">
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isHidden ? '50%' : `${Math.min(usedPercent, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${isHidden ? 'from-zinc-500 to-zinc-600' : getBarColor()} rounded-full`}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-right">
                {isHidden ? '••%' : `${usedPercent.toFixed(1)}%`} utilizado
              </p>
            </div>
          )}

          {/* Movement breakdown */}
          {(card.expensesTotal > 0 || card.paymentsTotal > 0) && !isHidden && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <p className="text-xs text-zinc-500 mb-2">Movimientos registrados:</p>

              {card.initialBalance > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Saldo inicial</span>
                  <span className="text-zinc-400">{formatCurrency(card.initialBalance)}</span>
                </div>
              )}

              {card.expensesTotal > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-red-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {isCreditCard ? 'Compras' : 'Cargos'}
                  </span>
                  <span className="text-red-400">+{formatCurrency(card.expensesTotal)}</span>
                </div>
              )}

              {card.paymentsTotal > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Pagos
                  </span>
                  <span className="text-emerald-400">-{formatCurrency(card.paymentsTotal)}</span>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          {(card.cutOffDay || card.paymentDay) && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
              {card.cutOffDay && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  <span>Corte: día {card.cutOffDay}</span>
                </div>
              )}
              {card.paymentDay && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  <span>Pago: día {card.paymentDay}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

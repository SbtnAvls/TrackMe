import { motion } from 'framer-motion';
import { Pencil, Trash2, TrendingUp, TrendingDown, CreditCard, Banknote, User, Landmark, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';

const debtIconMap = {
  credit_card: CreditCard,
  person: User,
  loan: Landmark,
  other: Wallet
};

const debtLabelMap = {
  credit_card: 'TDC',
  person: 'Persona',
  loan: 'Préstamo',
  other: 'Deuda'
};

export default function TransactionItem({ transaction, onEdit, onDelete, creditCards = [] }) {
  const { isHidden } = usePrivacy();
  const isIncome = transaction.type === 'income';
  const isCardPayment = transaction.type === 'card_payment';
  const isExpense = transaction.type === 'expense';
  const hasDebt = transaction.creditCardId != null;

  const debt = hasDebt ? creditCards.find(c => c.id === transaction.creditCardId) : null;
  const debtType = debt?.debtType || 'credit_card';

  const getIcon = () => {
    if (isCardPayment) return <Banknote className="w-5 h-5" />;
    if (isIncome) return <TrendingUp className="w-5 h-5" />;
    if (hasDebt) {
      const DebtIcon = debtIconMap[debtType] || CreditCard;
      return <DebtIcon className="w-5 h-5" />;
    }
    return <TrendingDown className="w-5 h-5" />;
  };

  const getColors = () => {
    if (isCardPayment) return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'group-hover:shadow-blue-500/20' };
    if (isIncome) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' };
    if (hasDebt) return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'group-hover:shadow-orange-500/20' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'group-hover:shadow-red-500/20' };
  };

  const colors = getColors();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`glass rounded-xl p-4 flex items-center justify-between group transition-shadow duration-300 ${colors.glow} hover:shadow-lg`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}
        >
          <span className={colors.text}>{getIcon()}</span>
        </motion.div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{transaction.category}</p>
            {hasDebt && debt && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                {debt.bank}
              </span>
            )}
          </div>
          {transaction.description && (
            <p className="text-sm text-zinc-500">{transaction.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-zinc-600">{formatDate(transaction.date)}</p>
            {isExpense && hasDebt && (
              <span className="text-xs text-orange-400/70">• {debtLabelMap[debtType] || 'Deuda'}</span>
            )}
            {isCardPayment && (
              <span className="text-xs text-blue-400/70">• Pago deuda</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.span
          key={isHidden ? 'hidden' : transaction.amount}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-lg font-bold ${colors.text}`}
        >
          {isHidden ? '••••••' : `${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}`}
        </motion.span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            onClick={() => onEdit(transaction)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-violet-400 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => onDelete(transaction.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

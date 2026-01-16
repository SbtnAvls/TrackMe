import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle, Wallet, TrendingDown, FileWarning } from 'lucide-react';
import CreditCardItem from './CreditCardItem';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function CreditCardList({
  creditCards,
  totalDebt,
  totalLimit,
  availableCredit,
  onEdit,
  onDelete
}) {
  const { isHidden } = usePrivacy();
  const displayValue = (value) => isHidden ? '••••••' : formatCurrency(value);

  // Contar tipos de deuda
  const debtCounts = creditCards.reduce((acc, card) => {
    const type = card.debtType || 'credit_card';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-400">Deuda total</p>
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <motion.p
              key={isHidden ? 'hidden' : totalDebt}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-red-400"
            >
              {displayValue(totalDebt)}
            </motion.p>
            <p className="text-xs text-zinc-600 mt-1">
              {creditCards.length} {creditCards.length === 1 ? 'deuda' : 'deudas'} registradas
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-400">Límite total</p>
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Wallet className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <motion.p
              key={isHidden ? 'hidden' : totalLimit}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              {displayValue(totalLimit)}
            </motion.p>
            <p className="text-xs text-zinc-600 mt-1">
              En tarjetas de crédito
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-400">Crédito disponible</p>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <motion.p
              key={isHidden ? 'hidden' : availableCredit}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-emerald-400"
            >
              {displayValue(availableCredit)}
            </motion.p>
            <p className="text-xs text-zinc-600 mt-1">
              Para usar en tarjetas
            </p>
          </div>
        </motion.div>
      </div>

      {/* Cards list */}
      {creditCards.length === 0 ? (
        <motion.div
          variants={item}
          className="glass rounded-2xl p-8 text-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-4"
          >
            <FileWarning className="w-10 h-10 text-zinc-600" />
          </motion.div>
          <p className="text-zinc-400 font-medium">No tienes deudas registradas</p>
          <p className="text-sm text-zinc-600">Agrega tarjetas, préstamos o deudas personales</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creditCards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CreditCardItem
                card={card}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles, Banknote, Building2, Pencil, Check, X, HandCoins, Scale, Landmark, ArrowRightLeft, CreditCard, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatDate, formatDateForInput } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';
import { TRANSFER_TYPES } from '../../db/constants';

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

const TRANSFER_LABELS = {
  bank_to_cash: { label: 'Banco a Efectivo', color: 'text-green-400', bg: 'bg-green-500/10' },
  credit_to_cash: { label: 'TC a Efectivo', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  credit_to_debit: { label: 'TC a Banco', color: 'text-blue-400', bg: 'bg-blue-500/10' }
};

export default function Summary({ summary, accumulatedBalance, distribution, onUpdateCash, totalDebt, pocketTotalSaved, emergencyFundAmount, investmentTotalCurrent, transfers = [], onAddTransfer, onDeleteTransfer, creditCards = [] }) {
  const { isHidden } = usePrivacy();
  const isPositive = accumulatedBalance >= 0;

  const savings = accumulatedBalance - (distribution.cash || 0);

  // Derived financial metrics
  const disponible = accumulatedBalance - (pocketTotalSaved || 0) - (emergencyFundAmount || 0);
  const netoSinDeudas = accumulatedBalance - (totalDebt || 0);
  const patrimonioNeto = accumulatedBalance + (investmentTotalCurrent || 0) - (totalDebt || 0);

  // Transfer form state
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferType, setTransferType] = useState('bank_to_cash');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCardId, setTransferCardId] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [transferDate, setTransferDate] = useState(formatDateForInput(new Date()));

  const needsCreditCard = transferType === 'credit_to_cash' || transferType === 'credit_to_debit';

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferAmount || (needsCreditCard && !transferCardId)) return;

    onAddTransfer({
      type: transferType,
      amount: parseFloat(transferAmount),
      creditCardId: needsCreditCard ? parseInt(transferCardId) : null,
      description: transferDescription,
      date: transferDate
    });

    setTransferAmount('');
    setTransferDescription('');
    setTransferCardId('');
    setTransferDate(formatDateForInput(new Date()));
  };

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
        className="relative overflow-hidden rounded-2xl p-4 sm:p-6"
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
                className={`text-2xl sm:text-4xl font-bold ${isPositive ? 'text-white' : 'text-red-400'}`}
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
              <div className={`relative p-3 sm:p-4 rounded-2xl ${isPositive ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <PiggyBank className={`w-7 h-7 sm:w-10 sm:h-10 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
            </motion.div>
          </div>

          {/* Financial Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="pt-4 border-t border-white/10"
          >
            <p className="text-xs text-zinc-500 mb-3">Panorama financiero</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Disponible */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500">Disponible</p>
                  <p className={`text-sm font-semibold ${disponible >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isHidden ? '••••••' : formatCurrency(disponible)}
                  </p>
                  <p className="text-[10px] text-zinc-600">Sin bolsillos ni emergencia</p>
                </div>
              </div>

              {/* Neto sin deudas */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className={`p-1.5 rounded-lg ${netoSinDeudas >= 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                  <Scale className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500">Total - Deudas</p>
                  <p className={`text-sm font-semibold ${netoSinDeudas >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {isHidden ? '••••••' : formatCurrency(netoSinDeudas)}
                  </p>
                  <p className="text-[10px] text-zinc-600">Saldo después de deudas</p>
                </div>
              </div>

              {/* Patrimonio neto */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className={`p-1.5 rounded-lg ${patrimonioNeto >= 0 ? 'bg-violet-500/20 text-violet-400' : 'bg-red-500/20 text-red-400'}`}>
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500">Patrimonio neto</p>
                  <p className={`text-sm font-semibold ${patrimonioNeto >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
                    {isHidden ? '••••••' : formatCurrency(patrimonioNeto)}
                  </p>
                  <p className="text-[10px] text-zinc-600">Saldo + inversiones - deudas</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Balance Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 border-t border-white/10"
          >
            <p className="text-xs text-zinc-500 mb-3">Distribución del saldo</p>
            <div className="grid grid-cols-2 gap-2">
              <EditableAmount
                value={distribution.cash || 0}
                onSave={(amount) => onUpdateCash(amount)}
                icon={Banknote}
                label="Efectivo"
                color="bg-green-500/20 text-green-400"
                isHidden={isHidden}
              />
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500">Cuentas de ahorro</p>
                  <p className={`text-sm font-medium ${savings >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {isHidden ? '••••••' : formatCurrency(savings)}
                  </p>
                  <p className="text-[10px] text-zinc-600">Auto-calculado</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transfers section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500">Movimientos entre cuentas</p>
              <motion.button
                onClick={() => setShowTransferForm(!showTransferForm)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
              >
                {showTransferForm ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {showTransferForm ? 'Ocultar' : 'Nuevo'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showTransferForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleTransferSubmit}
                  className="space-y-3 mb-3 overflow-hidden"
                >
                  {/* Transfer type */}
                  <div className="flex gap-1.5 p-1 rounded-xl bg-white/5">
                    {TRANSFER_TYPES.map((tt) => (
                      <motion.button
                        key={tt.id}
                        type="button"
                        onClick={() => {
                          setTransferType(tt.id);
                          if (tt.id === 'bank_to_cash') setTransferCardId('');
                        }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
                          transferType === tt.id
                            ? tt.id === 'bank_to_cash'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : tt.id === 'credit_to_cash'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                      >
                        {tt.label}
                      </motion.button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Monto"
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                      required
                    />
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  {/* Credit card selector for advance types */}
                  <AnimatePresence>
                    {needsCreditCard && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <select
                          value={transferCardId}
                          onChange={(e) => setTransferCardId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                          required
                        >
                          <option value="">Seleccionar tarjeta</option>
                          {creditCards.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.bank} {card.lastFourDigits ? `•••• ${card.lastFourDigits}` : ''}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="text"
                    value={transferDescription}
                    onChange={(e) => setTransferDescription(e.target.value)}
                    placeholder="Descripción (opcional)"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                  />

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!transferAmount || (needsCreditCard && !transferCardId)}
                    className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Registrar movimiento
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Recent transfers */}
            {transfers.length > 0 && (
              <div className="space-y-1.5">
                {transfers.slice(0, 5).map((transfer) => {
                  const info = TRANSFER_LABELS[transfer.type] || TRANSFER_LABELS.bank_to_cash;
                  const card = transfer.creditCardId ? creditCards.find(c => c.id === transfer.creditCardId) : null;
                  return (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5 group/item"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1 rounded-md ${info.bg}`}>
                          <ArrowRightLeft className={`w-3 h-3 ${info.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className={`text-xs font-medium ${info.color}`}>{info.label}</p>
                            {card && (
                              <span className="text-[10px] text-zinc-500">{card.bank}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-zinc-600">{formatDate(transfer.date)}</p>
                            {transfer.description && (
                              <p className="text-[10px] text-zinc-600">• {transfer.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-white">
                          {isHidden ? '••••••' : formatCurrency(transfer.amount)}
                        </p>
                        <motion.button
                          onClick={() => onDeleteTransfer(transfer.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CreditCard, Zap, User, Landmark, Wallet } from 'lucide-react';
import { getCategories, DEBT_PAYMENT_CATEGORY } from '../../db/database';
import { formatDateForInput } from '../../utils/formatters';

export default function TransactionForm({ onSubmit, initialData, onCancel, creditCards = [] }) {
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [creditCardId, setCreditCardId] = useState(initialData?.creditCardId || '');
  const [date, setDate] = useState(
    initialData?.date ? formatDateForInput(initialData.date) : formatDateForInput(new Date())
  );

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount || '');
      setCategory(initialData.category || '');
      setDescription(initialData.description || '');
      setCreditCardId(initialData.creditCardId || '');
      setDate(initialData.date ? formatDateForInput(initialData.date) : formatDateForInput(new Date()));
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDescription('');
      setCreditCardId('');
      setDate(formatDateForInput(new Date()));
    }
  }, [initialData]);

  const categories = type === 'card_payment' ? [DEBT_PAYMENT_CATEGORY] : getCategories(type);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'card_payment' ? DEBT_PAYMENT_CATEGORY : '');
    if (newType === 'income') {
      setCreditCardId('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;
    if (type === 'card_payment' && !creditCardId) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      creditCardId: creditCardId ? parseInt(creditCardId) : null
    });

    if (!initialData) {
      setAmount('');
      setCategory(type === 'card_payment' ? DEBT_PAYMENT_CATEGORY : '');
      setDescription('');
      setCreditCardId('');
      setDate(formatDateForInput(new Date()));
    }
  };

  const typeButtons = [
    { id: 'income', label: 'Ingreso', color: 'emerald' },
    { id: 'expense', label: 'Gasto', color: 'red' },
    { id: 'card_payment', label: 'Pago Deuda', color: 'blue' },
  ];

  const getDebtIcon = (card) => {
    if (!card) return CreditCard;
    switch (card.debtType) {
      case 'person': return User;
      case 'loan': return Landmark;
      case 'other': return Wallet;
      default: return CreditCard;
    }
  };

  const getDebtLabel = (card) => {
    if (!card) return 'Deuda';
    switch (card.debtType) {
      case 'person': return 'Persona';
      case 'loan': return 'Préstamo';
      case 'other': return 'Otro';
      default: return 'TDC';
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Editar' : 'Nueva transacción'}
          </h3>
        </div>
        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/5 text-zinc-400"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl bg-white/5">
        {typeButtons.map((btn) => (
          <motion.button
            key={btn.id}
            type="button"
            onClick={() => handleTypeChange(btn.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
              type === btn.id
                ? btn.color === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : btn.color === 'red'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Monto
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-dark"
            required
          />
        </div>

        {/* Category */}
        <AnimatePresence mode="wait">
          {type !== 'card_payment' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select-dark"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debt selector for expenses */}
        <AnimatePresence mode="wait">
          {type === 'expense' && creditCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Método de pago
                </div>
              </label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="select-dark"
              >
                <option value="">Efectivo / Débito</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    [{getDebtLabel(card)}] {card.bank} {card.lastFourDigits ? `•••• ${card.lastFourDigits}` : ''}
                  </option>
                ))}
              </select>
              {creditCardId && (
                <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Se sumará a la deuda seleccionada
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debt selector for payments */}
        <AnimatePresence mode="wait">
          {type === 'card_payment' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Deuda a pagar
                </div>
              </label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="select-dark"
                required
              >
                <option value="">Seleccionar deuda</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    [{getDebtLabel(card)}] {card.bank} {card.lastFourDigits ? `•••• ${card.lastFourDigits}` : ''}
                  </option>
                ))}
              </select>
              {creditCards.length === 0 && (
                <p className="text-xs text-orange-400 mt-2">
                  Primero agrega una deuda
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'card_payment' ? 'Ej: Pago mensual, abono parcial' : 'Ej: Compra en supermercado'}
            className="input-dark"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-dark"
            required
          />
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={type === 'card_payment' && creditCards.length === 0}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
        >
          <Plus className="w-5 h-5" />
          {initialData ? 'Actualizar' : 'Agregar transacción'}
        </motion.button>
      </div>
    </motion.form>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, X, Sparkles, User, Landmark, Wallet } from 'lucide-react';
import { DEBT_TYPES } from '../../db/database';

const iconMap = {
  CreditCard: CreditCard,
  User: User,
  Landmark: Landmark,
  Wallet: Wallet
};

export default function CreditCardForm({ onSubmit, initialData, onCancel }) {
  const [debtType, setDebtType] = useState(initialData?.debtType || 'credit_card');
  const [bank, setBank] = useState(initialData?.bank || '');
  const [lastFourDigits, setLastFourDigits] = useState(initialData?.lastFourDigits || '');
  const [creditLimit, setCreditLimit] = useState(initialData?.creditLimit || '');
  const [currentBalance, setCurrentBalance] = useState(initialData?.currentBalance || '');
  const [cutOffDay, setCutOffDay] = useState(initialData?.cutOffDay || '');
  const [paymentDay, setPaymentDay] = useState(initialData?.paymentDay || '');

  useEffect(() => {
    if (initialData) {
      setDebtType(initialData.debtType || 'credit_card');
      setBank(initialData.bank || '');
      setLastFourDigits(initialData.lastFourDigits || '');
      setCreditLimit(initialData.creditLimit || '');
      setCurrentBalance(initialData.currentBalance || '');
      setCutOffDay(initialData.cutOffDay || '');
      setPaymentDay(initialData.paymentDay || '');
    } else {
      setDebtType('credit_card');
      setBank('');
      setLastFourDigits('');
      setCreditLimit('');
      setCurrentBalance('');
      setCutOffDay('');
      setPaymentDay('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bank) return;

    onSubmit({
      debtType,
      bank,
      lastFourDigits: debtType === 'credit_card' ? lastFourDigits : '',
      creditLimit: parseFloat(creditLimit) || 0,
      currentBalance: parseFloat(currentBalance) || 0,
      cutOffDay: debtType === 'credit_card' ? (parseInt(cutOffDay) || null) : null,
      paymentDay: parseInt(paymentDay) || null
    });

    if (!initialData) {
      setDebtType('credit_card');
      setBank('');
      setLastFourDigits('');
      setCreditLimit('');
      setCurrentBalance('');
      setCutOffDay('');
      setPaymentDay('');
    }
  };

  const getNameLabel = () => {
    switch (debtType) {
      case 'credit_card': return 'Banco / Emisor';
      case 'person': return 'Nombre de la persona';
      case 'loan': return 'Institución / Banco';
      default: return 'Nombre / Descripción';
    }
  };

  const getNamePlaceholder = () => {
    switch (debtType) {
      case 'credit_card': return 'Ej: BBVA, Santander, Banamex';
      case 'person': return 'Ej: Juan Pérez';
      case 'loan': return 'Ej: Banco Azteca, Coppel';
      default: return 'Ej: Tienda departamental';
    }
  };

  const isCreditCard = debtType === 'credit_card';

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Editar deuda' : 'Nueva deuda'}
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

      <div className="space-y-4">
        {/* Tipo de deuda */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Tipo de deuda
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DEBT_TYPES.map((type) => {
              const Icon = iconMap[type.icon];
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => setDebtType(type.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    debtType === type.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {getNameLabel()}
          </label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder={getNamePlaceholder()}
            className="input-dark"
            required
          />
        </div>

        {/* Últimos 4 dígitos - solo para tarjetas */}
        {isCreditCard && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Últimos 4 dígitos (opcional)
            </label>
            <input
              type="text"
              value={lastFourDigits}
              onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="input-dark"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Límite - solo para tarjetas */}
          {isCreditCard && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Límite de crédito
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="50000"
                className="input-dark"
              />
            </div>
          )}

          <div className={isCreditCard ? '' : 'col-span-2'}>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {isCreditCard ? 'Saldo inicial' : 'Monto de la deuda'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="0"
              className="input-dark"
              required={!isCreditCard}
            />
          </div>
        </div>

        {/* Fechas - corte solo para tarjetas, pago para todos */}
        <div className={`grid ${isCreditCard ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {isCreditCard && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Día de corte
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={cutOffDay}
                onChange={(e) => setCutOffDay(e.target.value)}
                placeholder="15"
                className="input-dark"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {isCreditCard ? 'Día de pago' : 'Día de pago (opcional)'}
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              placeholder="5"
              className="input-dark"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
        >
          {(() => {
            const Icon = iconMap[DEBT_TYPES.find(t => t.id === debtType)?.icon] || Wallet;
            return <Icon className="w-5 h-5" />;
          })()}
          {initialData ? 'Actualizar' : 'Agregar deuda'}
        </motion.button>
      </div>
    </motion.form>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, Bitcoin, LineChart, Landmark, DollarSign, Gem, Coins, FileText, Home, Wallet } from 'lucide-react';
import { INVESTMENT_TYPES, POPULAR_SYMBOLS } from '../../db/database';
import { formatDateForInput } from '../../utils/formatters';

const iconMap = {
  Bitcoin,
  LineChart,
  TrendingUp,
  Landmark,
  DollarSign,
  Gem,
  Coins,
  FileText,
  Home,
  Wallet
};

export default function InvestmentForm({ onSubmit, initialData, onCancel }) {
  const [type, setType] = useState(initialData?.type || 'crypto');
  const [name, setName] = useState(initialData?.name || '');
  const [symbol, setSymbol] = useState(initialData?.symbol || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || '');
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice || '');
  const [currentPrice, setCurrentPrice] = useState(initialData?.currentPrice || '');
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchaseDate ? formatDateForInput(initialData.purchaseDate) : formatDateForInput(new Date())
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Campos específicos para CDT
  const [interestRate, setInterestRate] = useState(initialData?.interestRate || '');
  const [maturityDate, setMaturityDate] = useState(
    initialData?.maturityDate ? formatDateForInput(initialData.maturityDate) : ''
  );
  const [bank, setBank] = useState(initialData?.bank || '');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'crypto');
      setName(initialData.name || '');
      setSymbol(initialData.symbol || '');
      setQuantity(initialData.quantity || '');
      setPurchasePrice(initialData.purchasePrice || '');
      setCurrentPrice(initialData.currentPrice || '');
      setPurchaseDate(initialData.purchaseDate ? formatDateForInput(initialData.purchaseDate) : formatDateForInput(new Date()));
      setNotes(initialData.notes || '');
      setInterestRate(initialData.interestRate || '');
      setMaturityDate(initialData.maturityDate ? formatDateForInput(initialData.maturityDate) : '');
      setBank(initialData.bank || '');
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setType('crypto');
    setName('');
    setSymbol('');
    setQuantity('');
    setPurchasePrice('');
    setCurrentPrice('');
    setPurchaseDate(formatDateForInput(new Date()));
    setNotes('');
    setInterestRate('');
    setMaturityDate('');
    setBank('');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setSymbol('');
    setName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity || !purchasePrice) return;

    const investmentData = {
      type,
      name: name || symbol,
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice: currentPrice ? parseFloat(currentPrice) : parseFloat(purchasePrice),
      purchaseDate,
      notes
    };

    // Agregar campos específicos para CDT
    if (type === 'cdt') {
      investmentData.interestRate = interestRate ? parseFloat(interestRate) : null;
      investmentData.maturityDate = maturityDate || null;
      investmentData.bank = bank;
    }

    onSubmit(investmentData);

    if (!initialData) {
      resetForm();
    }
  };

  const selectedType = INVESTMENT_TYPES.find(t => t.id === type);
  const popularSymbols = POPULAR_SYMBOLS[type] || [];
  const TypeIcon = selectedType ? iconMap[selectedType.icon] : TrendingUp;

  const isCDT = type === 'cdt';
  const needsSymbol = ['crypto', 'stock', 'etf', 'forex', 'commodity', 'stablecoin'].includes(type);

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Editar inversión' : 'Nueva inversión'}
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
      <div className="mb-5">
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Tipo de inversión
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INVESTMENT_TYPES.map((invType) => {
            const Icon = iconMap[invType.icon] || TrendingUp;
            const isSelected = type === invType.id;
            return (
              <motion.button
                key={invType.id}
                type="button"
                onClick={() => handleTypeChange(invType.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? `bg-${invType.color}-500/20 text-${invType.color}-400 border border-${invType.color}-500/30`
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent hover:border-white/10'
                }`}
                style={isSelected ? {
                  backgroundColor: `rgb(var(--${invType.color}-500) / 0.2)`,
                } : {}}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{invType.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {/* Symbol/Ticker for applicable types */}
        {needsSymbol && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Símbolo / Ticker
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Ej: BTC, AAPL, SPY"
              className="input-dark"
            />
            {popularSymbols.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {popularSymbols.slice(0, 6).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSymbol(sym)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                      symbol === sym
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {isCDT ? 'Nombre del CDT' : 'Nombre (opcional)'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isCDT ? 'Ej: CDT Bancolombia 12 meses' : 'Ej: Bitcoin, Apple Inc.'}
            className="input-dark"
          />
        </div>

        {/* Bank for CDT */}
        {isCDT && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Banco / Entidad
            </label>
            <input
              type="text"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Ej: Bancolombia, Davivienda"
              className="input-dark"
            />
          </div>
        )}

        {/* Quantity and Purchase Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {isCDT ? 'Monto invertido' : 'Cantidad'}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={isCDT ? '1000000' : '0.5'}
              className="input-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {isCDT ? 'Valor (siempre 1)' : 'Precio de compra'}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={isCDT ? '1' : purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="45000"
              className="input-dark"
              required
              disabled={isCDT}
            />
          </div>
        </div>

        {/* Current Price */}
        {!isCDT && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Precio actual (opcional)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="Dejar vacío para usar precio de compra"
              className="input-dark"
            />
            <p className="text-xs text-zinc-600 mt-1">
              Actualiza manualmente para ver ganancia/pérdida
            </p>
          </div>
        )}

        {/* Interest Rate and Maturity for CDT */}
        {isCDT && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tasa de interés (% anual)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="11.5"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Fecha vencimiento
                </label>
                <input
                  type="date"
                  value={maturityDate}
                  onChange={(e) => setMaturityDate(e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>
          </>
        )}

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Fecha de compra
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="input-dark"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Comprado en Binance, plan de hold largo plazo..."
            className="input-dark min-h-[60px] resize-none"
            rows={2}
          />
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
        >
          <Plus className="w-5 h-5" />
          {initialData ? 'Actualizar' : 'Agregar inversión'}
        </motion.button>
      </div>
    </motion.form>
  );
}

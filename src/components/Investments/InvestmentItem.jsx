import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, TrendingUp, TrendingDown, Bitcoin, LineChart, Landmark, DollarSign, Gem, Coins, FileText, Home, Wallet, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';
import { INVESTMENT_TYPES } from '../../db/database';

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

const colorClasses = {
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'group-hover:shadow-orange-500/20' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'group-hover:shadow-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'group-hover:shadow-violet-500/20' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', glow: 'group-hover:shadow-green-500/20' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'group-hover:shadow-yellow-500/20' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'group-hover:shadow-cyan-500/20' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', glow: 'group-hover:shadow-slate-500/20' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'group-hover:shadow-amber-500/20' },
  zinc: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400', glow: 'group-hover:shadow-zinc-500/20' }
};

export default function InvestmentItem({ investment, onEdit, onDelete, onUpdatePrice }) {
  const { isHidden } = usePrivacy();
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(investment.currentPrice?.toString() || '');

  const investmentType = INVESTMENT_TYPES.find(t => t.id === investment.type) || INVESTMENT_TYPES[INVESTMENT_TYPES.length - 1];
  const Icon = iconMap[investmentType.icon] || TrendingUp;
  const colors = colorClasses[investmentType.color] || colorClasses.zinc;

  const invested = investment.quantity * investment.purchasePrice;
  const current = investment.quantity * (investment.currentPrice || investment.purchasePrice);
  const profit = current - invested;
  const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;
  const isProfit = profit >= 0;

  const isCDT = investment.type === 'cdt';

  const handlePriceUpdate = () => {
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      onUpdatePrice(investment.id, parseFloat(newPrice));
    }
    setIsUpdatingPrice(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`glass rounded-xl p-4 group transition-shadow duration-300 ${colors.glow} hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl ${colors.bg} border ${colors.border} shrink-0`}
          >
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white">
                {investment.symbol || investment.name}
              </p>
              {investment.symbol && investment.name && investment.name !== investment.symbol && (
                <span className="text-xs text-zinc-500">{investment.name}</span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                {investmentType.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm">
              <div>
                <span className="text-zinc-500">Cantidad: </span>
                <span className="text-white">
                  {isHidden ? '••••' : investment.quantity.toLocaleString('es-MX', { maximumFractionDigits: 8 })}
                </span>
              </div>
              {!isCDT && (
                <div>
                  <span className="text-zinc-500">Precio: </span>
                  <span className="text-white">
                    {isHidden ? '••••' : formatCurrency(investment.currentPrice || investment.purchasePrice)}
                  </span>
                </div>
              )}
            </div>

            {isCDT && investment.interestRate && (
              <div className="flex items-center gap-4 mt-1 text-sm">
                <div>
                  <span className="text-zinc-500">Tasa: </span>
                  <span className="text-emerald-400">{investment.interestRate}% EA</span>
                </div>
                {investment.maturityDate && (
                  <div>
                    <span className="text-zinc-500">Vence: </span>
                    <span className="text-white">{formatDate(investment.maturityDate)}</span>
                  </div>
                )}
                {investment.bank && (
                  <div>
                    <span className="text-zinc-500">Banco: </span>
                    <span className="text-white">{investment.bank}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-zinc-600 mt-1">
              Comprado: {formatDate(investment.purchaseDate)}
              {!isCDT && ` • Precio compra: ${isHidden ? '••••' : formatCurrency(investment.purchasePrice)}`}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-white">
            {isHidden ? '••••••' : formatCurrency(current)}
          </p>
          <p className="text-xs text-zinc-500">
            Invertido: {isHidden ? '••••' : formatCurrency(invested)}
          </p>
          {!isCDT && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`flex items-center justify-end gap-1 mt-1 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-sm font-medium">
                {isHidden ? '••••' : `${isProfit ? '+' : ''}${formatCurrency(profit)}`}
              </span>
              <span className="text-xs">
                ({isHidden ? '••' : `${isProfit ? '+' : ''}${profitPercent.toFixed(2)}%`})
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick price update */}
      {!isCDT && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {isUpdatingPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Nuevo precio:</span>
              <input
                type="number"
                step="any"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()}
                autoFocus
                className="flex-1 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Precio actual"
              />
              <button
                onClick={handlePriceUpdate}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsUpdatingPrice(false)}
                className="px-2 py-1 rounded-lg bg-white/5 text-zinc-400 text-xs hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setNewPrice(investment.currentPrice?.toString() || investment.purchasePrice?.toString() || '');
                  setIsUpdatingPrice(true);
                }}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar precio
              </button>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <motion.button
                  onClick={() => onEdit(investment)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-violet-400 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => onDelete(investment.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions for CDT */}
      {isCDT && (
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            onClick={() => onEdit(investment)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-violet-400 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => onDelete(investment.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {investment.notes && (
        <p className="text-xs text-zinc-600 mt-2 italic">"{investment.notes}"</p>
      )}
    </motion.div>
  );
}

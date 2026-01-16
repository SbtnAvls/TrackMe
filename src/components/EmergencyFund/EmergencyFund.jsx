import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Minus, Settings, Lightbulb, Check, X, AlertTriangle, TrendingUp, Calendar, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';
import { EMERGENCY_FUND_TIPS } from '../../db/database';

export default function EmergencyFund({
  fund,
  targetAmount,
  progress,
  monthsCovered,
  amountNeeded,
  status,
  onUpdateAmount,
  onUpdateTargetMonths,
  onUpdateMonthlyExpense,
  onAddToFund,
  onWithdrawFromFund
}) {
  const { isHidden } = usePrivacy();
  const [showSettings, setShowSettings] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [actionType, setActionType] = useState(null); // 'add' | 'withdraw'
  const [actionAmount, setActionAmount] = useState('');

  // Settings form state
  const [targetMonths, setTargetMonths] = useState(fund.targetMonths);
  const [monthlyExpense, setMonthlyExpense] = useState(fund.monthlyExpenseEstimate || '');

  const handleAction = () => {
    const amount = parseFloat(actionAmount);
    if (amount > 0) {
      if (actionType === 'add') {
        onAddToFund(amount);
      } else {
        onWithdrawFromFund(amount);
      }
      setActionAmount('');
      setActionType(null);
    }
  };

  const handleSaveSettings = () => {
    onUpdateTargetMonths(targetMonths);
    if (monthlyExpense) {
      onUpdateMonthlyExpense(parseFloat(monthlyExpense));
    }
    setShowSettings(false);
  };

  const statusColors = {
    excellent: { bg: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' },
    good: { bg: 'from-green-500/20 to-lime-500/20', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
    fair: { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-yellow-500' },
    building: { bg: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
    starting: { bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' }
  };

  const colors = statusColors[status.level];

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${colors.bg} border ${colors.border}`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}
              >
                <Shield className={`w-8 h-8 ${colors.text}`} />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Fondo de Emergencia</h2>
                <p className={`text-sm ${colors.text}`}>{status.label}</p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Current Amount */}
          <div className="mb-6">
            <p className="text-sm text-zinc-400 mb-1">Monto actual</p>
            <p className="text-4xl font-bold text-white">
              {isHidden ? '••••••' : formatCurrency(fund.currentAmount)}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Meta: {isHidden ? '••••••' : formatCurrency(targetAmount)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progreso</span>
              <span className={colors.text}>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${colors.bar} rounded-full`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
              <p className="text-lg font-bold text-white">{monthsCovered.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">Meses cubiertos</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <Target className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
              <p className="text-lg font-bold text-white">{fund.targetMonths}</p>
              <p className="text-xs text-zinc-500">Meses meta</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
              <p className="text-lg font-bold text-white">
                {isHidden ? '••••' : formatCurrency(amountNeeded)}
              </p>
              <p className="text-xs text-zinc-500">Falta</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <motion.button
              onClick={() => setActionType(actionType === 'add' ? null : 'add')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                actionType === 'add'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
            >
              <Plus className="w-5 h-5" />
              Agregar
            </motion.button>
            <motion.button
              onClick={() => setActionType(actionType === 'withdraw' ? null : 'withdraw')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                actionType === 'withdraw'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
              }`}
            >
              <Minus className="w-5 h-5" />
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
                className="mt-4"
              >
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                    <input
                      type="number"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      placeholder="Monto"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-violet-500"
                      autoFocus
                    />
                  </div>
                  <motion.button
                    onClick={handleAction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 rounded-xl ${
                      actionType === 'add' ? 'bg-emerald-500' : 'bg-orange-500'
                    } text-white`}
                  >
                    <Check className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setActionType(null);
                      setActionAmount('');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 rounded-xl bg-white/10 text-zinc-400"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                {actionType === 'withdraw' && (
                  <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Recuerda: solo para verdaderas emergencias
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-5 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-400" />
              Configuración del fondo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Meses de gastos como meta
                </label>
                <div className="flex gap-2">
                  {[3, 6, 9, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setTargetMonths(months)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        targetMonths === months
                          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {months} meses
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Gastos mensuales estimados
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                  <input
                    type="number"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(e.target.value)}
                    placeholder="Ej: 2000000"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  Incluye renta, servicios, comida, transporte y gastos fijos
                </p>
              </div>

              <motion.button
                onClick={handleSaveSettings}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-violet-500 text-white font-medium"
              >
                Guardar configuración
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/20">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">Consejos para tu fondo de emergencia</h3>
              <p className="text-sm text-zinc-500">Aprende a construir y mantener tu colchón financiero</p>
            </div>
          </div>
          {showTips ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10"
            >
              <div className="p-5 space-y-4">
                {EMERGENCY_FUND_TIPS.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <h4 className="font-medium text-white mb-1">{tip.title}</h4>
                    <p className="text-sm text-zinc-400">{tip.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

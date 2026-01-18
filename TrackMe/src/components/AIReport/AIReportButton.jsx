import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, AlertCircle, RefreshCw, Key, Calendar, MessageSquare, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { generateFinancialReport } from '../../services/geminiService';
import { getTransactionsByDateRange, calculateSummary, calculateCategoryData } from '../../db/database';
import ReactMarkdown from 'react-markdown';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function AIReportButton({
  accumulatedBalance,
  creditCards,
  totalDebt,
  currentYear,
  currentMonth
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('config'); // 'config' | 'loading' | 'report' | 'error'
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [dateRangeType, setDateRangeType] = useState('month'); // 'month' | 'range' | 'year'
  const [startYear, setStartYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [endYear, setEndYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(currentMonth);
  const [additionalContext, setAdditionalContext] = useState('');

  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYearNum - 2 + i);

  const handleGenerateReport = async () => {
    if (!apiKey.trim()) {
      setError('La API Key es requerida');
      return;
    }

    setStep('loading');
    setError(null);

    try {
      // Determinar el rango de fechas
      let sYear = startYear, sMonth = startMonth, eYear = endYear, eMonth = endMonth;

      if (dateRangeType === 'month') {
        eYear = sYear;
        eMonth = sMonth;
      } else if (dateRangeType === 'year') {
        sMonth = 0;
        eYear = sYear;
        eMonth = 11;
      }

      // Obtener transacciones del rango
      const transactions = await getTransactionsByDateRange(sYear, sMonth, eYear, eMonth);
      const summary = calculateSummary(transactions);
      const categoryData = calculateCategoryData(transactions);

      const dateRange = {
        type: dateRangeType,
        startYear: sYear,
        startMonth: sMonth,
        endYear: eYear,
        endMonth: eMonth
      };

      const result = await generateFinancialReport({
        summary,
        accumulatedBalance,
        transactions,
        creditCards,
        totalDebt,
        categoryData,
        dateRange,
        additionalContext: additionalContext.trim() || null
      }, apiKey.trim());

      if (result.success) {
        setReport(result.report);
        setStep('report');
      } else {
        setError(result.error);
        setStep('error');
      }
    } catch (err) {
      setError('Error inesperado al generar el reporte');
      setStep('error');
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep('config');
    setReport(null);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Limpiar API key por seguridad al cerrar
    setApiKey('');
    setShowApiKey(false);
  };

  const handleBackToConfig = () => {
    setStep('config');
    setError(null);
  };

  const renderConfig = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* API Key */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
          <Key className="w-4 h-4" />
          API Key de Gemini <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="input-dark pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-1">
          Obtén tu API Key en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Google AI Studio</a>
        </p>
      </div>

      {/* Date Range Type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
          <Calendar className="w-4 h-4" />
          Período a analizar
        </label>
        <div className="flex gap-2 p-1 rounded-xl bg-white/5">
          {[
            { id: 'month', label: 'Un mes' },
            { id: 'range', label: 'Rango' },
            { id: 'year', label: 'Año completo' }
          ].map((option) => (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => setDateRangeType(option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                dateRangeType === option.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-500 hover:text-white border border-transparent'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Selectors */}
      <AnimatePresence mode="wait">
        {dateRangeType === 'month' && (
          <motion.div
            key="month"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Mes</label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value))}
                className="select-dark"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Año</label>
              <select
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="select-dark"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {dateRangeType === 'range' && (
          <motion.div
            key="range"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Desde - Mes</label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(parseInt(e.target.value))}
                  className="select-dark"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Desde - Año</label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="select-dark"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Hasta - Mes</label>
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(parseInt(e.target.value))}
                  className="select-dark"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Hasta - Año</label>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  className="select-dark"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {dateRangeType === 'year' && (
          <motion.div
            key="year"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-xs text-zinc-500 mb-1">Año</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              className="select-dark"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional Context */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
          <MessageSquare className="w-4 h-4" />
          Contexto adicional <span className="text-zinc-600">(opcional)</span>
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Ej: Estoy ahorrando para un viaje, tengo gastos fijos de $5000 en renta, mi meta es reducir gastos en entretenimiento..."
          className="input-dark min-h-[100px] resize-none"
          rows={4}
        />
        <p className="text-xs text-zinc-600 mt-1">
          Agrega información que Gemini deba considerar en el análisis
        </p>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerateReport}
        disabled={!apiKey.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
      >
        <Sparkles className="w-5 h-5" />
        Generar Reporte
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 mb-4"
      >
        <Loader2 className="w-8 h-8 text-amber-400" />
      </motion.div>
      <p className="text-zinc-400 font-medium">Analizando tus finanzas...</p>
      <p className="text-sm text-zinc-600 mt-1">Esto puede tomar unos segundos</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/20 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-zinc-400 font-medium">Error al generar el reporte</p>
      <p className="text-sm text-zinc-600 mt-1 text-center max-w-md">{error}</p>
      <motion.button
        onClick={handleBackToConfig}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Volver a configurar
      </motion.button>
    </div>
  );

  const renderReport = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="prose prose-invert prose-sm max-w-none
        prose-headings:text-white prose-headings:font-semibold
        prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
        prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
        prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
        prose-p:text-zinc-300 prose-p:leading-relaxed
        prose-li:text-zinc-300 prose-li:my-1
        prose-ul:my-2 prose-ol:my-2
        prose-strong:text-white prose-strong:font-semibold
        prose-em:text-zinc-400
        prose-hr:border-white/10 prose-hr:my-6"
    >
      <ReactMarkdown>{report}</ReactMarkdown>
    </motion.div>
  );

  return (
    <>
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
      >
        <Sparkles className="w-4 h-4" />
        Reporte IA
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {step === 'config' ? 'Configurar Reporte' : 'Reporte Financiero con IA'}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {step === 'config' ? 'Configura los parámetros del análisis' : 'Análisis generado por Gemini'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step === 'report' && (
                    <motion.button
                      onClick={handleBackToConfig}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-amber-400 transition-colors"
                      title="Nuevo reporte"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl hover:bg-white/5 text-zinc-400"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {step === 'config' && renderConfig()}
                {step === 'loading' && renderLoading()}
                {step === 'error' && renderError()}
                {step === 'report' && renderReport()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

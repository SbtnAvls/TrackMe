import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PieChart as PieChartIcon, BarChart3, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';

const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9'];
const INCOME_COLORS = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'];
const HIDDEN_COLORS = ['#52525b', '#71717a', '#a1a1aa'];

function CustomLegend({ data, colors, isHidden }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-2 mt-4">
      {data.map((item, index) => {
        const percent = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
        return (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between text-sm group"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: isHidden ? HIDDEN_COLORS[index % HIDDEN_COLORS.length] : colors[index % colors.length] }}
              />
              <span className="text-zinc-400 group-hover:text-white transition-colors">{item.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-600">{isHidden ? '••%' : `${percent}%`}</span>
              <span className="font-medium text-zinc-300 min-w-[80px] text-right">
                {isHidden ? '••••••' : formatCurrency(item.amount)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CustomTooltip({ active, payload, isHidden }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-3 border border-white/10"
      >
        <p className="font-medium text-white">{data.category || data.name}</p>
        <p className="text-zinc-400">{isHidden ? '••••••' : formatCurrency(data.amount)}</p>
      </motion.div>
    );
  }
  return null;
}

export default function CategoryChart({ categoryData, summary }) {
  const { isHidden } = usePrivacy();

  const expenseData = categoryData
    .filter(d => d.type === 'expense')
    .sort((a, b) => b.amount - a.amount);

  const incomeData = categoryData
    .filter(d => d.type === 'income')
    .sort((a, b) => b.amount - a.amount);

  const comparisonData = [
    { name: 'Ingresos', amount: summary.totalIncome, fill: isHidden ? '#71717a' : '#22c55e' },
    { name: 'Gastos', amount: summary.totalExpense, fill: isHidden ? '#52525b' : '#ef4444' }
  ];

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Gráfico de barras comparativo */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.01 }}
        className="glass rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <BarChart3 className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Ingresos vs Gastos</h3>
          {isHidden && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Valores ocultos
            </span>
          )}
        </div>

        {summary.totalIncome === 0 && summary.totalExpense === 0 ? (
          <p className="text-center text-zinc-500 py-8">No hay datos para mostrar</p>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={comparisonData} layout="vertical" barSize={30}>
              <XAxis
                type="number"
                tickFormatter={(value) => isHidden ? '••••' : `$${(value/1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={70}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip isHidden={isHidden} />} />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Gráficos de dona */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gastos por categoría */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.01, y: -2 }}
          className="glass rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <PieChartIcon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Gastos por Categoría</h3>
            </div>

            {expenseData.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">No hay gastos este mes</p>
            ) : (
              <>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={isHidden ? HIDDEN_COLORS[index % HIDDEN_COLORS.length] : EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip isHidden={isHidden} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <CustomLegend data={expenseData} colors={EXPENSE_COLORS} isHidden={isHidden} />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Ingresos por categoría */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.01, y: -2 }}
          className="glass rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <PieChartIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Ingresos por Categoría</h3>
            </div>

            {incomeData.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">No hay ingresos este mes</p>
            ) : (
              <>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={incomeData}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {incomeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={isHidden ? HIDDEN_COLORS[index % HIDDEN_COLORS.length] : INCOME_COLORS[index % INCOME_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip isHidden={isHidden} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <CustomLegend data={incomeData} colors={INCOME_COLORS} isHidden={isHidden} />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

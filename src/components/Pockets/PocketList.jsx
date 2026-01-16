import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Target, TrendingUp, PiggyBank, Filter, Search, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { usePrivacy } from '../../context/PrivacyContext';
import { POCKET_CATEGORIES } from '../../db/database';
import PocketForm from './PocketForm';
import PocketItem from './PocketItem';

export default function PocketList({
  pockets,
  movements,
  totals,
  onAddPocket,
  onUpdatePocket,
  onDeletePocket,
  onDeposit,
  onWithdraw,
  getPocketMovements
}) {
  const { isHidden } = usePrivacy();
  const [showForm, setShowForm] = useState(false);
  const [editingPocket, setEditingPocket] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (data) => {
    if (editingPocket) {
      await onUpdatePocket(editingPocket.id, data);
      setEditingPocket(null);
    } else {
      await onAddPocket(data);
      setShowForm(false);
    }
  };

  const handleEdit = (pocket) => {
    setEditingPocket(pocket);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingPocket(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este bolsillo? Se perderán todos los movimientos asociados.')) {
      await onDeletePocket(id);
    }
  };

  // Filter pockets
  const filteredPockets = pockets.filter(pocket => {
    const matchesCategory = filterCategory === 'all' || pocket.category === filterCategory;
    const matchesSearch = pocket.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate category distribution
  const categoryDistribution = pockets.reduce((acc, pocket) => {
    const cat = pocket.category || 'other';
    if (!acc[cat]) {
      acc[cat] = { amount: 0, count: 0 };
    }
    acc[cat].amount += pocket.currentAmount;
    acc[cat].count += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/20">
              <PiggyBank className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-sm text-zinc-400">Total ahorrado</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {isHidden ? '••••••' : formatCurrency(totals.totalSaved)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            En {pockets.length} bolsillo{pockets.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-zinc-400">Meta total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {isHidden ? '••••••' : formatCurrency(totals.totalTarget)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Falta: {isHidden ? '••••' : formatCurrency(Math.max(0, totals.totalTarget - totals.totalSaved))}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm text-zinc-400">Progreso general</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {totals.overallProgress.toFixed(1)}%
          </p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, totals.overallProgress)}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Category Distribution */}
      {pockets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Distribución por categoría</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryDistribution).map(([catId, data]) => {
              const category = POCKET_CATEGORIES.find(c => c.id === catId);
              if (!category) return null;
              const percentage = totals.totalSaved > 0
                ? (data.amount / totals.totalSaved) * 100
                : 0;
              return (
                <motion.div
                  key={catId}
                  whileHover={{ scale: 1.02 }}
                  className={`px-3 py-2 rounded-xl bg-${category.color}-500/10 border border-${category.color}-500/20 cursor-pointer`}
                  onClick={() => setFilterCategory(filterCategory === catId ? 'all' : catId)}
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--color-${category.color}-500) 10%, transparent)`,
                    borderColor: `color-mix(in srgb, var(--color-${category.color}-500) 20%, transparent)`
                  }}
                >
                  <p className="text-xs text-zinc-400">{category.label}</p>
                  <p className="text-sm font-medium text-white">
                    {isHidden ? '••••' : formatCurrency(data.amount)}
                  </p>
                  <p className="text-xs text-zinc-500">{percentage.toFixed(1)}%</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar bolsillos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {POCKET_CATEGORIES.filter(c => c.id !== 'emergency').map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* New Pocket Button */}
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            showForm
              ? 'bg-zinc-700 text-white'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
          }`}
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Nuevo bolsillo
            </>
          )}
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PocketForm
              onSubmit={handleSubmit}
              initialData={editingPocket}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pockets Grid */}
      {filteredPockets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredPockets.map((pocket) => (
              <PocketItem
                key={pocket.id}
                pocket={pocket}
                movements={getPocketMovements(pocket.id)}
                onDeposit={onDeposit}
                onWithdraw={onWithdraw}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Wallet className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-400 mb-2">
            {pockets.length === 0
              ? 'No tienes bolsillos todavía'
              : 'No se encontraron bolsillos'}
          </h3>
          <p className="text-sm text-zinc-600 mb-4">
            {pockets.length === 0
              ? 'Crea tu primer bolsillo para empezar a ahorrar hacia tus metas'
              : 'Intenta con otros filtros de búsqueda'}
          </p>
          {pockets.length === 0 && !showForm && (
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear bolsillo
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}

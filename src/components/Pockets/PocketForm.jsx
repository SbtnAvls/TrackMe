import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Wallet, Shield, Plane, Car, Home, GraduationCap, Smartphone, Heart, Gift, PartyPopper, Palmtree, Briefcase } from 'lucide-react';
import { POCKET_CATEGORIES } from '../../db/database';
import { formatDateForInput } from '../../utils/formatters';

const iconMap = {
  Shield,
  Plane,
  Car,
  Home,
  GraduationCap,
  Smartphone,
  Heart,
  Gift,
  PartyPopper,
  Palmtree,
  Briefcase,
  Wallet
};

const colorClasses = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  zinc: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30'
};

export default function PocketForm({ onSubmit, initialData, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || 'other');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount || '');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState(initialData?.deadline ? formatDateForInput(initialData.deadline) : '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'other');
      setTargetAmount(initialData.targetAmount || '');
      setDeadline(initialData.deadline ? formatDateForInput(initialData.deadline) : '');
      setNotes(initialData.notes || '');
      setInitialAmount('');
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setName('');
    setCategory('other');
    setTargetAmount('');
    setInitialAmount('');
    setDeadline('');
    setNotes('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      category,
      targetAmount: targetAmount ? parseFloat(targetAmount) : 0,
      initialAmount: initialAmount ? parseFloat(initialAmount) : 0,
      deadline: deadline || null,
      notes: notes.trim()
    });

    if (!initialData) {
      resetForm();
    }
  };

  const selectedCategory = POCKET_CATEGORIES.find(c => c.id === category);
  const CategoryIcon = selectedCategory ? iconMap[selectedCategory.icon] : Wallet;

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
            <Wallet className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Editar bolsillo' : 'Nuevo bolsillo'}
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
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Nombre del bolsillo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Viaje a Europa, iPhone nuevo..."
            className="input-dark"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-3 gap-2">
            {POCKET_CATEGORIES.filter(c => c.id !== 'emergency').map((cat) => {
              const Icon = iconMap[cat.icon] || Wallet;
              const isSelected = category === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all border ${
                    isSelected ? colorClasses[cat.color] : 'bg-white/5 text-zinc-400 border-transparent hover:border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Meta a alcanzar
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0"
              className="input-dark pl-8"
            />
          </div>
        </div>

        {/* Initial Amount (only for new pockets) */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Monto inicial (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <input
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0"
                className="input-dark pl-8"
              />
            </div>
          </div>
        )}

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Fecha límite (opcional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input-dark"
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
            placeholder="Detalles, motivación, etc..."
            className="input-dark min-h-[60px] resize-none"
            rows={2}
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
        >
          <Plus className="w-5 h-5" />
          {initialData ? 'Actualizar' : 'Crear bolsillo'}
        </motion.button>
      </div>
    </motion.form>
  );
}

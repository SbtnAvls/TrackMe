import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getMonthName } from '../../utils/formatters';

export default function MonthSelector({ year, month, onChange }) {
  const handlePrevMonth = () => {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 glass rounded-2xl px-4 py-3"
    >
      <motion.button
        onClick={handlePrevMonth}
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-zinc-400" />
      </motion.button>

      <div className="flex items-center gap-3 min-w-[180px] justify-center">
        <Calendar className="w-5 h-5 text-purple-400" />
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-lg font-semibold text-white">
            {getMonthName(month)}
          </span>
          <span className="text-lg text-zinc-500 ml-2">{year}</span>
        </motion.div>
      </div>

      <motion.button
        onClick={handleNextMonth}
        whileHover={{ scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-zinc-400" />
      </motion.button>
    </motion.div>
  );
}

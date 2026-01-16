import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';

export default function Header() {
  const { isHidden, togglePrivacy } = usePrivacy();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-strong sticky top-0 z-50"
    >
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 p-2.5 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                ExpenseTracker
              </h1>
              <p className="text-xs text-zinc-500">Control financiero inteligente</p>
            </div>
          </motion.div>

          <motion.button
              onClick={togglePrivacy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                isHidden
                  ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                  : 'glass text-zinc-400 hover:text-white'
              }`}
              title={isHidden ? 'Mostrar valores' : 'Ocultar valores'}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isHidden ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isHidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.div>
              <span className="text-sm hidden sm:inline">
                {isHidden ? 'Oculto' : 'Visible'}
              </span>
            </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff, LogOut } from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { isHidden, togglePrivacy } = usePrivacy();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('No se pudo cerrar sesión', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-strong sticky top-0 z-50"
    >
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <motion.div
            className="flex items-center gap-2.5 min-w-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="relative shrink-0"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 p-2 rounded-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold gradient-text leading-tight">
                ExpenseTracker
              </h1>
              <p className="text-[10px] text-zinc-500 hidden sm:block">Control financiero inteligente</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              onClick={togglePrivacy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isHidden
                  ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                  : 'glass text-zinc-400 hover:text-white'
              }`}
              title={isHidden ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {isHidden ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </motion.button>

            {user && (
              <motion.div
                className="flex items-center gap-2 glass px-2 py-1.5 rounded-xl border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/20 bg-white/10 shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || user.email}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/40 to-purple-500/40 text-white">
                      <Wallet className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-xs font-medium text-white leading-tight truncate max-w-[120px]">
                    {user.displayName || user.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    Cerrar sesión
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="sm:hidden p-1 text-zinc-400 hover:text-white transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Shield, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { loginWithGoogle, isProcessing, error } = useAuth();
  const [localError, setLocalError] = useState(null);

  const errorMessage = useMemo(() => {
    if (localError) return localError;
    if (!error) return null;
    if (error.code === 'auth/popup-blocked') return 'Tu navegador bloqueó la ventana de Google. Por favor habilítala.';
    if (error.code === 'auth/popup-closed-by-user') return 'La ventana de Google se cerró antes de completar el login.';
    return 'No pudimos iniciar sesión. Intenta nuevamente.';
  }, [error, localError]);

  const handleLogin = async () => {
    setLocalError(null);

    try {
      await loginWithGoogle();
    } catch (loginError) {
      console.error(loginError);
      setLocalError('Ocurrió un error inesperado al autenticarte.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(circle_at_top,_rgba(99,_102,_241,_0.15),_transparent_50%),_radial-gradient(circle_at_bottom,_rgba(14,_165,_233,_0.15),_transparent_45%)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-2xl opacity-60 animate-pulse" />
            <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500/80 to-pink-500 p-4 rounded-2xl shadow-xl">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80 font-semibold">
              ExpenseTracker
            </p>
            <h2 className="text-2xl font-semibold text-white mt-2">Bienvenido</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Conéctate con tu cuenta de Google para sincronizar tus datos y mantenerlos seguros.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-zinc-300">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>Tu información está protegida mediante Firebase Authentication.</span>
          </div>
          <p className="text-xs text-zinc-500">
            Solo utilizamos tu nombre, correo y foto para personalizar tu experiencia. No compartimos tus datos con terceros.
          </p>
        </div>

        {errorMessage && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/40 px-4 py-3 rounded-2xl">
            {errorMessage}
          </div>
        )}

        <motion.button
          onClick={handleLogin}
          disabled={isProcessing}
          whileHover={!isProcessing ? { scale: 1.02 } : undefined}
          whileTap={!isProcessing ? { scale: 0.98 } : undefined}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
        >
          <LogIn className="w-5 h-5" />
          {isProcessing ? 'Conectando...' : 'Entrar con Google'}
        </motion.button>
      </motion.div>
    </div>
  );
}

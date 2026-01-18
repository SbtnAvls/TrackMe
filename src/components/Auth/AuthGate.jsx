import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginScreen from './LoginScreen';

export default function AuthGate({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="p-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
        >
          <Loader className="w-8 h-8 text-cyan-300" />
        </motion.div>
        <p className="text-sm text-zinc-400">Conectando con tu cuenta...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return children;
}

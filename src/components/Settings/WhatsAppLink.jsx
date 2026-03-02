import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Link, Unlink, X, Settings, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_TRACKME_API_URL || 'http://localhost:3003';

export default function WhatsAppLink() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [linkedNumber, setLinkedNumber] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check current link status when modal opens
  useEffect(() => {
    if (isOpen && user) {
      checkLinkStatus();
    }
  }, [isOpen, user]);

  const getAuthToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  const checkLinkStatus = async () => {
    setChecking(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/api/link-whatsapp`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.linked) {
        setIsLinked(true);
        setLinkedNumber(data.number);
      } else {
        setIsLinked(false);
        setLinkedNumber('');
      }
    } catch {
      // Silently fail - backend might not be running
    } finally {
      setChecking(false);
    }
  };

  const handleLink = async () => {
    if (!phoneNumber.trim()) {
      setError('Ingresa tu número de WhatsApp');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/api/link-whatsapp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al vincular');
        return;
      }

      setIsLinked(true);
      setLinkedNumber(data.number);
      setPhoneNumber('');
      setSuccess('WhatsApp vinculado correctamente');
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('¿Desvincular tu número de WhatsApp?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/api/link-whatsapp`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al desvincular');
        return;
      }

      setIsLinked(false);
      setLinkedNumber('');
      setSuccess('WhatsApp desvinculado');
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Settings button in header */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-xl glass text-zinc-400 hover:text-white transition-colors"
        title="Configuración"
      >
        <Settings className="w-4 h-4" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl p-5 w-full max-w-sm border border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-green-500/20 border border-green-500/20">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">WhatsApp</h3>
                    <p className="text-[10px] text-zinc-500">Registra gastos por chat</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checking ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                </div>
              ) : isLinked ? (
                /* Linked state */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-medium text-green-400">Vinculado</span>
                    </div>
                    <p className="text-sm text-white font-mono">{linkedNumber}</p>
                  </div>

                  <p className="text-xs text-zinc-400">
                    Envía mensajes como "gasté 30k en almuerzo" o fotos de recibos al WhatsApp de TrackMe para registrar transacciones.
                  </p>

                  <button
                    onClick={handleUnlink}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                    Desvincular
                  </button>
                </div>
              ) : (
                /* Unlinked state */
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Vincula tu número para registrar gastos e ingresos desde WhatsApp. Escribe o envía fotos de recibos.
                  </p>

                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Número de WhatsApp</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
                      placeholder="+57 300 123 4567"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">Incluye el código de país (ej: +57)</p>
                  </div>

                  <button
                    onClick={handleLink}
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
                    Vincular WhatsApp
                  </button>
                </div>
              )}

              {/* Error/Success messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                    <p className="text-[11px] text-red-400">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <Check className="w-3 h-3 text-green-400 shrink-0" />
                    <p className="text-[11px] text-green-400">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

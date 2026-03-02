import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Image, Loader2, Check, RotateCcw, Key, Eye, EyeOff, Trash2 } from 'lucide-react';
import { buildSystemPrompt, sendChatMessage } from '../../services/chatService';

export default function TransactionChat({ onSubmit, creditCards = [], apiKey, onSaveApiKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null); // { base64, mimeType, preview }
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const systemPrompt = buildSystemPrompt(creditCards);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingTransaction]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!apiKey) {
      setShowKeyInput(true);
    } else {
      setShowKeyInput(false);
      if (messages.length === 0) {
        setMessages([{ role: 'ai', text: '¿Qué movimiento quieres registrar? Puedes describirlo o enviar una foto de un recibo.' }]);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNewChat = () => {
    setMessages([{ role: 'ai', text: '¿Qué movimiento quieres registrar? Puedes describirlo o enviar una foto de un recibo.' }]);
    setConversationHistory([]);
    setPendingTransaction(null);
    setImage(null);
    setInput('');
    setSaved(false);
  };

  const handleSaveKey = () => {
    if (!keyInput.trim()) return;
    onSaveApiKey(keyInput.trim());
    setShowKeyInput(false);
    setKeyInput('');
    setMessages([{ role: 'ai', text: '¿Qué movimiento quieres registrar? Puedes describirlo o enviar una foto de un recibo.' }]);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setImage({
        base64,
        mimeType: file.type,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !image) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    // Add user message to display
    const userMsg = { role: 'user', text: text || '(imagen)', image: image?.preview || null };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const sentImage = image;
    setImage(null);
    setIsProcessing(true);

    try {
      // Build conversation with system prompt as first message
      const historyWithSystem = [
        { role: 'user', text: systemPrompt },
        { role: 'model', text: '{"status":"need_info","question":"¿Qué movimiento quieres registrar?"}' },
        ...conversationHistory
      ];

      const result = await sendChatMessage(
        apiKey,
        historyWithSystem,
        text,
        sentImage ? { base64: sentImage.base64, mimeType: sentImage.mimeType } : null
      );

      // Update conversation history for multi-turn
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', text: text || '(imagen adjunta)' },
        { role: 'model', text: JSON.stringify(result) }
      ]);

      if (result.status === 'ready' && result.transaction) {
        const tx = result.transaction;
        // Validate and clean
        tx.amount = parseFloat(tx.amount) || 0;
        tx.creditCardId = tx.creditCardId ? parseInt(tx.creditCardId) : null;
        if (tx.creditCardId) tx.paymentMethod = null;
        if (!tx.date) tx.date = new Date().toISOString().split('T')[0];
        if (!tx.paymentMethod && !tx.creditCardId) tx.paymentMethod = 'debit';

        setPendingTransaction(tx);
        setMessages(prev => [...prev, { role: 'ai', text: result.message || 'He extraído los datos. ¿Confirmas el registro?' }]);
      } else if (result.status === 'need_info') {
        setMessages(prev => [...prev, { role: 'ai', text: result.question }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'No pude interpretar la respuesta. Intenta de nuevo.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingTransaction) return;
    setIsProcessing(true);
    try {
      await onSubmit(pendingTransaction);
      setSaved(true);
      setMessages(prev => [...prev, { role: 'ai', text: 'Registrado correctamente.' }]);
      setPendingTransaction(null);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error al guardar. Intenta de nuevo.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    setPendingTransaction(null);
    setMessages(prev => [...prev, { role: 'ai', text: '¿Qué quieres corregir?' }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatAmount = (n) => `$${Number(n).toLocaleString('es-MX')}`;

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="glass w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '75vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/20">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Registro rápido</h3>
                    <p className="text-[10px] text-zinc-500">Describe o fotografía tu movimiento</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 1 && (
                    <motion.button
                      onClick={handleNewChat}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                      title="Nuevo chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-400"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* API Key Prompt */}
              {showKeyInput ? (
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                      <Key className="w-6 h-6 text-amber-400" />
                    </div>
                    <p className="text-sm text-zinc-300 font-medium">API Key de Gemini requerida</p>
                    <p className="text-xs text-zinc-500 mt-1">Se guardará en tu cuenta para futuros usos</p>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="input-dark pr-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Obtén tu API Key en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Google AI Studio</a>
                  </p>
                  <motion.button
                    onClick={handleSaveKey}
                    disabled={!keyInput.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guardar y continuar
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-violet-600/30 text-white rounded-br-md'
                            : 'bg-white/5 text-zinc-200 rounded-bl-md'
                        }`}>
                          {msg.image && (
                            <img src={msg.image} alt="Adjunto" className="rounded-lg mb-2 max-h-32 object-cover" />
                          )}
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        </div>
                      </div>
                    )}

                    {/* Transaction Preview Card */}
                    {pendingTransaction && !saved && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-violet-500/20 rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            pendingTransaction.type === 'income'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {pendingTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {formatAmount(pendingTransaction.amount)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="text-zinc-500">Categoría</div>
                          <div className="text-zinc-200 text-right">{pendingTransaction.category}</div>
                          {pendingTransaction.description && (
                            <>
                              <div className="text-zinc-500">Descripción</div>
                              <div className="text-zinc-200 text-right truncate">{pendingTransaction.description}</div>
                            </>
                          )}
                          <div className="text-zinc-500">Fecha</div>
                          <div className="text-zinc-200 text-right">{pendingTransaction.date}</div>
                          <div className="text-zinc-500">Método</div>
                          <div className="text-zinc-200 text-right">
                            {pendingTransaction.creditCardId
                              ? creditCards.find(c => String(c.id) === String(pendingTransaction.creditCardId))?.bank || 'Tarjeta'
                              : pendingTransaction.paymentMethod === 'cash' ? 'Efectivo' : 'Débito'}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <motion.button
                            onClick={handleConfirm}
                            whileTap={{ scale: 0.95 }}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Registrar
                          </motion.button>
                          <motion.button
                            onClick={handleReject}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Corregir
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Bar */}
                  {!saved ? (
                    <div className="border-t border-white/10 p-3">
                      {/* Image preview */}
                      {image && (
                        <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-white/5">
                          <img src={image.preview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                          <span className="text-xs text-zinc-400 flex-1 truncate">Imagen adjunta</span>
                          <button onClick={handleRemoveImage} className="text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <motion.button
                          onClick={() => fileInputRef.current?.click()}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-white/5 transition-colors shrink-0"
                        >
                          <Image className="w-5 h-5" />
                        </motion.button>
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ej: Gaste 30mil en uber"
                          disabled={isProcessing}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                        />
                        <motion.button
                          onClick={handleSend}
                          disabled={isProcessing || (!input.trim() && !image)}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-violet-600 text-white disabled:opacity-30 shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-white/10 p-3">
                      <motion.button
                        onClick={handleNewChat}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 rounded-lg bg-white/5 text-zinc-300 text-sm font-medium hover:bg-white/10 transition-colors"
                      >
                        Registrar otro movimiento
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

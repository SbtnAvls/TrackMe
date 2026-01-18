import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, FileWarning, Sparkles, TrendingUp, Shield, Wallet } from 'lucide-react';
import Header from './components/Layout/Header';
import MonthSelector from './components/Dashboard/MonthSelector';
import Summary from './components/Dashboard/Summary';
import CategoryChart from './components/Dashboard/CategoryChart';
import TransactionForm from './components/Transactions/TransactionForm';
import TransactionList from './components/Transactions/TransactionList';
import ExportButton from './components/Export/ExportButton';
import AIReportButton from './components/AIReport/AIReportButton';
import CreditCardForm from './components/CreditCards/CreditCardForm';
import CreditCardList from './components/CreditCards/CreditCardList';
import InvestmentForm from './components/Investments/InvestmentForm';
import InvestmentList from './components/Investments/InvestmentList';
import EmergencyFund from './components/EmergencyFund/EmergencyFund';
import PocketList from './components/Pockets/PocketList';
import DataSyncBanner from './components/Sync/DataSyncBanner';
import { useTransactions } from './hooks/useTransactions';
import { useCreditCards } from './hooks/useCreditCards';
import { useBalanceDistribution } from './hooks/useBalanceDistribution';
import { useInvestments } from './hooks/useInvestments';
import { useEmergencyFund } from './hooks/useEmergencyFund';
import { usePockets } from './hooks/usePockets';

function App() {
  const today = new Date();
  const [activeTab, setActiveTab] = useState('transactions');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const {
    transactions,
    summary,
    categoryData,
    accumulatedBalance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading: loadingTransactions
  } = useTransactions(year, month);

  const {
    creditCards,
    totalDebt,
    totalLimit,
    availableCredit,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    isLoading: loadingCards
  } = useCreditCards();

  const {
    distribution,
    saveDistribution,
    isLoading: loadingDistribution
  } = useBalanceDistribution();

  const {
    investments,
    totals: investmentTotals,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    isLoading: loadingInvestments
  } = useInvestments();

  // Calculate average monthly expense for emergency fund
  const averageMonthlyExpense = summary.totalExpense || 0;

  const {
    fund: emergencyFund,
    targetAmount: emergencyTargetAmount,
    progress: emergencyProgress,
    monthsCovered,
    amountNeeded: emergencyAmountNeeded,
    status: emergencyStatus,
    updateAmount: updateEmergencyAmount,
    updateTargetMonths,
    updateMonthlyExpense: updateEmergencyMonthlyExpense,
    addToFund,
    withdrawFromFund,
    isLoading: loadingEmergencyFund
  } = useEmergencyFund(averageMonthlyExpense);

  const {
    pockets,
    movements: pocketMovements,
    totals: pocketTotals,
    addPocket,
    updatePocket,
    deletePocket,
    depositToPocket,
    withdrawFromPocket,
    getPocketMovements,
    isLoading: loadingPockets
  } = usePockets();

  const handleMonthChange = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleSubmitTransaction = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    } else {
      await addTransaction(data);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      await deleteTransaction(id);
    }
  };

  const handleCancelEditTransaction = () => {
    setEditingTransaction(null);
  };

  const handleSubmitCard = async (data) => {
    if (editingCard) {
      await updateCreditCard(editingCard.id, data);
      setEditingCard(null);
    } else {
      await addCreditCard(data);
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      await deleteCreditCard(id);
    }
  };

  const handleCancelEditCard = () => {
    setEditingCard(null);
  };

  const handleSubmitInvestment = async (data) => {
    if (editingInvestment) {
      await updateInvestment(editingInvestment.id, data);
      setEditingInvestment(null);
    } else {
      await addInvestment(data);
    }
  };

  const handleEditInvestment = (investment) => {
    setEditingInvestment(investment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInvestment = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta inversión?')) {
      await deleteInvestment(id);
    }
  };

  const handleUpdateInvestmentPrice = async (id, newPrice) => {
    await updateInvestment(id, { currentPrice: newPrice });
  };

  const handleCancelEditInvestment = () => {
    setEditingInvestment(null);
  };

  if (loadingTransactions || loadingCards || loadingDistribution || loadingInvestments || loadingEmergencyFund || loadingPockets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/20"
          >
            <Sparkles className="w-8 h-8 text-violet-400" />
          </motion.div>
          <p className="text-zinc-400">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DataSyncBanner />

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-1.5"
        >
          <div className="flex gap-2">
            <motion.button
              onClick={() => setActiveTab('transactions')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span className="hidden sm:inline">Gastos e Ingresos</span>
              <span className="sm:hidden">Gastos</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('creditCards')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'creditCards'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileWarning className="w-5 h-5" />
              Deudas
              {totalDebt > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  {creditCards.length}
                </motion.span>
              )}
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('investments')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'investments'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="hidden sm:inline">Inversiones</span>
              <span className="sm:hidden">Inv.</span>
              {investments.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  {investments.length}
                </motion.span>
              )}
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('emergency')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'emergency'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Emergencia</span>
              <span className="sm:hidden">Emerg.</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('pockets')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'pockets'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:inline">Bolsillos</span>
              <span className="sm:hidden">Bols.</span>
              {pockets.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  {pockets.length}
                </motion.span>
              )}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'transactions' ? (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <MonthSelector
                  year={year}
                  month={month}
                  onChange={handleMonthChange}
                />
                <div className="flex items-center gap-2">
                  <AIReportButton
                    accumulatedBalance={accumulatedBalance}
                    creditCards={creditCards}
                    totalDebt={totalDebt}
                    currentYear={year}
                    currentMonth={month}
                  />
                  <ExportButton
                    transactions={transactions}
                    year={year}
                    month={month}
                  />
                </div>
              </div>

              <Summary
                  summary={summary}
                  accumulatedBalance={accumulatedBalance}
                  distribution={distribution}
                  onUpdateDistribution={saveDistribution}
                />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <TransactionForm
                    onSubmit={handleSubmitTransaction}
                    initialData={editingTransaction}
                    onCancel={editingTransaction ? handleCancelEditTransaction : null}
                    creditCards={creditCards}
                  />
                </div>

                <div className="lg:col-span-2">
                  <TransactionList
                    transactions={transactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    creditCards={creditCards}
                  />
                </div>
              </div>

              <CategoryChart
                categoryData={categoryData}
                summary={summary}
              />
            </motion.div>
          ) : activeTab === 'creditCards' ? (
            <motion.div
              key="creditCards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-1">
                <CreditCardForm
                  onSubmit={handleSubmitCard}
                  initialData={editingCard}
                  onCancel={editingCard ? handleCancelEditCard : null}
                />
              </div>

              <div className="lg:col-span-2">
                <CreditCardList
                  creditCards={creditCards}
                  totalDebt={totalDebt}
                  totalLimit={totalLimit}
                  availableCredit={availableCredit}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                />
              </div>
            </motion.div>
          ) : activeTab === 'investments' ? (
            <motion.div
              key="investments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-1">
                <InvestmentForm
                  onSubmit={handleSubmitInvestment}
                  initialData={editingInvestment}
                  onCancel={editingInvestment ? handleCancelEditInvestment : null}
                />
              </div>

              <div className="lg:col-span-2">
                <InvestmentList
                  investments={investments}
                  totals={investmentTotals}
                  onEdit={handleEditInvestment}
                  onDelete={handleDeleteInvestment}
                  onUpdatePrice={handleUpdateInvestmentPrice}
                />
              </div>
            </motion.div>
          ) : activeTab === 'emergency' ? (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <EmergencyFund
                fund={emergencyFund}
                targetAmount={emergencyTargetAmount}
                progress={emergencyProgress}
                monthsCovered={monthsCovered}
                amountNeeded={emergencyAmountNeeded}
                status={emergencyStatus}
                onUpdateAmount={updateEmergencyAmount}
                onUpdateTargetMonths={updateTargetMonths}
                onUpdateMonthlyExpense={updateEmergencyMonthlyExpense}
                onAddToFund={addToFund}
                onWithdrawFromFund={withdrawFromFund}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pockets"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PocketList
                pockets={pockets}
                movements={pocketMovements}
                totals={pocketTotals}
                onAddPocket={addPocket}
                onUpdatePocket={updatePocket}
                onDeletePocket={deletePocket}
                onDeposit={depositToPocket}
                onWithdraw={withdrawFromPocket}
                getPocketMovements={getPocketMovements}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

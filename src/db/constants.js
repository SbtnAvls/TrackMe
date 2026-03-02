export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Otros ingresos'
];

export const EXPENSE_CATEGORIES = [
  'Comida',
  'Transporte',
  'Entretenimiento',
  'Servicios',
  'Salud',
  'Educación',
  'Ropa',
  'Hogar',
  'Tecnología',
  'Desarrollo Personal',
  'Imprevistos',
  'Regalos',
  'Comisiones bancarias',
  'Intereses/Mora',
  'Otros gastos'
];

export const DEBT_PAYMENT_CATEGORY = 'Pago de deuda';
export const CARD_PAYMENT_CATEGORY = DEBT_PAYMENT_CATEGORY;

export const DEBT_TYPES = [
  { id: 'credit_card', label: 'Tarjeta de crédito', icon: 'CreditCard' },
  { id: 'person', label: 'Persona', icon: 'User' },
  { id: 'loan', label: 'Préstamo', icon: 'Landmark' },
  { id: 'other', label: 'Otro', icon: 'Wallet' }
];

export const INVESTMENT_TYPES = [
  { id: 'crypto', label: 'Criptomoneda', icon: 'Bitcoin', color: 'orange' },
  { id: 'stock', label: 'Acción', icon: 'LineChart', color: 'blue' },
  { id: 'etf', label: 'ETF / Fondo indexado', icon: 'TrendingUp', color: 'emerald' },
  { id: 'cdt', label: 'CDT', icon: 'Landmark', color: 'violet' },
  { id: 'forex', label: 'Divisa (USD, EUR)', icon: 'DollarSign', color: 'green' },
  { id: 'commodity', label: 'Commodity (Oro, PAXG)', icon: 'Gem', color: 'yellow' },
  { id: 'stablecoin', label: 'Stablecoin (USDT, USDC)', icon: 'Coins', color: 'cyan' },
  { id: 'bond', label: 'Bono', icon: 'FileText', color: 'slate' },
  { id: 'real_estate', label: 'Bienes raíces', icon: 'Home', color: 'amber' },
  { id: 'other', label: 'Otra inversión', icon: 'Wallet', color: 'zinc' }
];

export const POPULAR_SYMBOLS = {
  crypto: ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'AVAX', 'MATIC', 'LINK'],
  stock: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
  etf: ['SPY', 'VOO', 'QQQ', 'VTI', 'IVV', 'VEA', 'VWO', 'BND'],
  forex: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'],
  commodity: ['PAXG', 'XAU', 'XAG', 'GOLD'],
  stablecoin: ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD'],
  cdt: [],
  bond: [],
  real_estate: [],
  other: []
};

export const POCKET_CATEGORIES = [
  { id: 'emergency', label: 'Fondo de emergencia', icon: 'Shield', color: 'red' },
  { id: 'travel', label: 'Viaje', icon: 'Plane', color: 'blue' },
  { id: 'car', label: 'Vehículo', icon: 'Car', color: 'slate' },
  { id: 'home', label: 'Casa / Hogar', icon: 'Home', color: 'amber' },
  { id: 'education', label: 'Educación', icon: 'GraduationCap', color: 'indigo' },
  { id: 'tech', label: 'Tecnología', icon: 'Smartphone', color: 'cyan' },
  { id: 'health', label: 'Salud', icon: 'Heart', color: 'pink' },
  { id: 'gift', label: 'Regalo', icon: 'Gift', color: 'purple' },
  { id: 'event', label: 'Evento', icon: 'PartyPopper', color: 'orange' },
  { id: 'retirement', label: 'Retiro', icon: 'Palmtree', color: 'emerald' },
  { id: 'business', label: 'Negocio', icon: 'Briefcase', color: 'zinc' },
  { id: 'other', label: 'Otro', icon: 'Wallet', color: 'violet' }
];

export const EMERGENCY_FUND_TIPS = [
  {
    title: '¿Cuánto debería tener?',
    content: 'Los expertos recomiendan tener entre 3 y 6 meses de gastos mensuales. Si tu trabajo es inestable o eres freelancer, apunta a 6-12 meses.'
  },
  {
    title: '¿Dónde guardarlo?',
    content: 'En una cuenta de ahorros de fácil acceso, separada de tu cuenta principal. Evita inversiones de riesgo para este fondo.'
  },
  {
    title: '¿Cuándo usarlo?',
    content: 'Solo para verdaderas emergencias: pérdida de empleo, emergencias médicas, reparaciones urgentes del hogar o auto.'
  },
  {
    title: '¿Cómo empezar?',
    content: 'Comienza con una meta de $1,000 o un mes de gastos. Automatiza transferencias mensuales, aunque sean pequeñas.'
  },
  {
    title: 'No lo toques',
    content: 'Vacaciones, ofertas o compras no son emergencias. Si lo usas, tu primera prioridad debe ser reponerlo.'
  }
];

export const TRANSFER_TYPES = [
  { id: 'bank_to_cash', label: 'Banco a Efectivo', description: 'Retiro de banco a efectivo' },
  { id: 'credit_to_cash', label: 'Avance TC a Efectivo', description: 'Avance de tarjeta de crédito a efectivo' },
  { id: 'credit_to_debit', label: 'Avance TC a Banco', description: 'Avance de tarjeta de crédito a banco/débito' }
];

export const getCategories = (type) => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export function calculateSummary(transactions) {
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    creditCardExpense: 0
  };

  transactions.forEach(t => {
    if (t.type === 'income') {
      summary.totalIncome += t.amount;
    } else if (t.type === 'expense') {
      summary.totalExpense += t.amount;
      if (t.creditCardId) {
        summary.creditCardExpense += t.amount;
      }
    }
  });

  summary.balance = summary.totalIncome - summary.totalExpense;
  return summary;
}

export function calculateCategoryData(transactions) {
  const categoryMap = new Map();

  transactions.forEach(t => {
    if (t.type === 'income' || t.type === 'expense') {
      const key = `${t.type}-${t.category}`;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { category: t.category, type: t.type, amount: 0 });
      }
      categoryMap.get(key).amount += t.amount;
    }
  });

  return Array.from(categoryMap.values());
}

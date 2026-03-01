const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

export async function generateFinancialReport(financialData, apiKey) {
  const {
    summary,
    accumulatedBalance,
    transactions,
    creditCards,
    totalDebt,
    categoryData,
    dateRange,
    additionalContext,
    includeDetails,
    pockets,
    pocketTotals,
    investments,
    investmentTotals,
    emergencyFund
  } = financialData;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Formatear el período analizado
  const formatPeriod = () => {
    if (dateRange.type === 'month') {
      return `${monthNames[dateRange.startMonth]} ${dateRange.startYear}`;
    } else if (dateRange.type === 'range') {
      const start = `${monthNames[dateRange.startMonth]} ${dateRange.startYear}`;
      const end = `${monthNames[dateRange.endMonth]} ${dateRange.endYear}`;
      return `${start} - ${end}`;
    } else if (dateRange.type === 'year') {
      return `Año completo ${dateRange.startYear}`;
    }
    return 'Período no especificado';
  };

  // Preparar datos de categorías
  const expensesByCategory = categoryData
    .filter(c => c.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .map(c => `- ${c.category}: $${c.amount.toLocaleString('es-MX')}`)
    .join('\n');

  const incomesByCategory = categoryData
    .filter(c => c.type === 'income')
    .sort((a, b) => b.amount - a.amount)
    .map(c => `- ${c.category}: $${c.amount.toLocaleString('es-MX')}`)
    .join('\n');

  // Preparar datos de deudas
  const debtsInfo = creditCards.map(card => {
    const debtType = card.debtType === 'credit_card' ? 'Tarjeta de crédito' :
                     card.debtType === 'person' ? 'Deuda personal' :
                     card.debtType === 'loan' ? 'Préstamo' : 'Otra deuda';
    const balance = card.dynamicBalance ?? card.currentBalance ?? 0;
    const limit = card.creditLimit || 0;
    const usage = limit > 0 ? ((balance / limit) * 100).toFixed(1) : 'N/A';

    return `- ${card.bank} (${debtType}): Deuda $${balance.toLocaleString('es-MX')}${limit > 0 ? `, Límite $${limit.toLocaleString('es-MX')}, Uso ${usage}%` : ''}`;
  }).join('\n');

  // Transacciones del período
  const maxTransactions = includeDetails ? 100 : 20;
  const transactionsList = transactions
    .slice(0, maxTransactions)
    .map(t => {
      const type = t.type === 'income' ? '📈 Ingreso' :
                   t.type === 'card_payment' ? '💳 Pago deuda' : '📉 Gasto';
      const date = new Date(t.date).toLocaleDateString('es-MX');
      const desc = includeDetails && t.description ? ` — "${t.description}"` : '';
      const method = includeDetails && t.paymentMethod ? ` [${t.paymentMethod === 'cash' ? 'Efectivo' : 'Débito'}]` : '';
      return `- [${date}] ${type}: ${t.category} - $${t.amount.toLocaleString('es-MX')}${method}${desc}`;
    })
    .join('\n');

  // Datos detallados opcionales
  let detailedSections = '';
  if (includeDetails) {
    // Bolsillos
    if (pockets && pockets.length > 0) {
      const pocketsList = pockets.map(p => {
        const progress = p.targetAmount > 0 ? ((p.currentAmount / p.targetAmount) * 100).toFixed(1) : 'N/A';
        return `- ${p.name} (${p.category || 'otro'}): Ahorrado $${(p.currentAmount || 0).toLocaleString('es-MX')}${p.targetAmount ? ` / Meta $${p.targetAmount.toLocaleString('es-MX')} (${progress}%)` : ''}${p.notes ? ` — "${p.notes}"` : ''}`;
      }).join('\n');
      detailedSections += `\n### Bolsillos de ahorro\n${pocketsList}\n- Total ahorrado en bolsillos: $${(pocketTotals?.totalSaved || 0).toLocaleString('es-MX')}\n- Meta total: $${(pocketTotals?.totalTarget || 0).toLocaleString('es-MX')}\n`;
    }

    // Inversiones
    if (investments && investments.length > 0) {
      const investList = investments.map(inv => {
        const invested = inv.quantity * inv.purchasePrice;
        const current = inv.quantity * (inv.currentPrice || inv.purchasePrice);
        const profit = current - invested;
        const profitPct = invested > 0 ? ((profit / invested) * 100).toFixed(2) : '0';
        return `- ${inv.symbol || inv.name} (${inv.type}): ${inv.quantity} unidades, Invertido $${invested.toLocaleString('es-MX')}, Valor actual $${current.toLocaleString('es-MX')}, Rendimiento ${profit >= 0 ? '+' : ''}${profitPct}%${inv.notes ? ` — "${inv.notes}"` : ''}`;
      }).join('\n');
      detailedSections += `\n### Inversiones\n${investList}\n- Total invertido: $${(investmentTotals?.totalInvested || 0).toLocaleString('es-MX')}\n- Valor actual total: $${(investmentTotals?.totalCurrent || 0).toLocaleString('es-MX')}\n- Ganancia/Pérdida: $${(investmentTotals?.totalProfit || 0).toLocaleString('es-MX')} (${(investmentTotals?.totalProfitPercent || 0).toFixed(2)}%)\n`;
    }

    // Fondo de emergencia
    if (emergencyFund && emergencyFund.currentAmount > 0) {
      detailedSections += `\n### Fondo de emergencia\n- Monto actual: $${emergencyFund.currentAmount.toLocaleString('es-MX')}\n- Meta de meses: ${emergencyFund.targetMonths || 'No definida'}\n- Gasto mensual estimado: $${(emergencyFund.monthlyExpense || 0).toLocaleString('es-MX')}\n`;
    }
  }

  // Contexto adicional del usuario
  const additionalContextSection = additionalContext ? `
### Contexto adicional del usuario
${additionalContext}
` : '';

  const prompt = `Eres un asesor financiero experto y amigable. Analiza los siguientes datos financieros de un usuario y genera un reporte completo, detallado y personalizado en español.

## DATOS FINANCIEROS DEL USUARIO

### Período analizado
- Período: ${formatPeriod()}

### Resumen del período
- Ingresos totales: $${summary.totalIncome.toLocaleString('es-MX')}
- Gastos totales: $${summary.totalExpense.toLocaleString('es-MX')}
- Balance del período: $${summary.balance.toLocaleString('es-MX')} (${summary.balance >= 0 ? 'POSITIVO' : 'NEGATIVO'})
- Gastos con deuda/crédito: $${(summary.creditCardExpense || 0).toLocaleString('es-MX')}

### Balance acumulado total (histórico)
- Saldo disponible: $${accumulatedBalance.toLocaleString('es-MX')} (${accumulatedBalance >= 0 ? 'POSITIVO' : 'NEGATIVO'})

### Desglose de gastos por categoría
${expensesByCategory || 'No hay gastos registrados'}

### Desglose de ingresos por categoría
${incomesByCategory || 'No hay ingresos registrados'}

### Deudas registradas
${debtsInfo || 'No hay deudas registradas'}
- Deuda total actual: $${totalDebt.toLocaleString('es-MX')}

### Transacciones del período (hasta ${maxTransactions})
${transactionsList || 'No hay transacciones en este período'}
${detailedSections}
### Estadísticas
- Número de transacciones: ${transactions.length}
- Número de deudas activas: ${creditCards.length}
- Porcentaje de ingresos gastado: ${summary.totalIncome > 0 ? ((summary.totalExpense / summary.totalIncome) * 100).toFixed(1) : 0}%
- Tasa de ahorro: ${summary.totalIncome > 0 ? ((summary.balance / summary.totalIncome) * 100).toFixed(1) : 0}%
${additionalContextSection}
---

## GENERA EL SIGUIENTE REPORTE

Por favor genera un reporte financiero completo con las siguientes secciones. Usa emojis para hacerlo más visual y amigable:

### 1. 📊 RESUMEN EJECUTIVO
Un párrafo breve que resuma la situación financiera general del usuario.

### 2. 💪 FORTALEZAS FINANCIERAS
Lista las cosas positivas que está haciendo bien el usuario (si las hay).

### 3. ⚠️ ÁREAS DE PREOCUPACIÓN
Identifica problemas o áreas que necesitan atención urgente.

### 4. 📈 ANÁLISIS DE GASTOS
Analiza los patrones de gasto, identifica las categorías más altas y si son razonables.

### 5. 💳 ANÁLISIS DE DEUDAS
Evalúa la situación de deudas, niveles de utilización de crédito, y riesgos.

### 6. 🎯 RECOMENDACIONES ESPECÍFICAS
Da consejos concretos y accionables para mejorar la situación financiera.

### 7. 📋 PLAN DE ACCIÓN (30 días)
Crea un plan paso a paso para los próximos 30 días con acciones específicas.

### 8. 🏆 META SUGERIDA
Propón una meta financiera alcanzable basada en los datos.

### 9. 💡 TIP DEL MES
Un consejo financiero relevante para la situación del usuario.

---

IMPORTANTE:
- Sé específico con los números y porcentajes
- Si los datos muestran problemas serios, sé directo pero empático
- Si la situación es buena, felicita al usuario y sugiere cómo mejorar aún más
- Usa un tono amigable pero profesional
- Las recomendaciones deben ser prácticas y aplicables a la vida real
- Si no hay suficientes datos, menciona que se necesita más información para un análisis más preciso
- Adapta el análisis al período seleccionado (si es un mes, varios meses o un año completo)`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al generar el reporte');
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        report: data.candidates[0].content.parts[0].text
      };
    } else {
      throw new Error('Respuesta inválida de Gemini');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      success: false,
      error: error.message || 'Error al conectar con el servicio de IA'
    };
  }
}

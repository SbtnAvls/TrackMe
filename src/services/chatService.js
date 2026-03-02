import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../db/constants';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export function buildSystemPrompt(creditCards = []) {
  const today = new Date().toISOString().split('T')[0];

  const cardsInfo = creditCards.length > 0
    ? creditCards.map(c => `- ID: ${c.id}, Nombre: "${c.bank}"${c.lastFourDigits ? ` (****${c.lastFourDigits})` : ''}`).join('\n')
    : 'No hay deudas/tarjetas registradas.';

  return `Eres un asistente financiero que SOLO extrae datos de transacciones (gastos o ingresos) a partir de mensajes o imágenes del usuario. NO mantienes conversaciones generales.

## TU ÚNICA FUNCIÓN
Extraer: tipo (expense/income), monto, categoría, descripción, fecha y método de pago de lo que el usuario te diga o muestre.

## REGLAS ESTRICTAS
1. Si el usuario envía algo que NO es un gasto o ingreso, responde: {"status":"need_info","question":"Solo puedo ayudarte a registrar gastos o ingresos. ¿Qué movimiento quieres registrar?"}
2. Asume SIEMPRE estos valores por defecto si no se especifican:
   - fecha: "${today}" (hoy)
   - paymentMethod: "debit"
   - creditCardId: null
   - type: "expense" (si el contexto es ambiguo, asume gasto)
3. Si puedes determinar todos los campos, responde con status "ready"
4. Si falta información CRÍTICA (monto o categoría imposible de inferir), pregunta UNA sola cosa con status "need_info"
5. SIEMPRE responde en JSON válido, sin markdown, sin backticks

## CATEGORÍAS VÁLIDAS
Gastos: ${JSON.stringify(EXPENSE_CATEGORIES)}
Ingresos: ${JSON.stringify(INCOME_CATEGORIES)}

## DEUDAS/TARJETAS DEL USUARIO
${cardsInfo}
Si el usuario menciona pagar con tarjeta de crédito o una deuda específica, usa el creditCardId correspondiente y pon paymentMethod en null.

## FORMATO DE RESPUESTA (JSON)

Cuando tengas todos los datos:
{"status":"ready","transaction":{"type":"expense","amount":50000,"category":"Comida","description":"Almuerzo","date":"${today}","creditCardId":null,"paymentMethod":"debit"},"message":"Gasto de $50,000 en Comida registrado."}

Cuando necesites información:
{"status":"need_info","question":"¿Cuánto fue el monto?"}

## NOTAS
- Los montos en Colombia suelen ser grandes (miles/millones). "50k" = 50000, "1M" = 1000000, "mil" = 1000
- Si el usuario dice "pague" o "gaste", es un gasto. Si dice "me pagaron" o "recibi", es un ingreso
- Infiere la categoría del contexto: "uber" → Transporte, "almuerzo" → Comida, "netflix" → Entretenimiento, etc.
- Si hay una imagen de recibo/factura, extrae toda la información posible de ella
- description debe ser breve (máx 50 chars)`;
}

export async function sendChatMessage(apiKey, conversationHistory, userText, imageData = null) {
  const parts = [];

  if (userText) {
    parts.push({ text: userText });
  }

  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.base64
      }
    });
  }

  const contents = [
    ...conversationHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts
    }
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Error al comunicarse con Gemini');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Respuesta vacía de Gemini');
  }

  // Parse JSON from response (handle possible markdown wrapping)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If Gemini didn't return valid JSON, wrap it as a need_info response
    return { status: 'need_info', question: cleaned };
  }
}

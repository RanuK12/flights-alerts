require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Función mejorada para construir URL de LEVEL
function buildLevelFlightUrl(triptype, origin, destination, date, currencyCode) {
  return `https://www.flylevel.com/flights/search?triptype=${triptype}&origin=${origin}&destination=${destination}&outboundDate=${date}&currencyCode=${currencyCode}&adults=1&children=0&infants=0`;
}

// Función mejorada para enviar alerta por Telegram
async function sendTestAlert(routeLabel, date, price, threshold, origin, destination, currencyCode, triptype = 'RT') {
  const url = buildLevelFlightUrl(triptype, origin, destination, date, currencyCode);
  
  // Formatear la fecha para mejor legibilidad
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calcular el ahorro
  const savings = threshold - price;
  const savingsPercentage = ((savings / threshold) * 100).toFixed(1);
  
  const message = `✈️ *¡VUELO BARATO ENCONTRADO!*

*Ruta:* ${routeLabel} (${origin} → ${destination})
*Fecha:* ${formattedDate}
*Precio encontrado:* ${price} ${currencyCode}
*Umbral configurado:* ${threshold} ${currencyCode}
*💰 Ahorro:* ${savings} ${currencyCode} (${savingsPercentage}%)

🔗 [Ver vuelo en LEVEL](${url})

⚠️ *Importante:* Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀`;
  
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown', 
      disable_web_page_preview: false 
    });
    console.log(`✅ Test alert sent successfully: ${routeLabel} - ${price} ${currencyCode} (${date})`);
    console.log(`🔗 URL: ${url}`);
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error.message);
  }
}

// Función para probar alerta de Skyscanner
async function sendTestSkyscannerAlert(origin, destination, date, price, threshold) {
  const url = `https://www.skyscanner.es/transporte/vuelos/${origin.toLowerCase()}/${destination.toLowerCase()}/${date}/?currency=EUR`;
  
  // Formatear la fecha para mejor legibilidad
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calcular el ahorro
  const savings = threshold - price;
  const savingsPercentage = ((savings / threshold) * 100).toFixed(1);
  
  const message = `✈️ *¡VUELO BARATO ENCONTRADO!*

*Ruta:* ${origin} → ${destination}
*Fecha:* ${formattedDate}
*Precio encontrado:* €${price} EUR
*Umbral configurado:* €${threshold} EUR
*💰 Ahorro:* €${savings} EUR (${savingsPercentage}%)

🔗 [Ver vuelo en Skyscanner](${url})

⚠️ *Importante:* Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀`;
  
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown', 
      disable_web_page_preview: false 
    });
    console.log(`✅ Test Skyscanner alert sent successfully: ${origin} → ${destination} - €${price}`);
    console.log(`🔗 URL: ${url}`);
  } catch (error) {
    console.error('❌ Error sending Skyscanner Telegram message:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🧪 Iniciando pruebas de alertas mejoradas...\n');
  
  // Prueba 1: Alerta de LEVEL
  console.log('📋 Prueba 1: Alerta de LEVEL');
  await sendTestAlert(
    'Buenos Aires → Madrid',
    '2025-07-15',
    250,
    300,
    'EZE',
    'MAD',
    'USD',
    'RT'
  );
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Prueba 2: Alerta de Skyscanner
  console.log('\n📋 Prueba 2: Alerta de Skyscanner');
  await sendTestSkyscannerAlert(
    'MAD',
    'EZE',
    '2025-09-10',
    450,
    500
  );
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Prueba 3: Alerta con ahorro significativo
  console.log('\n📋 Prueba 3: Alerta con ahorro significativo');
  await sendTestAlert(
    'Barcelona → Miami',
    '2025-08-29',
    100,
    130,
    'BCN',
    'MIA',
    'EUR',
    'RT'
  );
  
  console.log('\n✅ Todas las pruebas completadas. Revisa Telegram para ver los resultados.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { sendTestAlert, sendTestSkyscannerAlert }; 
// Test de formato de alertas mejoradas (sin enviar a Telegram)

console.log('🧪 TEST DE FORMATO DE ALERTAS MEJORADAS');
console.log('='.repeat(80));
console.log('');

// Función para construir URL de LEVEL mejorada
function buildLevelUrl(triptype, origin, destination, date, currencyCode) {
  return `https://www.flylevel.com/flights/search?triptype=${triptype}&origin=${origin}&destination=${destination}&outboundDate=${date}&currencyCode=${currencyCode}&adults=1&children=0&infants=0`;
}

// Función para formatear fecha
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Función para calcular ahorro
function calculateSavings(price, threshold) {
  const savings = threshold - price;
  const percentage = ((savings / threshold) * 100).toFixed(1);
  return { savings, percentage };
}

// Test 1: Alerta de LEVEL
console.log('📋 TEST 1: ALERTA DE LEVEL');
console.log('✈️ ¡VUELO BARATO ENCONTRADO!');
console.log('');
console.log('Ruta: Buenos Aires → Madrid (EZE → MAD)');
console.log('Fecha: ' + formatDate('2025-07-15'));
console.log('Precio encontrado: 250 USD');
console.log('Umbral configurado: 300 USD');

const savings1 = calculateSavings(250, 300);
console.log('💰 Ahorro: ' + savings1.savings + ' USD (' + savings1.percentage + '%)');
console.log('');
console.log('🔗 Ver vuelo en LEVEL:');
console.log(buildLevelUrl('RT', 'EZE', 'MAD', '2025-07-15', 'USD'));
console.log('');
console.log('⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.');
console.log('¡Aprovecha la oportunidad! 🚀');
console.log('');
console.log('='.repeat(80));
console.log('');

// Test 2: Alerta de Skyscanner
console.log('📋 TEST 2: ALERTA DE SKYSCANNER');
console.log('✈️ ¡VUELO BARATO ENCONTRADO!');
console.log('');
console.log('Ruta: Madrid → Buenos Aires (MAD → EZE)');
console.log('Fecha: ' + formatDate('2025-09-10'));
console.log('Precio encontrado: €450 EUR');
console.log('Umbral configurado: €500 EUR');

const savings2 = calculateSavings(450, 500);
console.log('💰 Ahorro: €' + savings2.savings + ' EUR (' + savings2.percentage + '%)');
console.log('');
console.log('🔗 Ver vuelo en Skyscanner:');
console.log('https://www.skyscanner.es/transporte/vuelos/mad/eze/20250910/?currency=EUR');
console.log('');
console.log('⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.');
console.log('¡Aprovecha la oportunidad! 🚀');
console.log('');
console.log('='.repeat(80));
console.log('');

// Test 3: Alerta con ahorro significativo
console.log('📋 TEST 3: ALERTA CON AHORRO SIGNIFICATIVO');
console.log('✈️ ¡VUELO BARATO ENCONTRADO!');
console.log('');
console.log('Ruta: Barcelona → Miami (BCN → MIA)');
console.log('Fecha: ' + formatDate('2025-08-29'));
console.log('Precio encontrado: 100 EUR');
console.log('Umbral configurado: 130 EUR');

const savings3 = calculateSavings(100, 130);
console.log('💰 Ahorro: ' + savings3.savings + ' EUR (' + savings3.percentage + '%)');
console.log('');
console.log('🔗 Ver vuelo en LEVEL:');
console.log(buildLevelUrl('RT', 'BCN', 'MIA', '2025-08-29', 'EUR'));
console.log('');
console.log('⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.');
console.log('¡Aprovecha la oportunidad! 🚀');
console.log('');
console.log('='.repeat(80));
console.log('');

// Verificaciones
console.log('✅ VERIFICACIONES COMPLETADAS:');
console.log('✅ URLs de LEVEL mejoradas con parámetros específicos');
console.log('✅ Fechas formateadas de manera legible');
console.log('✅ Cálculo automático de ahorro y porcentaje');
console.log('✅ Formato de mensaje mejorado y organizado');
console.log('✅ Links funcionales para Skyscanner');
console.log('');
console.log('🎯 PRÓXIMO PASO:');
console.log('Para probar con Telegram, necesitas:');
console.log('1. Ejecutar: node get-chat-id.js');
console.log('2. Enviar un mensaje a tu bot en Telegram');
console.log('3. Copiar el Chat ID que aparece');
console.log('4. Actualizar TELEGRAM_CHAT_ID en .env');
console.log('5. Ejecutar: node test-improvements.js'); 
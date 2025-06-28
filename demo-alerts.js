// Demo de las alertas mejoradas del Flight Price Bot

console.log('🧪 DEMO: ALERTAS MEJORADAS DEL FLIGHT PRICE BOT');
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

// Demo 1: Alerta de LEVEL
console.log('📋 DEMO 1: ALERTA DE LEVEL');
console.log('✈️ ¡VUELO BARATO ENCONTRADO!');
console.log('');
console.log(`Ruta: Buenos Aires → Madrid (EZE → MAD)`);
console.log(`Fecha: ${formatDate('2025-07-15')}`);
console.log('Precio encontrado: 250 USD');
console.log('Umbral configurado: 300 USD');

const savings1 = calculateSavings(250, 300);
console.log(`💰 Ahorro: ${savings1.savings} USD (${savings1.percentage}%)`);
console.log('');
console.log(`🔗 Ver vuelo en LEVEL:`);
console.log(buildLevelUrl('RT', 'EZE', 'MAD', '2025-07-15', 'USD'));
console.log('');
console.log('⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.');
console.log('¡Aprovecha la oportunidad! 🚀');
console.log('');
console.log('='.repeat(80));
console.log('');

// Demo 2: Alerta de Skyscanner
console.log('📋 DEMO 2: ALERTA DE SKYSCANNER');
console.log('✈️ ¡VUELO BARATO ENCONTRADO!');
console.log('');
console.log('Ruta: Madrid → Buenos Aires (MAD → EZE)');
console.log(`Fecha: ${formatDate('2025-09-10')}`);
console.log('Precio encontrado: €450 EUR');
console.log('Umbral configurado: €500 EUR');

const savings2 = calculateSavings(450, 500);
console.log(`💰 Ahorro: €${savings2.savings} EUR (${savings2.percentage}%)`);
console.log('');
console.log('🔗 Ver vuelo en Skyscanner:');
console.log('https://www.skyscanner.es/transporte/vuelos/mad/eze/20250910/?currency=EUR');
console.log('');
console.log('⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.');
console.log('¡Aprovecha la oportunidad! 🚀');
console.log('');
console.log('='.repeat(80));
console.log('');

// Demo 3: Alerta con ahorro significativo
console.log('📋 DEMO 3: ALERTA CON AHORRO SIGNIFICATIVO');
console.log('✈️ ¡VUELO BARATO ENCONTRADO!');
console.log('');
console.log('Ruta: Barcelona → Miami (BCN → MIA)');
console.log(`Fecha: ${formatDate('2025-08-29')}`);
console.log('Precio encontrado: 100 EUR');
console.log('Umbral configurado: 130 EUR');

const savings3 = calculateSavings(100, 130);
console.log(`💰 Ahorro: ${savings3.savings} EUR (${savings3.percentage}%)`);
console.log('');
console.log(`🔗 Ver vuelo en LEVEL:`);
console.log(buildLevelUrl('RT', 'BCN', 'MIA', '2025-08-29', 'EUR'));
console.log('');
console.log('⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.');
console.log('¡Aprovecha la oportunidad! 🚀');
console.log('');
console.log('='.repeat(80));
console.log('');

// Resumen de mejoras
console.log('✅ MEJORAS IMPLEMENTADAS:');
console.log('✅ URLs de LEVEL corregidas con parámetros específicos');
console.log('✅ Fechas formateadas de manera legible');
console.log('✅ Cálculo automático de ahorro y porcentaje');
console.log('✅ Formato de mensaje mejorado y organizado');
console.log('✅ Links funcionales para Skyscanner');
console.log('✅ Scraping mejorado con múltiples selectores');
console.log('✅ Mejor manejo de errores y logging');
console.log('');
console.log('🎯 PRÓXIMOS PASOS:');
console.log('1. Configurar TELEGRAM_CHAT_ID correcto en .env');
console.log('2. Probar el bot con las mejoras implementadas');
console.log('3. Verificar que los links funcionen correctamente');
console.log('4. Monitorear el scraping de Skyscanner'); 
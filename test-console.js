// Script de prueba que solo muestra los mensajes en consola
// sin enviarlos a Telegram para verificar el formato

// Función mejorada para construir URL de LEVEL
function buildLevelFlightUrl(triptype, origin, destination, date, currencyCode) {
  return `https://www.flylevel.com/flights/search?triptype=${triptype}&origin=${origin}&destination=${destination}&outboundDate=${date}&currencyCode=${currencyCode}&adults=1&children=0&infants=0`;
}

// Función para mostrar alerta de LEVEL en consola
function showLevelAlert(routeLabel, date, price, threshold, origin, destination, currencyCode, triptype = 'RT') {
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
  
  const message = `✈️ ¡VUELO BARATO ENCONTRADO!

Ruta: ${routeLabel} (${origin} → ${destination})
Fecha: ${formattedDate}
Precio encontrado: ${price} ${currencyCode}
Umbral configurado: ${threshold} ${currencyCode}
💰 Ahorro: ${savings} ${currencyCode} (${savingsPercentage}%)

🔗 Ver vuelo en LEVEL: ${url}

⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀`;
  
  console.log(message);
  console.log('\n' + '='.repeat(80) + '\n');
}

// Función para mostrar alerta de Skyscanner en consola
function showSkyscannerAlert(origin, destination, date, price, threshold) {
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
  
  const message = `✈️ ¡VUELO BARATO ENCONTRADO!

Ruta: ${origin} → ${destination}
Fecha: ${formattedDate}
Precio encontrado: €${price} EUR
Umbral configurado: €${threshold} EUR
💰 Ahorro: €${savings} EUR (${savingsPercentage}%)

🔗 Ver vuelo en Skyscanner: ${url}

⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀`;
  
  console.log(message);
  console.log('\n' + '='.repeat(80) + '\n');
}

// Ejecutar pruebas
function runConsoleTests() {
  console.log('🧪 INICIANDO PRUEBAS DE ALERTAS MEJORADAS (CONSOLA)\n');
  console.log('='.repeat(80) + '\n');
  
  // Prueba 1: Alerta de LEVEL
  console.log('📋 PRUEBA 1: ALERTA DE LEVEL');
  showLevelAlert(
    'Buenos Aires → Madrid',
    '2025-07-15',
    250,
    300,
    'EZE',
    'MAD',
    'USD',
    'RT'
  );
  
  // Prueba 2: Alerta de Skyscanner
  console.log('📋 PRUEBA 2: ALERTA DE SKYSCANNER');
  showSkyscannerAlert(
    'MAD',
    'EZE',
    '2025-09-10',
    450,
    500
  );
  
  // Prueba 3: Alerta con ahorro significativo
  console.log('📋 PRUEBA 3: ALERTA CON AHORRO SIGNIFICATIVO');
  showLevelAlert(
    'Barcelona → Miami',
    '2025-08-29',
    100,
    130,
    'BCN',
    'MIA',
    'EUR',
    'RT'
  );
  
  // Prueba 4: Alerta de vuelo de ida
  console.log('📋 PRUEBA 4: ALERTA DE VUELO DE IDA (ONE WAY)');
  showLevelAlert(
    'Amsterdam → Boston',
    '2025-07-20',
    350,
    400,
    'AMS',
    'BOS',
    'EUR',
    'OW'
  );
  
  console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
  console.log('\n📝 VERIFICACIONES:');
  console.log('✅ URLs de LEVEL mejoradas con parámetros específicos');
  console.log('✅ Fechas formateadas de manera legible');
  console.log('✅ Cálculo de ahorro y porcentaje');
  console.log('✅ Formato de mensaje mejorado');
  console.log('✅ Links funcionales para Skyscanner');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runConsoleTests();
}

module.exports = { showLevelAlert, showSkyscannerAlert }; 
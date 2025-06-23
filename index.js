require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const { insertPrice } = require('./database');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PRICE_THRESHOLD = parseInt(process.env.PRICE_THRESHOLD, 10) || 300;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Configuración de rutas base
const baseRoutes = [
  {
    name: 'EZE-MAD',
    origin: 'EZE',
    destination: 'MAD',
    routeLabel: 'Buenos Aires → Madrid'
  },
  {
    name: 'EZE-BCN',
    origin: 'EZE',
    destination: 'BCN',
    routeLabel: 'Buenos Aires → Barcelona'
  }
];

// Meses a consultar (julio a octubre 2025)
const months = [7, 8, 9, 10];
const year = 2025;

// Genera todas las combinaciones de rutas y meses
function generateRoutes() {
  const routes = [];
  for (const base of baseRoutes) {
    for (const month of months) {
      // outboundDate: primer día del mes
      const outboundDate = `${year}-${String(month).padStart(2, '0')}-01`;
      routes.push({
        name: base.name,
        url: `https://www.flylevel.com/nwe/flights/api/calendar/?triptype=RT&origin=${base.origin}&destination=${base.destination}&outboundDate=${outboundDate}&month=${String(month).padStart(2, '0')}&year=${year}&currencyCode=USD`,
        routeLabel: base.routeLabel,
        month: String(month).padStart(2, '0'),
        year: year
      });
    }
  }
  return routes;
}

const routes = generateRoutes();

// Función para consultar la API de LEVEL y obtener los precios por día
async function fetchLevelDayPrices(route) {
  try {
    const response = await axios.get(route.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.flylevel.com/',
        'Origin': 'https://www.flylevel.com',
        // 'Cookie': 'NOMBRE=VALOR; OTRA=VALOR2' // Descomenta y pega tus cookies aquí si sigue el 403
      }
    });
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.dayPrices)
    ) {
      return response.data.data.dayPrices.map(day => ({
        date: day.date,
        price: day.price
      }));
    } else {
      console.error(`Respuesta inesperada de la API para ${route.name} (${route.month}/${route.year})`);
      return [];
    }
  } catch (error) {
    console.error(`Error consultando la API de LEVEL para ${route.name} (${route.month}/${route.year}):`, error.message);
    return [];
  }
}

// Función para enviar alerta por Telegram
async function sendTelegramAlert(routeLabel, date, price, threshold) {
  const message = `🚨 *ALERTA DE PRECIO BAJO*\nRuta: ${routeLabel}\nFecha: ${date}\nPrecio: $${price} USD\nUmbral: $${threshold} USD\n¡Es un buen momento para reservar tu vuelo!`;
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`Alerta enviada: ${routeLabel} - $${price} (${date})`);
  } catch (error) {
    console.error('Error al enviar mensaje de Telegram:', error.message);
  }
}

// Función principal de chequeo de precios
async function checkPrices() {
  for (const route of routes) {
    const dayPrices = await fetchLevelDayPrices(route);
    for (const day of dayPrices) {
      try {
        await insertPrice(route.name, day.date, day.price);
        if (day.price < PRICE_THRESHOLD) {
          await sendTelegramAlert(route.routeLabel, day.date, day.price, PRICE_THRESHOLD);
        } else {
          console.log(`Precio para ${route.routeLabel} el ${day.date}: $${day.price} (sin alerta)`);
        }
      } catch (err) {
        console.error('Error guardando o notificando:', err.message);
      }
    }
  }
}

// Enviar alerta de prueba al iniciar el bot
(async () => {
  await sendTelegramAlert('Prueba de alerta', '2025-07-01', 123, 300);
})();

// Programar el cronjob cada 2 minutos
cron.schedule('*/2 * * * *', () => {
  console.log('Ejecutando chequeo de precios:', new Date().toLocaleString());
  checkPrices();
});

// Ejecutar una vez al iniciar
checkPrices();
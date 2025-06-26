require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const { insertPrice, initDb } = require('./database');

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
    routeLabel: 'Buenos Aires → Madrid',
    triptype: 'RT',
    currencyCode: 'USD',
    threshold: 300
  },
  {
    name: 'EZE-BCN',
    origin: 'EZE',
    destination: 'BCN',
    routeLabel: 'Buenos Aires → Barcelona',
    triptype: 'RT',
    currencyCode: 'USD',
    threshold: 300
  },
  {
    name: 'BCN-MIA',
    origin: 'BCN',
    destination: 'MIA',
    routeLabel: 'Barcelona → Miami',
    triptype: 'RT',
    currencyCode: 'EUR',
    threshold: 130,
    outboundDate: '2025-08-29',
    months: ['09'],
    year: 2025
  },
  {
    name: 'AMS-BOS',
    origin: 'AMS',
    destination: 'BOS',
    routeLabel: 'Amsterdam → Boston',
    triptype: 'OW',
    currencyCode: 'EUR',
    threshold: 400,
    months: ['07'],
    year: 2025
  }
];

// Meses a consultar (julio a octubre 2025)
const defaultMonths = [7, 8, 9, 10];
const defaultYear = 2025;

// Genera todas las combinaciones de rutas y meses
function generateRoutes() {
  const routes = [];
  for (const base of baseRoutes) {
    const months = base.months || defaultMonths.map(m => String(m).padStart(2, '0'));
    const year = base.year || defaultYear;
    for (const month of months) {
      // outboundDate: primer día del mes, salvo que se especifique
      const outboundDate = base.outboundDate || `${year}-${String(month).padStart(2, '0')}-01`;
      routes.push({
        name: base.name,
        url: `https://www.flylevel.com/nwe/flights/api/calendar/?triptype=${base.triptype}&origin=${base.origin}&destination=${base.destination}&outboundDate=${outboundDate}&month=${month}&year=${year}&currencyCode=${base.currencyCode}`,
        routeLabel: base.routeLabel,
        month: month,
        year: year,
        origin: base.origin,
        destination: base.destination,
        threshold: base.threshold,
        currencyCode: base.currencyCode,
        triptype: base.triptype
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
async function sendTelegramAlert(routeLabel, date, price, threshold, origin, destination, currencyCode, triptype = 'RT') {
  // Construir el link exacto al vuelo encontrado
  const url = `https://www.flylevel.com/flights/results?triptype=${triptype}&origin=${origin}&destination=${destination}&outboundDate=${date}&currencyCode=${currencyCode}`;

  const message = `🚨 *LOW PRICE ALERT*\n` +
    `*Route:* ${routeLabel}\n` +
    `*From:* ${origin}\n` +
    `*To:* ${destination}\n` +
    `*Date:* ${date}\n` +
    `*Price:* ${price} ${currencyCode}\n` +
    `*Threshold:* ${threshold} ${currencyCode}\n` +
    `🔗 [View Flight](${url})\n` +
    `It's a great time to book your flight!`;

  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown', disable_web_page_preview: false });
    console.log(`Alert sent: ${routeLabel} - ${price} (${date})`);
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
  }
}

// Función principal de chequeo de precios
async function checkPrices() {
  for (const route of routes) {
    const dayPrices = await fetchLevelDayPrices(route);
    for (const day of dayPrices) {
      try {
        await insertPrice(route.name, day.date, day.price);
        if (day.price < route.threshold) {
          await sendTelegramAlert(
            route.routeLabel,
            day.date,
            day.price,
            route.threshold,
            route.origin,
            route.destination,
            route.currencyCode,
            route.triptype
          );
        } else {
          console.log(`Precio para ${route.routeLabel} el ${day.date}: ${day.price} (${route.currencyCode}) (sin alerta)`);
        }
      } catch (err) {
        console.error('Error guardando o notificando:', err.message);
      }
    }
  }
}

// Inicializar la base de datos y arrancar el bot
initDb().then(() => {
  // Programar el cronjob cada 2 minutos
  cron.schedule('*/2 * * * *', () => {
    console.log('Ejecutando chequeo de precios:', new Date().toLocaleString());
    checkPrices();
  });

  // Ejecutar una vez al iniciar
  checkPrices();

  // Enviar alerta de prueba al iniciar el bot
  (async () => {
    await sendTelegramAlert('Prueba de alerta', '2025-07-01', 123, 300, 'EZE', 'MAD', 'USD');
  })();
});
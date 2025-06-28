require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const { insertPrice, initDb } = require('./database');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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

// --- MEJORAR MENSAJE DE ALERTA Y LINK ---
// Para LEVEL, el link debe llevar a la búsqueda general si la URL exacta no existe
function buildLevelFlightUrl(triptype, origin, destination, date, currencyCode) {
  // Link mejorado a la búsqueda de LEVEL con parámetros más específicos
  const formattedDate = date.replace(/-/g, '');
  return `https://www.flylevel.com/flights/search?triptype=${triptype}&origin=${origin}&destination=${destination}&outboundDate=${date}&currencyCode=${currencyCode}&adults=1&children=0&infants=0`;
}

// Función para enviar alerta por Telegram
async function sendTelegramAlert(routeLabel, date, price, threshold, origin, destination, currencyCode, triptype = 'RT') {
  // Construir el link a la búsqueda general de LEVEL
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
    console.log(`Alert sent: ${routeLabel} - ${price} ${currencyCode} (${date})`);
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
        if (typeof day.price === 'number' && !isNaN(day.price) && day.price < route.threshold) {
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
        } else if (typeof day.price !== 'number' || isNaN(day.price)) {
          console.warn(`Precio inválido para ${route.routeLabel} el ${day.date}:`, day.price);
        } else {
          console.log(`Precio para ${route.routeLabel} el ${day.date}: ${day.price} (${route.currencyCode}) (sin alerta)`);
        }
      } catch (err) {
        console.error('Error guardando o notificando:', err.message);
      }
    }
  }
}

// --- INTEGRACIÓN SCRAPER SKYSCANNER ---
const SKYSCANNER_ORIGINS = ['FCO', 'MAD', 'BCN'];
const SKYSCANNER_DESTINATIONS = ['EZE', 'COR'];
const SKYSCANNER_YEAR = 2025;
const SKYSCANNER_MONTH = '09'; // septiembre
const SKYSCANNER_DAY = '10'; // día fijo o null para todo el mes
const SKYSCANNER_CURRENCY = 'EUR';
const SKYSCANNER_THRESHOLD = 500;

function buildSkyscannerUrl(origin, destination, year, month, day = null) {
  if (day) {
    return `https://www.skyscanner.es/transporte/vuelos/${origin.toLowerCase()}/${destination.toLowerCase()}/${year}${month}${day}/?currency=${SKYSCANNER_CURRENCY}`;
  } else {
    return `https://www.skyscanner.es/transporte/vuelos/${origin.toLowerCase()}/${destination.toLowerCase()}/${year}${month}/?currency=${SKYSCANNER_CURRENCY}`;
  }
}

async function scrapeSkyscanner(origin, destination, year, month, day = null) {
  const url = buildSkyscannerUrl(origin, destination, year, month, day);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--window-size=1200,800',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      defaultViewport: {
        width: 1200,
        height: 800
      }
    });
    
    const page = await browser.newPage();
    
    // Configurar user agent más realista
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Configurar headers adicionales
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Navegar a la página
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Espera aleatoria para simular comportamiento humano
    await new Promise(res => setTimeout(res, 4000 + Math.random() * 3000));
    
    // Intentar múltiples selectores para encontrar precios
    let prices = [];
    const selectors = [
      '[data-test-id="listing-card-wrapper"] [data-test-id="price-text"]',
      '[data-test-id="price-text"]',
      '.price-text',
      '[data-testid="price-text"]',
      '.BpkText_bpk-text__',
      '.BpkText_bpk-text__2NhLt',
      '[class*="price"]',
      '[class*="Price"]',
      '.price',
      '.Price'
    ];
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        const foundPrices = await page.$$eval(selector, nodes =>
          nodes.map(n => {
            const text = n.textContent || n.innerText || '';
            const price = parseInt(text.replace(/[^0-9]/g, ''));
            return isNaN(price) ? null : price;
          }).filter(p => p !== null)
        );
        if (foundPrices.length > 0) {
          prices = foundPrices;
          console.log(`Found ${prices.length} prices using selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
        continue;
      }
    }
    
    // Si no encontramos precios con selectores específicos, intentar extraer de todo el texto
    if (prices.length === 0) {
      console.log('Trying alternative price extraction method...');
      const pageText = await page.evaluate(() => document.body.innerText);
      const priceMatches = pageText.match(/€\s*(\d+)/g) || pageText.match(/(\d+)\s*EUR/g);
      if (priceMatches) {
        prices = priceMatches.map(match => {
          const price = parseInt(match.replace(/[^0-9]/g, ''));
          return isNaN(price) ? null : price;
        }).filter(p => p !== null);
      }
    }
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    
    if (minPrice) {
      console.log(`Successfully scraped ${origin} → ${destination}: €${minPrice}`);
    } else {
      console.log(`No prices found for ${origin} → ${destination}`);
    }
    
    await browser.close();
    return { url, minPrice };
    
  } catch (error) {
    if (browser) await browser.close();
    console.error(`Error scraping Skyscanner for ${origin} → ${destination}:`, error.message);
    return { url, minPrice: null };
  }
}

async function checkSkyscannerAndAlert() {
  for (const origin of SKYSCANNER_ORIGINS) {
    for (const destination of SKYSCANNER_DESTINATIONS) {
      const { url, minPrice } = await scrapeSkyscanner(origin, destination, SKYSCANNER_YEAR, SKYSCANNER_MONTH, SKYSCANNER_DAY);
      let diasInvalidos = [];
      if (typeof minPrice === 'number' && !isNaN(minPrice) && minPrice < SKYSCANNER_THRESHOLD) {
        const flightDate = SKYSCANNER_DAY ? `${SKYSCANNER_YEAR}-${SKYSCANNER_MONTH}-${SKYSCANNER_DAY}` : `${SKYSCANNER_YEAR}-${SKYSCANNER_MONTH}`;
        
        // Formatear la fecha para mejor legibilidad
        const formattedDate = SKYSCANNER_DAY 
          ? new Date(flightDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : `${SKYSCANNER_YEAR} - ${new Date(flightDate).toLocaleDateString('es-ES', { month: 'long' })}`;
        
        // Calcular el ahorro
        const savings = SKYSCANNER_THRESHOLD - minPrice;
        const savingsPercentage = ((savings / SKYSCANNER_THRESHOLD) * 100).toFixed(1);
        
        const message = `✈️ *¡VUELO BARATO ENCONTRADO!*

*Ruta:* ${origin} → ${destination}
*Fecha:* ${formattedDate}
*Precio encontrado:* €${minPrice} EUR
*Umbral configurado:* €${SKYSCANNER_THRESHOLD} EUR
*💰 Ahorro:* €${savings} EUR (${savingsPercentage}%)

🔗 [Ver vuelo en Skyscanner](${url})

⚠️ *Importante:* Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀`;
        
        try {
          await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
            parse_mode: 'Markdown', 
            disable_web_page_preview: false 
          });
          console.log(`Skyscanner alert sent: ${origin} → ${destination} - €${minPrice}`);
        } catch (error) {
          console.error('Error sending Skyscanner Telegram message:', error.message);
        }
      } else if (typeof minPrice !== 'number' || isNaN(minPrice)) {
        diasInvalidos.push(SKYSCANNER_DAY ? `${SKYSCANNER_YEAR}-${SKYSCANNER_MONTH}-${SKYSCANNER_DAY}` : `${SKYSCANNER_YEAR}-${SKYSCANNER_MONTH}`);
        console.log(`No se encontraron precios válidos para ${origin} → ${destination}`);
      } else {
        console.log(`Precio para ${origin} → ${destination}: €${minPrice} (sin alerta)`);
      }
      
      if (diasInvalidos.length > 5) {
        console.warn(`No se encontraron precios válidos para: ${diasInvalidos.join(', ')}`);
      }
      
      // Espera aleatoria entre búsquedas para evitar detección
      await new Promise(res => setTimeout(res, 5000 + Math.random() * 3000));
    }
  }
}

// Inicializar la base de datos y arrancar el bot
initDb().then(() => {
  // Programar el cronjob cada 15 minutos
  cron.schedule('*/15 * * * *', () => {
    console.log('Ejecutando chequeo de precios:', new Date().toLocaleString());
    checkPrices();
    checkSkyscannerAndAlert();
  });

  // Ejecutar una vez al iniciar
  checkPrices();
  checkSkyscannerAndAlert();

  // Enviar alerta de prueba al iniciar el bot
  (async () => {
    await sendTelegramAlert('Prueba de alerta', '2025-07-01', 123, 300, 'EZE', 'MAD', 'USD');
  })();
});
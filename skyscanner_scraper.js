const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Configuración de rutas y parámetros
const ORIGINS = ['FCO', 'MAD', 'BCN'];
const DESTINATIONS = ['EZE', 'COR'];
const YEAR = 2025;
const MONTH = '09'; // septiembre (puedes parametrizar)
const DAY = '10'; // día fijo o null para todo el mes
const CURRENCY = 'EUR';
const PRICE_THRESHOLD = 500; // umbral para vuelos a Argentina

// Construye la URL de Skyscanner para la búsqueda
function buildSkyscannerUrl(origin, destination, year, month, day = null) {
  if (day) {
    // Día específico
    return `https://www.skyscanner.es/transporte/vuelos/${origin.toLowerCase()}/${destination.toLowerCase()}/${year}${month}${day}/?currency=${CURRENCY}`;
  } else {
    // Todo el mes
    return `https://www.skyscanner.es/transporte/vuelos/${origin.toLowerCase()}/${destination.toLowerCase()}/${year}${month}/?currency=${CURRENCY}`;
  }
}

async function scrapeSkyscanner(origin, destination, year, month, day = null) {
  const url = buildSkyscannerUrl(origin, destination, year, month, day);
  const browser = await puppeteer.launch({
    headless: false, // true es más detectable, false simula usuario
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1200,800'
    ],
    defaultViewport: {
      width: 1200,
      height: 800
    }
  });
  const page = await browser.newPage();
  // User-Agent realista
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
  // Navegación
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  // Espera aleatoria para simular humano
  await new Promise(res => setTimeout(res, 3000 + Math.random() * 2000));

  // Espera a que aparezcan los precios (selector puede cambiar)
  await page.waitForSelector('[data-test-id="listing-card-wrapper"]', { timeout: 60000 });

  // Extrae precios
  const prices = await page.$$eval('[data-test-id="listing-card-wrapper"] [data-test-id="price-text"]', nodes =>
    nodes.map(n => parseInt(n.textContent.replace(/[^0-9]/g, '')))
  );

  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  await browser.close();
  return { url, minPrice };
}

// Ejemplo de uso: busca todas las combinaciones y alerta si hay precio bajo
(async () => {
  for (const origin of ORIGINS) {
    for (const destination of DESTINATIONS) {
      const { url, minPrice } = await scrapeSkyscanner(origin, destination, YEAR, MONTH, DAY);
      if (minPrice && minPrice < PRICE_THRESHOLD) {
        const flightDate = DAY ? `${YEAR}-${MONTH}-${DAY}` : `${YEAR}-${MONTH}`;
        const flightUrl = buildSkyscannerUrl(origin, destination, YEAR, MONTH, DAY);
        const alertMsg = `🚨 LOW PRICE ALERT\n` +
          `Route: ${origin} → ${destination}\n` +
          `Date: ${flightDate}\n` +
          `Price: €${minPrice} EUR\n` +
          `Threshold: €${PRICE_THRESHOLD} EUR\n` +
          `🔗 [View Flight](${flightUrl})\n` +
          `It's a great time to book your flight!`;
        console.log(alertMsg);
        // Aquí puedes integrar con Telegram o email
      } else {
        console.log(`Precio más bajo de ${origin} a ${destination}: ${minPrice ? minPrice + ' ' + CURRENCY : 'No encontrado'} (${url})`);
      }
      // Espera aleatoria entre búsquedas
      await new Promise(res => setTimeout(res, 5000 + Math.random() * 3000));
    }
  }
})(); 
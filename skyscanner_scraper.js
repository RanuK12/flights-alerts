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
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true, // Cambiado a true para producción
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1200,800'
      ],
      defaultViewport: {
        width: 1200,
        height: 800
      }
    });
    
    const page = await browser.newPage();
    
    // User-Agent más realista
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
    
    // Navegación
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Espera aleatoria para simular humano
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

// Ejemplo de uso: busca todas las combinaciones y alerta si hay precio bajo
(async () => {
  for (const origin of ORIGINS) {
    for (const destination of DESTINATIONS) {
      const { url, minPrice } = await scrapeSkyscanner(origin, destination, YEAR, MONTH, DAY);
      
      if (minPrice && minPrice < PRICE_THRESHOLD) {
        const flightDate = DAY ? `${YEAR}-${MONTH}-${DAY}` : `${YEAR}-${MONTH}`;
        
        // Formatear la fecha para mejor legibilidad
        const formattedDate = DAY 
          ? new Date(flightDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : `${YEAR} - ${new Date(flightDate).toLocaleDateString('es-ES', { month: 'long' })}`;
        
        // Calcular el ahorro
        const savings = PRICE_THRESHOLD - minPrice;
        const savingsPercentage = ((savings / PRICE_THRESHOLD) * 100).toFixed(1);
        
        const alertMsg = `✈️ *¡VUELO BARATO ENCONTRADO!*

*Ruta:* ${origin} → ${destination}
*Fecha:* ${formattedDate}
*Precio encontrado:* €${minPrice} EUR
*Umbral configurado:* €${PRICE_THRESHOLD} EUR
*💰 Ahorro:* €${savings} EUR (${savingsPercentage}%)

🔗 [Ver vuelo en Skyscanner](${url})

⚠️ *Importante:* Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀`;
        
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
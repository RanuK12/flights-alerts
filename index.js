require('dotenv').config();
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const { initDb, insertPrice, getLastPrice } = require('./database');
const { scrapeSkyscanner } = require('./skyscanner_scraper');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_ENABLED = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

const bot = TELEGRAM_ENABLED
  ? new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false })
  : null;

// ─── Rutas Italia → Tokio (sep/oct 2026, ida y vuelta ~10 días) ───────────────
// Precios reales relevados en Kayak el 15/04/2026 (FCO → TYO, sep 2026):
//   Mínimo real:  ~€1,250 EUR (ITA Airways directo)
//   Precio típico: €1,500–1,580 EUR (KLM/Air France, 1 escala)
//   Precio alto:   €1,650+ EUR
//
// Thresholds de alerta:
//   ✈️  Buen precio  ≤ €1,350 EUR  → precio por debajo del mínimo histórico
//   🔥🔥 Oferta       ≤ €1,200 EUR  → muy por debajo del mínimo real
//   🔥🔥🔥 Ofertón    ≤ €1,000 EUR  → tarifa error / promo excepcional

const ROUTES = [
  {
    origin: 'FCO',
    destination: 'TYO',
    name: 'Roma (FCO) → Tokio',
    departureMonth: '2026-09',
    durationDays: 10,
    thresholds: {
      good: 1350,   // ✈️  Buen precio
      deal: 1200,   // 🔥🔥 Oferta
      steal: 1000,  // 🔥🔥🔥 Ofertón
    },
  },
  {
    origin: 'MXP',
    destination: 'TYO',
    name: 'Milán (MXP) → Tokio',
    departureMonth: '2026-09',
    durationDays: 10,
    thresholds: {
      good: 1350,
      deal: 1200,
      steal: 1000,
    },
  },
];

function getAlertLevel(price, thresholds) {
  if (price <= thresholds.steal) return { emoji: '🔥🔥🔥', label: 'OFERTÓN' };
  if (price <= thresholds.deal)  return { emoji: '🔥🔥',   label: 'OFERTA'   };
  if (price <= thresholds.good)  return { emoji: '✈️',     label: 'Buen precio' };
  return null; // sin alerta
}

function buildAlertMessage(route, price) {
  const level = getAlertLevel(price, route.thresholds);
  const emoji = level ? level.emoji : '✈️';
  const label = level ? level.label : 'Precio bajo';

  return (
    `${emoji} *ALERTA DE VUELO — ${label}*\n\n` +
    `*Ruta:* ${route.name}\n` +
    `*Período:* ${route.departureMonth} · ida y vuelta ~${route.durationDays} días\n` +
    `*Precio:* €${price} EUR\n` +
    `*Umbral buen precio:* €${route.thresholds.good}\n` +
    `*Umbral oferta:* €${route.thresholds.deal}\n` +
    `*Umbral ofertón:* €${route.thresholds.steal}\n\n` +
    `🔗 Buscar en Skyscanner\n\n` +
    `⚠️ Verificá condiciones y equipaje antes de comprar.`
  );
}

async function sendAlert(route, price) {
  if (!TELEGRAM_ENABLED) {
    console.log(`Alerta (Telegram deshabilitado): ${route.name} - €${price}`);
    return;
  }

  try {
    const message = buildAlertMessage(route, price);
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`✅ Alerta enviada: ${route.name} - €${price}`);
  } catch (error) {
    console.error(`Error enviando alerta: ${error.message}`);
  }
}

async function checkPrices() {
  console.log(`\n📍 Verificando precios a las ${new Date().toLocaleTimeString('es-ES')}...\n`);

  if (!await initDb()) {
    console.error('Error inicializando base de datos');
    return;
  }

  for (const route of ROUTES) {
    try {
      const { url, minPrice, flights } = await scrapeSkyscanner(route.origin, route.destination);

      if (minPrice === null) {
        console.log(`❌ ${route.name}: Sin precios encontrados`);
        continue;
      }

      // Guardar en base de datos
      const date = new Date().toISOString().split('T')[0];
      await insertPrice(`${route.origin}-${route.destination}`, date, minPrice);

      // Obtener último precio para comparar
      const lastPrice = await getLastPrice(`${route.origin}-${route.destination}`, date);

      // Enviar alerta si el precio está bajo de alguno de los umbrales
      const level = getAlertLevel(minPrice, route.thresholds);
      if (level) {
        await sendAlert(route, minPrice);
      } else {
        console.log(`${route.name}: €${minPrice} (sin alerta — umbral: €${route.thresholds.good})`);
      }
    } catch (error) {
      console.error(`Error procesando ${route.name}: ${error.message}`);
    }
  }

  console.log('\n✅ Verificación completada\n');
}

// Verificación inicial
console.log('🛫 Flight Price Bot iniciado — Italia → Tokio (sep/oct 2026)');
console.log('⏱️  Chequeos cada 30 minutos');
console.log('💰 Thresholds: ✈️ ≤€1,350 | 🔥🔥 ≤€1,200 | 🔥🔥🔥 ≤€1,000\n');

checkPrices();

// Programar chequeos automáticos
cron.schedule('*/30 * * * *', () => {
  checkPrices();
});

module.exports = { checkPrices };

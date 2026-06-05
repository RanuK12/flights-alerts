// Flight Price Monitoring Engine
// Runs every 15 minutes via cron

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ROUTES = require('./config/routes.json');
const THRESHOLDS = {
  oneway: { europeToArgentina: 500, argentinaToEurope: 400 },
  roundtrip: { bothWays: 800 }
};

const RESULTS_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

async function fetchPrices(route) {
  // Mock: Replace with real Skyscanner API call
  // This is a simulation for now
  const prices = {
    oneway: [
      { price: 350, currency: 'EUR', date: new Date().toISOString() },
      { price: 420, currency: 'EUR', date: new Date().toISOString() },
      { price: 480, currency: 'EUR', date: new Date().toISOString() }
    ],
    roundtrip: [
      { price: 780, currency: 'EUR', date: new Date().toISOString() },
      { price: 820, currency: 'EUR', date: new Date().toISOString() }
    ]
  };
  return prices[route.type] || [];
}

async function checkRoute(route) {
  console.log(`🔍 Checking ${route.origin}→${route.destination} (${route.type})`);
  const prices = await fetchPrices(route);
  const now = new Date();
  const day = now.toISOString().split('T')[0];

  const alerted = [];

  for (const p of prices) {
    if (p.price <= route.threshold) {
      console.log(`🚨 ALERT: ${route.origin}→${route.destination} ${p.price}€ ≤ ${route.threshold}€`);
      alerted.push({
        route: `${route.origin}→${route.destination}`,
        price: p.price,
        threshold: route.threshold,
        date: p.date,
        saved: route.threshold - p.price,
        type: route.type
      });
    }
  }

  return alerted;
}

async function runEngine() {
  console.log('✈️ Flight Engine Running...');
  let allAlerts = [];

  for (const route of ROUTES) {
    const alerts = await checkRoute(route);
    allAlerts = allAlerts.concat(alerts);
  }

  if (allAlerts.length > 0) {
    const summary = allAlerts.map(a => ({
      route: a.route,
      price: `${a.price}€`,
      threshold: `${a.threshold}€`,
      saved: `${a.saved}€`
    }));
    console.table(summary);
    // TODO: Send to Telegram
  } else {
    console.log('No alerts triggered.');
  }

  fs.writeFileSync(path.join(RESULTS_DIR, `alerts-${Date.now()}.json`), JSON.stringify(allAlerts, null, 2));
}

// Run every 15 minutes
if (require.main === module) {
  runEngine().catch(console.error);
}

module.exports = { runEngine };

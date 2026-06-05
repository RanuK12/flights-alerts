// Telegram Bot for Flight Price Alerts
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { runEngine } = require('./flight-engine');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(// /start/i, (msg) => {
  const chatId = msg.chat.id;
  const text = `✈️ *Flight Price Alert Bot*

🔍 *Monitoreando rutas todo el año*

📌 *Umbrales configurados:*
- 🇪🇺 → 🇦🇷 Solo ida  : ≤400€
- 🇦🇷 → 🇪🇺 Solo ida  : ≤500€
- 🔄 🇪🇺 ↔ 🇦🇷 Ida y vuelta : ≤800€

🛫 *Aeropuertos cubiertos:*
- Europa: FRA, MAD, BCN, AMS, CDG
- Argentina: EZE, COR

🔔 *Recibirás alertas automáticas* cuando aparezcan vuelos dentro de tus umbrales.

📊 *Próxima verificación:* ${new Date(Date.now() + 900000).toLocaleString('es-AR')}
`;
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// Background engine
setInterval(async () => {
  try {
    await runEngine();
  } catch (err) {
    console.error('Engine error:', err);
  }
}, 15 * 60 * 1000); // 15 minutes

// TODO: Add /routes command to list monitored airports

console.log('🤖 Flight Alert Bot Online — Waiting for /start');
module.exports = bot;

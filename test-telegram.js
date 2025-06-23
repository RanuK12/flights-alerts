require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

bot.sendMessage(
  TELEGRAM_CHAT_ID,
  '🚨 *Test Message*\nIf you see this, your bot is working!',
  { parse_mode: 'Markdown' }
).then(() => {
  console.log('✅ Message sent successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error sending message:', err.message);
  process.exit(1);
});
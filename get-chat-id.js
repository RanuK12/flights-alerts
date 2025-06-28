require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.log('ERROR: TELEGRAM_BOT_TOKEN no encontrado en .env');
  console.log('Por favor, agrega tu token de bot en el archivo .env');
  process.exit(1);
}

console.log('Iniciando bot para obtener Chat ID...');
console.log('1. Ve a Telegram y busca tu bot');
console.log('2. Envia cualquier mensaje al bot');
console.log('3. El Chat ID aparecera aqui');
console.log('4. Presiona Ctrl+C para salir');
console.log('');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const chatTitle = msg.chat.title || msg.chat.first_name || msg.chat.username || 'Sin nombre';
  
  console.log('=== MENSAJE RECIBIDO ===');
  console.log('Chat ID:', chatId);
  console.log('Tipo de chat:', chatType);
  console.log('Nombre:', chatTitle);
  console.log('Mensaje:', msg.text);
  console.log('');
  console.log('Para usar este Chat ID, agrega esta linea a tu .env:');
  console.log(`TELEGRAM_CHAT_ID=${chatId}`);
  console.log('');
  
  // Enviar mensaje de confirmacion
  bot.sendMessage(chatId, `✅ Chat ID obtenido: ${chatId}\n\nAhora puedes usar este ID en tu bot de vuelos.`);
});

bot.on('polling_error', (error) => {
  console.log('Error de polling:', error.message);
});

console.log('Bot iniciado. Esperando mensajes...'); 
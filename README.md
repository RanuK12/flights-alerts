# ✈️ Flight Price Bot - Flight Price Monitor

An intelligent Telegram bot to monitor LEVEL and Skyscanner flight prices with improved alerts, robust scraping, and PostgreSQL storage.

---

## 🚀 What does this app do?

- **Monitors LEVEL prices** (Buenos Aires → Madrid, Barcelona, Miami, etc.)
- **Skyscanner scraping** for additional routes (Europe → Argentina)
- **Stores data** in PostgreSQL for historical tracking
- **Sends automatic alerts** via Telegram when prices drop below configured threshold
- **Functional links** that lead directly to flight searches
- **Automatic savings calculation** and discount percentage
- **Readable dates** in Spanish format
- **Designed to run 24/7** in the cloud (Render, Heroku, etc.)

---

## ✨ Key Features

### 🔗 **Improved Links**
- Specific LEVEL URLs with complete parameters
- Direct Skyscanner links with configured currency
- Pre-configured searches with passengers and dates

### 📊 **Smart Alerts**
- Readable date format: "lunes, 15 de julio de 2025"
- Automatic savings calculation: "50 USD (16.7%)"
- Structured and clear information
- Informative emojis for better visualization

### 🕷️ **Robust Scraping**
- Multiple CSS selectors for greater reliability
- Alternative text extraction
- Realistic headers to avoid detection
- Improved error handling

### 🛠️ **Development Tools**
- Included test scripts
- Console alert demos
- Chat ID retrieval tool
- Complete documentation

---

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **PostgreSQL** - Database (Render)
- **node-telegram-bot-api** - Telegram bot
- **puppeteer-extra** - Advanced web scraping
- **axios** - HTTP requests
- **node-cron** - Scheduled tasks
- **pg** - PostgreSQL client

---

## 📦 Project Structure

```
flight-price-bot/
├── index.js                    # Main bot logic
├── database.js                 # PostgreSQL connection and operations
├── skyscanner_scraper.js       # Skyscanner scraping
├── test-improvements.js        # Telegram alert testing
├── test-alerts-only.js         # Function testing without DB
├── test-simple.js              # Simple alert demo
├── get-chat-id.js              # Chat ID retrieval tool
├── demo-alerts.js              # Improved alert demo
├── simple-demo.js              # Simple demo without special characters
├── test-console.js             # Console testing
├── test-format.js              # Format testing
├── test-telegram.js            # Basic Telegram test
├── generate-summary-pdf.js     # PDF summary generator
├── IMPROVEMENTS.md             # Improvements documentation
├── PROJECT_SUMMARY.md          # Project summary
├── README.md                   # This file
├── env.example                 # Environment variables example
├── .env                        # Environment variables
├── .gitignore
└── LICENSE
```

---

## ⚡ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/RanuK12/flights-alerts.git
cd flight-price-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file with:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PRICE_THRESHOLD=300
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### 4. Get Telegram Chat ID

```bash
node get-chat-id.js
```

Then:
1. Go to Telegram and search for your bot
2. Send any message to the bot
3. Copy the Chat ID that appears in the console
4. Update `TELEGRAM_CHAT_ID` in the `.env` file

### 5. Test the improvements

```bash
# Test functions without database
node test-alerts-only.js

# Demo of improved alerts
node simple-demo.js

# Complete test with Telegram (requires correct Chat ID)
node test-improvements.js
```

### 6. Run the bot

```bash
node index.js
```

---

## 🔧 Advanced Configuration

### Monitored Routes

The bot automatically monitors these routes:

**LEVEL Airlines:**
- EZE → MAD (Buenos Aires → Madrid)
- EZE → BCN (Buenos Aires → Barcelona)
- BCN → MIA (Barcelona → Miami)
- AMS → BOS (Amsterdam → Boston)

**Skyscanner:**
- FCO → EZE (Rome → Buenos Aires)
- MAD → EZE (Madrid → Buenos Aires)
- BCN → EZE (Barcelona → Buenos Aires)
- FCO → COR (Rome → Córdoba)
- MAD → COR (Madrid → Córdoba)
- BCN → COR (Barcelona → Córdoba)

### Skyscanner Parameters

```javascript
const SKYSCANNER_ORIGINS = ['FCO', 'MAD', 'BCN'];
const SKYSCANNER_DESTINATIONS = ['EZE', 'COR'];
const SKYSCANNER_YEAR = 2025;
const SKYSCANNER_MONTH = '09';
const SKYSCANNER_DAY = '10';
const SKYSCANNER_CURRENCY = 'EUR';
const SKYSCANNER_THRESHOLD = 500;
```

---

## 📲 Improved Alert Example

```
✈️ ¡VUELO BARATO ENCONTRADO!

Ruta: Buenos Aires → Madrid (EZE → MAD)
Fecha: lunes, 15 de julio de 2025
Precio encontrado: 250 USD
Umbral configurado: 300 USD
💰 Ahorro: 50 USD (16.7%)

🔗 Ver vuelo en LEVEL: [Specific URL]

⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀
```

---

## 🧪 Testing & Development

### Available Test Scripts

```bash
# Basic function testing
node test-alerts-only.js

# Simple alert demo
node simple-demo.js

# Telegram test (requires configuration)
node test-improvements.js

# Get Chat ID
node get-chat-id.js

# Skyscanner scraping
node skyscanner_scraper.js
```

### Automatic Verifications

- ✅ LEVEL URLs with specific parameters
- ✅ Readable formatted dates
- ✅ Automatic savings calculation
- ✅ Improved message format
- ✅ Functional Skyscanner links
- ✅ Robust scraping with multiple selectors

---

## 🚀 Cloud Deployment

### Render (Recommended)

1. **Connect repository** to Render
2. **Create Web Service** pointing to the repo
3. **Configure environment variables**:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `PRICE_THRESHOLD`
   - `DATABASE_URL`
4. **Automatic deployment** - Render will install dependencies and run the bot

### Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Configure variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set TELEGRAM_CHAT_ID=your_chat_id
heroku config:set PRICE_THRESHOLD=300

# Deploy
git push heroku main
```

---

## 🔍 Monitoring & Logs

The bot includes detailed logging:

- ✅ Found prices and thresholds
- ✅ Successfully sent alerts
- ✅ Scraping errors with details
- ✅ CSS selectors used
- ✅ Generated URLs for verification

---

## 🛡️ Security & Best Practices

- **Never commit** the `.env` file to GitHub
- **Use environment variables** in cloud platforms
- **User-Agent rotation** to avoid detection
- **Random delays** between requests
- **Robust error handling**

---

## 📈 Future Improvements

- [ ] Web dashboard for visualization
- [ ] Email notifications
- [ ] More airlines (Iberia, Air Europa, etc.)
- [ ] Personalized alerts per user
- [ ] Price history with charts
- [ ] REST API for integrations

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ✉️ Contact

- **GitHub**: [@RanuK12](https://github.com/RanuK12)
- **Issues**: [Report issues](https://github.com/RanuK12/flights-alerts/issues)

---

## 🙏 Acknowledgments

- **LEVEL Airlines** for their public API
- **Skyscanner** for their search platform
- **Telegram** for their bot API
- **Render** for free hosting

---

**Enjoy finding the best flight deals! ✈️💰** 
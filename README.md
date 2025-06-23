# ✈️ flights-alerts

A Telegram bot to monitor LEVEL flight prices between Buenos Aires and Europe, with PostgreSQL storage and cloud deployment on Render.

---

## 🚀 What does this app do?

- Periodically checks LEVEL flight prices (Buenos Aires → Madrid and Buenos Aires → Barcelona) for a configurable range of months.
- Stores all price data in a PostgreSQL database.
- Sends automatic Telegram alerts if prices drop below a configurable threshold.
- **Alerts now include a direct link to the flight search and show both origin and destination codes.**
- Designed to run 24/7 in the cloud (e.g., Render).

---

## 🛠️ Tech Stack

- **Node.js**
- **PostgreSQL** (Render)
- **node-telegram-bot-api**
- **pg** (PostgreSQL client for Node.js)
- **node-cron** (scheduled tasks)
- **axios** (HTTP requests)

---

## ⚡ Installation & Deployment

### 1. Clone the repository

```bash
git clone https://github.com/RanuK12/flights-alerts.git
cd flights-alerts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file with:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
PRICE_THRESHOLD=300
DATABASE_URL=postgresql://user:password@host:port/dbname
```

> On Render, set these variables in the Environment panel.

### 4. Run the bot locally (optional)

```bash
node index.js
```

### 5. Deploy on Render

- Push your code to GitHub.
- Create a Web Service on Render pointing to this repo.
- Add the environment variables.
- Render will install dependencies and run the bot automatically.

---

## 📦 Project Structure

```
├── index.js           # Main bot logic
├── database.js        # PostgreSQL connection and operations
├── package.json
├── .env.example       # Example environment variables
├── README.md
├── LICENSE
└── .gitignore
```

---

## 📝 Customization

- **Routes and months:** Edit the `baseRoutes` array and the `months` variable in `index.js` to monitor other routes or dates.
- **Alert threshold:** Change `PRICE_THRESHOLD` in your `.env`.

---

## 🛡️ Security Notes

- **Never commit your `.env` file** or credentials to GitHub.
- Use environment variables in Render for your secrets.

---

## 📲 Example Telegram Alert

```
🚨 LOW PRICE ALERT
Route: Buenos Aires → Madrid
From: EZE
To: MAD
Date: 2025-07-15
Price: $280 USD
Threshold: $300 USD
🔗 View Flight: https://www.flylevel.com/flights/results?triptype=RT&origin=EZE&destination=MAD&outboundDate=2025-07-15&currencyCode=USD
It's a great time to book your flight!
```

---

## 🤝 Contributing

Pull requests and suggestions are welcome!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ✉️ Contact

- [@RanuK12](https://github.com/RanuK12) 
const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('flights-alerts-summary.pdf'));

doc.fontSize(20).text('Technical Summary – flights-alerts Project', { underline: true });
doc.moveDown();

doc.fontSize(14).text('1. Project Overview', { bold: true });
doc.fontSize(12).text(
  'flights-alerts is a Node.js-based Telegram bot that monitors LEVEL airline flight prices for specific routes (Buenos Aires → Madrid and Buenos Aires → Barcelona) over a configurable range of months. The bot sends real-time alerts to Telegram when prices drop below a set threshold and stores all price data in a PostgreSQL database hosted on Render.'
);
doc.moveDown();

doc.fontSize(14).text('2. Technical Achievements', { bold: true });
doc.fontSize(12).list([
  'Automated Flight Price Monitoring: Periodic querying of LEVEL’s internal API for flight prices using scheduled tasks (node-cron). Dynamic construction of API requests to cover multiple routes and months.',
  'API Integration & Web Scraping Techniques: Analysis of LEVEL’s web traffic to identify and consume their internal, undocumented API. Use of custom HTTP headers to simulate real browser requests and bypass basic anti-bot protections.',
  'Data Persistence: Initial implementation with SQLite for local development. Migration to PostgreSQL for cloud compatibility and persistent storage, using the pg library and environment variables for secure connection management.',
  'Real-Time Notifications: Integration with Telegram via node-telegram-bot-api to send instant alerts when price conditions are met.',
  'Cloud Deployment: Deployment on Render for 24/7 operation, independent of local machines. Configuration of environment variables in Render for secure management of credentials and settings.',
  'Security & DevOps Best Practices: Use of .gitignore to prevent sensitive files (like .env) from being committed to GitHub. Creation of a professional README.md and an MIT LICENSE file. Recommendation and example of a .env.example for safe documentation of required environment variables.',
  'Version Control & Collaboration: All code and documentation managed in a public GitHub repository for version control and future collaboration.'
]);
doc.moveDown();

doc.fontSize(14).text('3. Technology Stack', { bold: true });
doc.fontSize(12).list([
  'Node.js (JavaScript)',
  'PostgreSQL (hosted on Render)',
  'node-telegram-bot-api',
  'pg (PostgreSQL client for Node.js)',
  'node-cron',
  'axios',
  'Render (cloud deployment)',
  'GitHub (version control)'
]);
doc.moveDown();

doc.fontSize(14).text('4. Security Considerations', { bold: true });
doc.fontSize(12).list([
  'All sensitive credentials are managed via environment variables and never committed to version control.',
  'The .env file is included in .gitignore.',
  'The project is licensed under the MIT License.'
]);
doc.moveDown();

doc.fontSize(14).text('5. Project Structure', { bold: true });
doc.fontSize(12).text(`
├── index.js           # Main bot logic
├── database.js        # PostgreSQL connection and operations
├── package.json
├── .env.example       # Example environment variables
├── README.md
├── LICENSE
└── .gitignore
`);
doc.moveDown();

doc.fontSize(14).text('6. Example Telegram Alert', { bold: true });
doc.fontSize(12).text(`
🚨 LOW PRICE ALERT
Route: Buenos Aires → Madrid
Date: 2025-07-15
Price: $280 USD
Threshold: $300 USD
It's a great time to book your flight!
`);
doc.moveDown();

doc.fontSize(14).text('7. Contact', { bold: true });
doc.fontSize(12).text('[@RanuK12](https://github.com/RanuK12)');

doc.end();
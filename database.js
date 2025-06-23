const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'prices.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS flight_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route TEXT,
      date TEXT,
      price INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function insertPrice(route, date, price) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO flight_prices (route, date, price) VALUES (?, ?, ?)`,
      [route, date, price],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

module.exports = {
  insertPrice,
  db,
};
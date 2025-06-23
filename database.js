const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Crear tabla si no existe
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS flight_prices (
      id SERIAL PRIMARY KEY,
      route TEXT,
      date TEXT,
      price INTEGER,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Insertar nuevo precio
async function insertPrice(route, date, price) {
  await pool.query(
    'INSERT INTO flight_prices (route, date, price) VALUES ($1, $2, $3)',
    [route, date, price]
  );
}

module.exports = {
  insertPrice,
  initDb,
  pool,
};
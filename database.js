const { Pool } = require('pg');

// Log the connection string for debugging (remove in production if needed)
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crear tabla si no existe
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      route VARCHAR(20),
      date DATE,
      price NUMERIC,
      UNIQUE(route, date)
    );
  `);
}

// Insertar nuevo precio
async function insertPrice(route, date, price) {
  await pool.query(
    'INSERT INTO prices (route, date, price) VALUES ($1, $2, $3) ON CONFLICT (route, date) DO NOTHING',
    [route, date, price]
  );
}

module.exports = {
  insertPrice,
  initDb,
  pool,
};
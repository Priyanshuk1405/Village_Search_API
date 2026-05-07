// db.js — Connects to your PostgreSQL "hierarchy" database

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect((err) => {
  if (err) {
    console.log('❌ Database connection FAILED:', err.message);
    console.log('👉 Check your .env file');
  } else {
    console.log('✅ Connected to hierarchy database!');
  }
});

module.exports = pool;

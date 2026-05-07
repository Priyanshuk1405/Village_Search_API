// index.js — Main server file
// Run with: node index.js

const express = require('express');
const cors = require('cors');        // ← ADD THIS
require('dotenv').config();

const app = express();
app.use(cors());                     // ← ADD THIS (after app is created)
app.use(express.json()); 


// ── Import all route files ──────────────────────────────────
const statesRouter       = require('./routes/states');
const districtsRouter    = require('./routes/districts');
const subdistrictsRouter = require('./routes/subdistricts');
const villagesRouter     = require('./routes/villages');

// ── Connect routes to URLs ──────────────────────────────────
app.use('/states',       statesRouter);
app.use('/districts',    districtsRouter);
app.use('/subdistricts', subdistrictsRouter);
app.use('/villages',     villagesRouter);

// ── Welcome route ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🇮🇳 All India Villages API',
    version: '1.0.0',
    endpoints: {
      states:        'GET /states',
      one_state:     'GET /states/:state_code',
      state_districts: 'GET /states/:state_code/districts',

      districts:     'GET /districts',
      one_district:  'GET /districts/:district_code',
      dist_tehsils:  'GET /districts/:district_code/subdistricts',

      subdistricts:  'GET /subdistricts',
      tehsil_villages: 'GET /subdistricts/:tehsil_code/villages',

      search_village: 'GET /villages/search?name=Bichhiwara',
      search_in_state:'GET /villages/search?name=Bichhiwara&state_code=08',
      one_village:   'GET /villages/:place_code',
    }
  });
});

// ── 404 handler for unknown routes ─────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// ── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('📌 Try these in your browser:');
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/states`);
  console.log(`   http://localhost:${PORT}/villages/search?name=Bichhiwara&state_code=08`);
});

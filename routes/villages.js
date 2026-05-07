// routes/villages.js — All /villages endpoints

const express = require('express');
const router  = express.Router();
const pool    = require('../db');


// SMART SEARCH — searches everything at once
// URL: http://localhost:3000/villages/smart-search?q=Rampur
router.get('/smart-search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q)
      return res.status(400).json({ message: 'Please provide ?q=searchterm' });

    // "Rampur%" — only matches names STARTING with search word
    // This prevents "Balrampur" showing when you search "Rampur"
    const searchParam = `${q}%`;

    const [stateResult, districtResult, tehsilResult, villageResult] = await Promise.all([

      // Level 1 — match states
      pool.query(`
        SELECT state_code, state_name, 'state' AS type
        FROM states
        WHERE state_name ILIKE $1
        ORDER BY state_name
        LIMIT 5
      `, [searchParam]),

      // Level 2 — match districts
      pool.query(`
        SELECT d.district_code, d.district_name, s.state_name, 'district' AS type
        FROM districts d
        JOIN states s ON d.state_code = s.state_code
        WHERE d.district_name ILIKE $1
        ORDER BY d.district_name
        LIMIT 10
      `, [searchParam]),

      // Level 3 — match tehsils
      pool.query(`
        SELECT sd.tehsil_code, sd.tehsil_name, d.district_name, s.state_name, 'tehsil' AS type
        FROM sub_districts sd
        JOIN districts d ON sd.district_code = d.district_code
        JOIN states s    ON d.state_code = s.state_code
        WHERE sd.tehsil_name ILIKE $1
        ORDER BY sd.tehsil_name
        LIMIT 10
      `, [searchParam]),

      // Level 4 — match villages
      pool.query(`
        SELECT v.place_code, v.area_name AS village_name,
               sd.tehsil_name, d.district_name, s.state_name, 'village' AS type
        FROM villages v
        JOIN sub_districts sd ON v.tehsil_code   = sd.tehsil_code
        JOIN districts d      ON v.district_code = d.district_code
        JOIN states s         ON d.state_code    = s.state_code
        WHERE v.area_name ILIKE $1
        ORDER BY v.area_name
        LIMIT 100
      `, [searchParam]),

    ]);

    res.json({
      query: q,
      results: {
        states:    { total: stateResult.rowCount,    data: stateResult.rows },
        districts: { total: districtResult.rowCount, data: districtResult.rows },
        tehsils:   { total: tehsilResult.rowCount,   data: tehsilResult.rows },
        villages:  { total: villageResult.rowCount,  data: villageResult.rows },
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// SEARCH villages by name only
// URL: http://localhost:3000/villages/search?name=Rampur
// URL: http://localhost:3000/villages/search?name=Rampur&state_code=2
router.get('/search', async (req, res) => {
  try {
    const { name, state_code } = req.query;

    if (!name)
      return res.status(400).json({ message: 'Please provide ?name=villagename' });

    // "name%" — only matches villages STARTING with search word
    const searchParam = `${name}%`;

    let query, params;

    if (state_code) {
      query = `
        SELECT
          v.place_code,
          v.area_name    AS village_name,
          sd.tehsil_name,
          d.district_name,
          s.state_name,
          v.full_address
        FROM villages v
        JOIN sub_districts sd ON v.tehsil_code   = sd.tehsil_code
        JOIN districts d      ON v.district_code = d.district_code
        JOIN states s         ON d.state_code    = s.state_code
        WHERE v.area_name ILIKE $1
          AND s.state_code = $2
        ORDER BY v.area_name
        LIMIT 100
      `;
      params = [searchParam, state_code];
    } else {
      query = `
        SELECT
          v.place_code,
          v.area_name    AS village_name,
          sd.tehsil_name,
          d.district_name,
          s.state_name,
          v.full_address
        FROM villages v
        JOIN sub_districts sd ON v.tehsil_code   = sd.tehsil_code
        JOIN districts d      ON v.district_code = d.district_code
        JOIN states s         ON d.state_code    = s.state_code
        WHERE v.area_name ILIKE $1
        ORDER BY v.area_name
        LIMIT 100
      `;
      params = [searchParam];
    }

    const result = await pool.query(query, params);

    res.json({
      search: name,
      total:  result.rowCount,
      data:   result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET villages by district name
router.get('/by-district', async (req, res) => {
  try {
    const { name } = req.query;
    const result = await pool.query(`
      SELECT v.place_code, v.area_name AS village_name,
             sd.tehsil_name, d.district_name, s.state_name
      FROM villages v
      JOIN sub_districts sd ON v.tehsil_code   = sd.tehsil_code
      JOIN districts d      ON v.district_code = d.district_code
      JOIN states s         ON d.state_code    = s.state_code
      WHERE d.district_name ILIKE $1
      ORDER BY v.area_name
      LIMIT 500
    `, [`${name}%`]);

    res.json({ total: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET one village by place_code
// URL: http://localhost:3000/villages/123456
router.get('/:place_code', async (req, res) => {
  try {
    const { place_code } = req.params;

    const result = await pool.query(`
      SELECT
        v.place_code,
        v.area_name    AS village_name,
        sd.tehsil_name,
        d.district_name,
        s.state_name,
        v.full_address
      FROM villages v
      JOIN sub_districts sd ON v.tehsil_code   = sd.tehsil_code
      JOIN districts d      ON v.district_code = d.district_code
      JOIN states s         ON d.state_code    = s.state_code
      WHERE v.place_code = $1
    `, [place_code]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Village not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
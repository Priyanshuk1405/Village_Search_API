// routes/districts.js — All /districts endpoints

const express = require('express');
const router  = express.Router();
const pool    = require('../db');


// GET all districts
// URL: http://localhost:3000/districts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.district_code,
        d.district_name,
        s.state_name
      FROM districts d
      JOIN states s ON d.state_code = s.state_code
      ORDER BY d.district_name
    `);
    res.json({
      total: result.rowCount,
      data:  result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET one district by code
// URL: http://localhost:3000/districts/23
router.get('/:district_code', async (req, res) => {
  try {
    const { district_code } = req.params;
    const result = await pool.query(`
      SELECT 
        d.district_code,
        d.district_name,
        s.state_code,
        s.state_name
      FROM districts d
      JOIN states s ON d.state_code = s.state_code
      WHERE d.district_code = $1
    `, [district_code]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: 'District not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET all sub-districts (tehsils) inside a district
// URL: http://localhost:3000/districts/23/subdistricts
router.get('/:district_code/subdistricts', async (req, res) => {
  try {
    const { district_code } = req.params;

    // Check district exists
    const districtCheck = await pool.query(
      'SELECT * FROM districts WHERE district_code = $1',
      [district_code]
    );
    if (districtCheck.rowCount === 0)
      return res.status(404).json({ message: 'District not found' });

    const result = await pool.query(
      'SELECT * FROM sub_districts WHERE district_code = $1 ORDER BY tehsil_name',
      [district_code]
    );

    res.json({
      district: districtCheck.rows[0].district_name,
      total:    result.rowCount,
      data:     result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

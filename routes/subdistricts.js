// routes/subdistricts.js — All /subdistricts endpoints

const express = require('express');
const router  = express.Router();
const pool    = require('../db');


// GET all sub-districts
// URL: http://localhost:3000/subdistricts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sd.tehsil_code,
        sd.tehsil_name,
        d.district_name,
        s.state_name
      FROM sub_districts sd
      JOIN districts d ON sd.district_code = d.district_code
      JOIN states s    ON d.state_code     = s.state_code
      ORDER BY sd.tehsil_name
    `);
    res.json({
      total: result.rowCount,
      data:  result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET all villages inside a sub-district (tehsil)
// URL: http://localhost:3000/subdistricts/100/villages
router.get('/:tehsil_code/villages', async (req, res) => {
  try {
    const { tehsil_code } = req.params;

    // Check tehsil exists
    const tehsilCheck = await pool.query(
      'SELECT * FROM sub_districts WHERE tehsil_code = $1',
      [tehsil_code]
    );
    if (tehsilCheck.rowCount === 0)
      return res.status(404).json({ message: 'Sub-district not found' });

    const result = await pool.query(
      `SELECT place_code, area_name, full_address
       FROM villages
       WHERE tehsil_code = $1
       ORDER BY area_name`,
      [tehsil_code]
    );

    res.json({
      tehsil: tehsilCheck.rows[0].tehsil_name,
      total:  result.rowCount,
      data:   result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

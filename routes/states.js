// routes/states.js — All /states endpoints

const express = require('express');
const router  = express.Router();
const pool    = require('../db');


// GET all states
// URL: http://localhost:3000/states
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM states ORDER BY state_name'
    );
    res.json({
      total: result.rowCount,
      data:  result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET one state by code
// URL: http://localhost:3000/states/2
router.get('/:state_code', async (req, res) => {
  try {
    const { state_code } = req.params;
    const result = await pool.query(
      'SELECT * FROM states WHERE state_code = $1',
      [state_code]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: 'State not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET all districts inside a state
// URL: http://localhost:3000/states/2/districts
router.get('/:state_code/districts', async (req, res) => {
  try {
    const { state_code } = req.params;

    // First check if state exists
    const stateCheck = await pool.query(
      'SELECT * FROM states WHERE state_code = $1',
      [state_code]
    );
    if (stateCheck.rowCount === 0)
      return res.status(404).json({ message: 'State not found' });

    const result = await pool.query(
      'SELECT * FROM districts WHERE state_code = $1 ORDER BY district_name',
      [state_code]
    );

    res.json({
      state:    stateCheck.rows[0].state_name,
      total:    result.rowCount,
      data:     result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

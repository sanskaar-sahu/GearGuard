const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get requests per team
router.get('/requests-per-team', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id,
        t.name as team_name,
        COUNT(mr.id) as request_count
      FROM teams t
      LEFT JOIN maintenance_requests mr ON t.id = mr.team_id
      GROUP BY t.id, t.name
      ORDER BY request_count DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get requests per team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get requests per equipment category
router.get('/requests-per-category', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ec.id,
        ec.name as category_name,
        COUNT(mr.id) as request_count
      FROM equipment_categories ec
      LEFT JOIN equipment e ON ec.id = e.category_id
      LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
      GROUP BY ec.id, ec.name
      ORDER BY request_count DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get requests per category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get requests by status
router.get('/requests-by-status', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
      FROM maintenance_requests
      GROUP BY status
      ORDER BY count DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get requests by status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


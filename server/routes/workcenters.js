const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all work centers
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wc.*, 
        c.name as company_name,
        awc.name as alternative_work_center_name
      FROM work_centers wc
      LEFT JOIN companies c ON wc.company_id = c.id
      LEFT JOIN work_centers awc ON wc.alternative_work_center_id = awc.id
      ORDER BY wc.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get work centers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get work center by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wc.*, 
        c.name as company_name,
        awc.name as alternative_work_center_name
      FROM work_centers wc
      LEFT JOIN companies c ON wc.company_id = c.id
      LEFT JOIN work_centers awc ON wc.alternative_work_center_id = awc.id
      WHERE wc.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create work center
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, cost, tag, cost_per_hour, capacity_task_per_hour, daily_target, alternative_work_center_id, company_id } = req.body;

    const result = await pool.query(
      `INSERT INTO work_centers (
        name, cost, tag, cost_per_hour, capacity_task_per_hour, 
        daily_target, alternative_work_center_id, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [name, cost, tag, cost_per_hour, capacity_task_per_hour, daily_target, alternative_work_center_id, company_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update work center
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, cost, tag, cost_per_hour, capacity_task_per_hour, daily_target, alternative_work_center_id, company_id } = req.body;

    const result = await pool.query(
      `UPDATE work_centers SET
        name = $1, cost = $2, tag = $3, cost_per_hour = $4,
        capacity_task_per_hour = $5, daily_target = $6,
        alternative_work_center_id = $7, company_id = $8
      WHERE id = $9
      RETURNING *`,
      [name, cost, tag, cost_per_hour, capacity_task_per_hour, daily_target, alternative_work_center_id, company_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete work center
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM work_centers WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json({ message: 'Work center deleted successfully' });
  } catch (error) {
    console.error('Delete work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


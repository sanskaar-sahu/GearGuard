const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ec.*, 
        u.name as responsible_name,
        c.name as company_name
      FROM equipment_categories ec
      LEFT JOIN users u ON ec.responsible_user_id = u.id
      LEFT JOIN companies c ON ec.company_id = c.id
      ORDER BY ec.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ec.*, 
        u.name as responsible_name,
        c.name as company_name
      FROM equipment_categories ec
      LEFT JOIN users u ON ec.responsible_user_id = u.id
      LEFT JOIN companies c ON ec.company_id = c.id
      WHERE ec.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, responsible_user_id, company_id } = req.body;

    const result = await pool.query(
      'INSERT INTO equipment_categories (name, responsible_user_id, company_id) VALUES ($1, $2, $3) RETURNING *',
      [name, responsible_user_id, company_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, responsible_user_id, company_id } = req.body;

    const result = await pool.query(
      'UPDATE equipment_categories SET name = $1, responsible_user_id = $2, company_id = $3 WHERE id = $4 RETURNING *',
      [name, responsible_user_id, company_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM equipment_categories WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


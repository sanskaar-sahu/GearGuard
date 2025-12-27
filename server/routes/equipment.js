const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all equipment
router.get('/', authenticate, async (req, res) => {
  try {
    const { department, employee_id, category_id, company_id } = req.query;
    let query = `
      SELECT e.*, 
        ec.name as category_name,
        u.name as employee_name,
        t.name as team_name,
        c.name as company_name,
        COALESCE(
          (SELECT COUNT(*) FROM maintenance_requests mr 
           WHERE mr.equipment_id = e.id AND mr.status != 'Repaired'),
          0
        ) as open_requests_count
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.employee_id = u.id
      LEFT JOIN teams t ON e.default_team_id = t.id
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (department) {
      query += ` AND e.department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    if (employee_id) {
      query += ` AND e.employee_id = $${paramCount}`;
      params.push(employee_id);
      paramCount++;
    }

    if (category_id) {
      query += ` AND e.category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    if (company_id) {
      query += ` AND e.company_id = $${paramCount}`;
      params.push(company_id);
      paramCount++;
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get equipment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, 
        ec.name as category_name,
        u.name as employee_name,
        t.name as team_name,
        c.name as company_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.employee_id = u.id
      LEFT JOIN teams t ON e.default_team_id = t.id
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Get maintenance requests count for this equipment
    const requestsCount = await pool.query(
      'SELECT COUNT(*) as count FROM maintenance_requests WHERE equipment_id = $1 AND status != $2',
      [req.params.id, 'Repaired']
    );

    res.json({
      ...result.rows[0],
      open_requests_count: parseInt(requestsCount.rows[0].count),
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get maintenance requests for equipment
router.get('/:id/requests', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, 
        u1.name as assigned_by_name,
        u2.name as assigned_to_name,
        t.name as team_name
      FROM maintenance_requests mr
      LEFT JOIN users u1 ON mr.assigned_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE mr.equipment_id = $1
      ORDER BY mr.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get equipment requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create equipment
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      serial_number,
      type_model,
      category_id,
      company_id,
      employee_id,
      department,
      location,
      shop_detail,
      maintenance_type,
      assigned_date,
      purchase_date,
      warranty_info,
      description,
      default_team_id,
      default_technician_id,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment (
        name, serial_number, type_model, category_id, company_id, employee_id,
        department, location, shop_detail, maintenance_type, assigned_date,
        purchase_date, warranty_info, description, default_team_id, default_technician_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        name,
        serial_number,
        type_model,
        category_id,
        company_id,
        employee_id,
        department,
        location,
        shop_detail,
        maintenance_type,
        assigned_date,
        purchase_date,
        warranty_info,
        description,
        default_team_id,
        default_technician_id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update equipment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      name,
      serial_number,
      type_model,
      category_id,
      company_id,
      employee_id,
      department,
      location,
      shop_detail,
      maintenance_type,
      assigned_date,
      purchase_date,
      warranty_info,
      description,
      default_team_id,
      default_technician_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE equipment SET
        name = $1, serial_number = $2, type_model = $3, category_id = $4,
        company_id = $5, employee_id = $6, department = $7, location = $8,
        shop_detail = $9, maintenance_type = $10, assigned_date = $11,
        purchase_date = $12, warranty_info = $13, description = $14,
        default_team_id = $15, default_technician_id = $16, updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING *`,
      [
        name,
        serial_number,
        type_model,
        category_id,
        company_id,
        employee_id,
        department,
        location,
        shop_detail,
        maintenance_type,
        assigned_date,
        purchase_date,
        warranty_info,
        description,
        default_team_id,
        default_technician_id,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete equipment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


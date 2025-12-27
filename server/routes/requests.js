const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all requests
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type, team_id, equipment_id } = req.query;
    let query = `
      SELECT mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        u1.name as assigned_by_name,
        u2.name as assigned_to_name,
        u2.email as assigned_to_email,
        t.name as team_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN users u1 ON mr.assigned_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND mr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      query += ` AND mr.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (team_id) {
      query += ` AND mr.team_id = $${paramCount}`;
      params.push(team_id);
      paramCount++;
    }

    if (equipment_id) {
      query += ` AND mr.equipment_id = $${paramCount}`;
      params.push(equipment_id);
      paramCount++;
    }

    query += ' ORDER BY mr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        u1.name as assigned_by_name,
        u2.name as assigned_to_name,
        t.name as team_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN users u1 ON mr.assigned_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE mr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create request
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      subject,
      equipment_id,
      type,
      priority,
      assigned_to,
      team_id,
      scheduled_date,
      due_date,
      duration_hours,
      location,
      frequency,
      recurrence_pattern,
      description,
    } = req.body;

    // Auto-fill logic: If equipment is selected, fetch its default team and category
    let finalTeamId = team_id;
    if (equipment_id && !team_id) {
      const equipmentResult = await pool.query(
        'SELECT default_team_id FROM equipment WHERE id = $1',
        [equipment_id]
      );
      if (equipmentResult.rows.length > 0 && equipmentResult.rows[0].default_team_id) {
        finalTeamId = equipmentResult.rows[0].default_team_id;
      }
    }

    const result = await pool.query(
      `INSERT INTO maintenance_requests (
        subject, equipment_id, type, priority, assigned_by, assigned_to,
        team_id, scheduled_date, due_date, duration_hours, location,
        frequency, recurrence_pattern, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        subject,
        equipment_id,
        type,
        priority || 'Medium',
        req.user.id,
        assigned_to,
        finalTeamId,
        scheduled_date,
        due_date,
        duration_hours,
        location,
        frequency,
        recurrence_pattern,
        description,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      subject,
      equipment_id,
      type,
      status,
      priority,
      assigned_to,
      team_id,
      scheduled_date,
      due_date,
      duration_hours,
      location,
      frequency,
      recurrence_pattern,
      description,
    } = req.body;

    // Scrap logic: If status is Scrap, mark equipment as scrapped
    if (status === 'Scrap') {
      if (equipment_id) {
        await pool.query('UPDATE equipment SET is_scrapped = TRUE WHERE id = $1', [equipment_id]);
      }
    }

    const result = await pool.query(
      `UPDATE maintenance_requests SET
        subject = $1, equipment_id = $2, type = $3, status = $4, priority = $5,
        assigned_to = $6, team_id = $7, scheduled_date = $8, due_date = $9,
        duration_hours = $10, location = $11, frequency = $12,
        recurrence_pattern = $13, description = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        subject,
        equipment_id,
        type,
        status,
        priority,
        assigned_to,
        team_id,
        scheduled_date,
        due_date,
        duration_hours,
        location,
        frequency,
        recurrence_pattern,
        description,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (for drag and drop)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    // Scrap logic
    if (status === 'Scrap') {
      const requestResult = await pool.query('SELECT equipment_id FROM maintenance_requests WHERE id = $1', [
        req.params.id,
      ]);
      if (requestResult.rows.length > 0 && requestResult.rows[0].equipment_id) {
        await pool.query('UPDATE equipment SET is_scrapped = TRUE WHERE id = $1', [
          requestResult.rows[0].equipment_id,
        ]);
      }
    }

    const result = await pool.query(
      'UPDATE maintenance_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_requests WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


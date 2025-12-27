const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all teams
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        c.name as company_name,
        COALESCE(
          json_agg(
            json_build_object('id', u.id, 'name', u.name, 'email', u.email)
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) as members
      FROM teams t
      LEFT JOIN companies c ON t.company_id = c.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON tm.user_id = u.id
      GROUP BY t.id, c.name
      ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const teamResult = await pool.query(
      `SELECT t.*, c.name as company_name
      FROM teams t
      LEFT JOIN companies c ON t.company_id = c.id
      WHERE t.id = $1`,
      [req.params.id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1`,
      [req.params.id]
    );

    res.json({
      ...teamResult.rows[0],
      members: membersResult.rows,
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, company_id, member_ids } = req.body;

    const result = await pool.query(
      'INSERT INTO teams (name, company_id) VALUES ($1, $2) RETURNING *',
      [name, company_id]
    );

    const team = result.rows[0];

    // Add team members
    if (member_ids && member_ids.length > 0) {
      for (const userId of member_ids) {
        await pool.query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)', [team.id, userId]);
      }
    }

    res.status(201).json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, company_id, member_ids } = req.body;

    const result = await pool.query(
      'UPDATE teams SET name = $1, company_id = $2 WHERE id = $3 RETURNING *',
      [name, company_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Update team members
    if (member_ids !== undefined) {
      // Delete existing members
      await pool.query('DELETE FROM team_members WHERE team_id = $1', [req.params.id]);

      // Add new members
      if (member_ids.length > 0) {
        for (const userId of member_ids) {
          await pool.query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)', [req.params.id, userId]);
        }
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete team
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM teams WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


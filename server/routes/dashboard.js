const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/', authenticate, async (req, res) => {
  try {
    // Get overdue tasks (due_date < today and status != Repaired)
    const overdueResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM maintenance_requests
      WHERE due_date < CURRENT_DATE
      AND status != 'Repaired'
      AND status != 'Scrap'`
    );

    // Get upcoming tasks (due_date >= today and status != Repaired)
    const upcomingResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM maintenance_requests
      WHERE due_date >= CURRENT_DATE
      AND status != 'Repaired'
      AND status != 'Scrap'`
    );

    // Get open requests (status = New or In Progress)
    const openResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM maintenance_requests
      WHERE status IN ('New', 'In Progress')`
    );

    // Get recent tasks
    const tasksResult = await pool.query(
      `SELECT mr.*,
        e.name as equipment_name,
        u.name as assigned_to_name,
        t.name as team_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN users u ON mr.assigned_to = u.id
      LEFT JOIN teams t ON mr.team_id = t.id
      ORDER BY mr.created_at DESC
      LIMIT 10`
    );

    res.json({
      overdueTasks: parseInt(overdueResult.rows[0].count),
      upcomingTasks: parseInt(upcomingResult.rows[0].count),
      openRequests: parseInt(openResult.rows[0].count),
      recentTasks: tasksResult.rows,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    overdueTasks: 0,
    upcomingTasks: 0,
    openRequests: 0,
    recentTasks: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Error fetching dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = (filter) => {
    navigate('/kanban', { state: { filter } });
  };

  const handleTaskClick = (taskId) => {
    navigate(`/requests/${taskId}/edit`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="summary-boxes">
        <div
          className="summary-box overdue"
          onClick={() => handleBoxClick('overdue')}
        >
          <h3>Overdue Tasks</h3>
          <div className="count">{stats.overdueTasks}</div>
        </div>
        <div
          className="summary-box upcoming"
          onClick={() => handleBoxClick('upcoming')}
        >
          <h3>Upcoming Tasks</h3>
          <div className="count">{stats.upcomingTasks}</div>
        </div>
        <div
          className="summary-box open"
          onClick={() => handleBoxClick('open')}
        >
          <h3>Open Requests</h3>
          <div className="count">{stats.openRequests}</div>
        </div>
      </div>
      <div className="task-list-section">
        <h3>Recent Tasks</h3>
        <table className="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentTasks.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No tasks found
                </td>
              </tr>
            ) : (
              stats.recentTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className="task-row"
                >
                  <td>{task.subject}</td>
                  <td>{task.assigned_to_name || 'Unassigned'}</td>
                  <td>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    member_ids: [],
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // You would need to create a users endpoint
      const response = await axios.get('http://localhost:5000/api/users').catch(() => ({ data: [] }));
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies').catch(() => ({ data: [] }));
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await axios.put(`http://localhost:5000/api/teams/${editingTeam.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/teams', formData);
      }
      setShowForm(false);
      setEditingTeam(null);
      setFormData({ name: '', company_id: '', member_ids: [] });
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error saving team');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      company_id: team.company_id,
      member_ids: team.members?.map((m) => m.id) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await axios.delete(`http://localhost:5000/api/teams/${id}`);
        fetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Error deleting team');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="teams-page">
      <div className="page-header">
        <h2>Teams</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Team
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingTeam(null);
          setFormData({ name: '', company_id: '', member_ids: [] });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTeam ? 'Edit Team' : 'New Team'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                >
                  <option value="">Select Company</option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowForm(false);
                  setEditingTeam(null);
                  setFormData({ name: '', company_id: '', member_ids: [] });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="teams-table-container">
        <table className="teams-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Team Members</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No teams found
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id}>
                  <td>{team.name}</td>
                  <td>
                    {team.members && team.members.length > 0
                      ? team.members.map((m) => m.name).join(', ')
                      : 'No members'}
                  </td>
                  <td>{team.company_name || '-'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(team)}>
                      Edit
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(team.id)}>
                      Delete
                    </button>
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

export default Teams;


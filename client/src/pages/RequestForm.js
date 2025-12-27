import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './RequestForm.css';

const RequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    equipment_id: '',
    type: 'Corrective',
    status: 'New',
    priority: 'Medium',
    assigned_to: '',
    team_id: '',
    scheduled_date: '',
    due_date: '',
    duration_hours: '',
    location: '',
    frequency: '',
    recurrence_pattern: '',
    description: '',
  });

  useEffect(() => {
    fetchDropdownData();
    if (id) {
      fetchRequest();
    }
  }, [id]);

  useEffect(() => {
    // Auto-fill logic when equipment is selected
    if (formData.equipment_id) {
      handleEquipmentChange(formData.equipment_id);
    }
  }, [formData.equipment_id]);

  const fetchDropdownData = async () => {
    try {
      const [equipmentRes, teamsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/equipment'),
        axios.get('http://localhost:5000/api/teams'),
        axios.get('http://localhost:5000/api/users'),
      ]);
      setEquipment(equipmentRes.data);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchRequest = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/requests/${id}`);
      const data = response.data;
      setFormData({
        subject: data.subject || '',
        equipment_id: data.equipment_id || '',
        type: data.type || 'Corrective',
        status: data.status || 'New',
        priority: data.priority || 'Medium',
        assigned_to: data.assigned_to || '',
        team_id: data.team_id || '',
        scheduled_date: data.scheduled_date ? data.scheduled_date.split('T')[0] : '',
        due_date: data.due_date ? data.due_date.split('T')[0] : '',
        duration_hours: data.duration_hours || '',
        location: data.location || '',
        frequency: data.frequency || '',
        recurrence_pattern: data.recurrence_pattern || '',
        description: data.description || '',
      });
    } catch (error) {
      console.error('Error fetching request:', error);
    }
  };

  const handleEquipmentChange = async (equipmentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/equipment/${equipmentId}`);
      const eq = response.data;
      // Auto-fill team from equipment
      if (eq.default_team_id) {
        setFormData((prev) => ({ ...prev, team_id: eq.default_team_id }));
      }
    } catch (error) {
      console.error('Error fetching equipment details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/requests/${id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/requests', formData);
      }
      navigate('/kanban');
    } catch (error) {
      console.error('Error saving request:', error);
      alert('Error saving request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-form-page">
      <h2>{id ? 'Edit Task Activity' : 'New Task Activity'}</h2>
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-row">
          <div className="form-group">
            <label>Task/Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Subject/Equipment</label>
            <select
              value={formData.equipment_id}
              onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
            >
              <option value="">Select Equipment</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Corrective">Corrective</option>
              <option value="Preventive">Preventive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Assigned To</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Team</label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Repaired">Repaired</option>
              <option value="Scrap">Scrap</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Scheduled Date</label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (Hours)</label>
            <input
              type="number"
              step="0.1"
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
            />
          </div>
        </div>

        {formData.type === 'Preventive' && (
          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <input
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Recurrence Pattern</label>
              <input
                type="text"
                value={formData.recurrence_pattern}
                onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/kanban')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;


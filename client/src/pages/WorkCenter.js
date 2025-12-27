import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkCenter.css';

const WorkCenter = () => {
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkCenter, setEditingWorkCenter] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    tag: '',
    cost_per_hour: '',
    capacity_task_per_hour: '',
    daily_target: '',
    alternative_work_center_id: '',
    company_id: '',
  });

  useEffect(() => {
    fetchWorkCenters();
    fetchCompanies();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/workcenters');
      setWorkCenters(response.data);
    } catch (error) {
      console.error('Error fetching work centers:', error);
    } finally {
      setLoading(false);
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
      const data = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        cost_per_hour: formData.cost_per_hour ? parseFloat(formData.cost_per_hour) : null,
        capacity_task_per_hour: formData.capacity_task_per_hour ? parseFloat(formData.capacity_task_per_hour) : null,
        daily_target: formData.daily_target ? parseInt(formData.daily_target) : null,
        alternative_work_center_id: formData.alternative_work_center_id || null,
      };

      if (editingWorkCenter) {
        await axios.put(`http://localhost:5000/api/workcenters/${editingWorkCenter.id}`, data);
      } else {
        await axios.post('http://localhost:5000/api/workcenters', data);
      }
      setShowForm(false);
      setEditingWorkCenter(null);
      setFormData({
        name: '',
        cost: '',
        tag: '',
        cost_per_hour: '',
        capacity_task_per_hour: '',
        daily_target: '',
        alternative_work_center_id: '',
        company_id: '',
      });
      fetchWorkCenters();
    } catch (error) {
      console.error('Error saving work center:', error);
      alert('Error saving work center');
    }
  };

  const handleEdit = (workCenter) => {
    setEditingWorkCenter(workCenter);
    setFormData({
      name: workCenter.name || '',
      cost: workCenter.cost || '',
      tag: workCenter.tag || '',
      cost_per_hour: workCenter.cost_per_hour || '',
      capacity_task_per_hour: workCenter.capacity_task_per_hour || '',
      daily_target: workCenter.daily_target || '',
      alternative_work_center_id: workCenter.alternative_work_center_id || '',
      company_id: workCenter.company_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work center?')) {
      try {
        await axios.delete(`http://localhost:5000/api/workcenters/${id}`);
        fetchWorkCenters();
      } catch (error) {
        console.error('Error deleting work center:', error);
        alert('Error deleting work center');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="work-center-page">
      <div className="page-header">
        <h2>Work Center</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Work Center
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingWorkCenter(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingWorkCenter ? 'Edit Work Center' : 'New Work Center'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Work Center Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost per Hour</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_hour}
                    onChange={(e) => setFormData({ ...formData, cost_per_hour: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Capacity (Task/Hr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.capacity_task_per_hour}
                    onChange={(e) => setFormData({ ...formData, capacity_task_per_hour: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Daily Target</label>
                  <input
                    type="number"
                    value={formData.daily_target}
                    onChange={(e) => setFormData({ ...formData, daily_target: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Alternative Work Center</label>
                  <select
                    value={formData.alternative_work_center_id}
                    onChange={(e) => setFormData({ ...formData, alternative_work_center_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {workCenters
                      .filter((wc) => !editingWorkCenter || wc.id !== editingWorkCenter.id)
                      .map((wc) => (
                        <option key={wc.id} value={wc.id}>
                          {wc.name}
                        </option>
                      ))}
                  </select>
                </div>
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
                  setEditingWorkCenter(null);
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

      <div className="work-center-table-container">
        <table className="work-center-table">
          <thead>
            <tr>
              <th>Work Center</th>
              <th>Cost</th>
              <th>Tag</th>
              <th>Cost per Hour</th>
              <th>Capacity (Task/Hr)</th>
              <th>Daily Target</th>
              <th>Alternative Work Center</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workCenters.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No work centers found
                </td>
              </tr>
            ) : (
              workCenters.map((wc) => (
                <tr key={wc.id}>
                  <td>{wc.name}</td>
                  <td>{wc.cost ? `$${wc.cost}` : '-'}</td>
                  <td>{wc.tag || '-'}</td>
                  <td>{wc.cost_per_hour ? `$${wc.cost_per_hour}` : '-'}</td>
                  <td>{wc.capacity_task_per_hour || '-'}</td>
                  <td>{wc.daily_target || '-'}</td>
                  <td>{wc.alternative_work_center_name || '-'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(wc)}>
                      Edit
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(wc.id)}>
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

export default WorkCenter;


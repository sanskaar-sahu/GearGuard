import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EquipmentForm.css';

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    type_model: '',
    category_id: '',
    company_id: '',
    employee_id: '',
    department: '',
    location: '',
    shop_detail: '',
    maintenance_type: '',
    assigned_date: '',
    purchase_date: '',
    warranty_info: '',
    description: '',
    default_team_id: '',
    default_technician_id: '',
  });

  useEffect(() => {
    fetchDropdownData();
    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, teamsRes, companiesRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/teams'),
        axios.get('http://localhost:5000/api/companies').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/users'),
      ]);
      setCategories(categoriesRes.data);
      setTeams(teamsRes.data);
      setCompanies(companiesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/equipment/${id}`);
      const data = response.data;
      setFormData({
        name: data.name || '',
        serial_number: data.serial_number || '',
        type_model: data.type_model || '',
        category_id: data.category_id || '',
        company_id: data.company_id || '',
        employee_id: data.employee_id || '',
        department: data.department || '',
        location: data.location || '',
        shop_detail: data.shop_detail || '',
        maintenance_type: data.maintenance_type || '',
        assigned_date: data.assigned_date ? data.assigned_date.split('T')[0] : '',
        purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : '',
        warranty_info: data.warranty_info || '',
        description: data.description || '',
        default_team_id: data.default_team_id || '',
        default_technician_id: data.default_technician_id || '',
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/equipment/${id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/equipment', formData);
      }
      navigate('/equipment');
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Error saving equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="equipment-form-page">
      <h2>{id ? 'Edit Equipment' : 'New Equipment'}</h2>
      <form onSubmit={handleSubmit} className="equipment-form">
        <div className="form-row">
          <div className="form-group">
            <label>Equipment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Serial Number</label>
            <input
              type="text"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Equipment Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Type/Model</label>
            <input
              type="text"
              value={formData.type_model}
              onChange={(e) => setFormData({ ...formData, type_model: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
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
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Maintenance Type</label>
            <select
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="Preventive">Preventive</option>
              <option value="Corrective">Corrective</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Default Team</label>
            <select
              value={formData.default_team_id}
              onChange={(e) => setFormData({ ...formData, default_team_id: e.target.value })}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Purchase Date</label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/equipment')}>
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

export default EquipmentForm;


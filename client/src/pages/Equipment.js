import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Equipment.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    employee_id: '',
    category_id: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, [filters]);

  const fetchEquipment = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await axios.get(`http://localhost:5000/api/equipment?${params}`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequests = (equipmentId) => {
    navigate(`/equipment/${equipmentId}/requests`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="equipment-page">
      <div className="page-header">
        <h2>Equipment</h2>
        <button
          className="btn-primary"
          onClick={() => navigate('/equipment/new')}
        >
          + New Equipment
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter by Department"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
      </div>

      <div className="equipment-table-container">
        <table className="equipment-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Serial Number</th>
              <th>Category</th>
              <th>Department</th>
              <th>Location</th>
              <th>Employee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No equipment found
                </td>
              </tr>
            ) : (
              equipment.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.serial_number || '-'}</td>
                  <td>{item.category_name || '-'}</td>
                  <td>{item.department || '-'}</td>
                  <td>{item.location || '-'}</td>
                  <td>{item.employee_name || '-'}</td>
                  <td>
                    <button
                      className="btn-sm"
                      onClick={() => navigate(`/equipment/${item.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-sm btn-secondary"
                      onClick={() => handleViewRequests(item.id)}
                      title={`View ${item.open_requests_count || 0} open requests`}
                    >
                      Maintenance ({item.open_requests_count || 0})
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

export default Equipment;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EquipmentRequests.css';

const EquipmentRequests = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [equipmentRes, requestsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/equipment/${id}`),
        axios.get(`http://localhost:5000/api/equipment/${id}/requests`),
      ]);
      setEquipment(equipmentRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="equipment-requests-page">
      <div className="page-header">
        <h2>Maintenance Requests for {equipment?.name}</h2>
        <button className="btn-primary" onClick={() => navigate('/equipment')}>
          Back to Equipment
        </button>
      </div>

      <div className="equipment-info">
        <p><strong>Open Requests:</strong> {equipment?.open_requests_count || 0}</p>
      </div>

      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No requests found for this equipment
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.subject}</td>
                  <td>{request.type}</td>
                  <td>
                    <span className={`status-badge ${request.status.toLowerCase().replace(' ', '-')}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{request.priority}</td>
                  <td>{request.assigned_to_name || 'Unassigned'}</td>
                  <td>
                    {request.due_date
                      ? new Date(request.due_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn-sm"
                      onClick={() => navigate(`/requests/${request.id}/edit`)}
                    >
                      View
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

export default EquipmentRequests;


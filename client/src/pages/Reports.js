import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const Reports = () => {
  const [requestsPerTeam, setRequestsPerTeam] = useState([]);
  const [requestsPerCategory, setRequestsPerCategory] = useState([]);
  const [requestsByStatus, setRequestsByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [teamRes, categoryRes, statusRes] = await Promise.all([
        axios.get('http://localhost:5000/api/reports/requests-per-team'),
        axios.get('http://localhost:5000/api/reports/requests-per-category'),
        axios.get('http://localhost:5000/api/reports/requests-by-status'),
      ]);
      setRequestsPerTeam(teamRes.data);
      setRequestsPerCategory(categoryRes.data);
      setRequestsByStatus(statusRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="reports-page">
      <h2>Reports</h2>
      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          Requests per Team
        </button>
        <button
          className={`tab-button ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          Requests per Category
        </button>
        <button
          className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          Requests by Status
        </button>
      </div>

      <div className="report-content">
        {activeTab === 'team' && (
          <div className="report-section">
            <h3>Requests per Team</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Request Count</th>
                </tr>
              </thead>
              <tbody>
                {requestsPerTeam.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="no-data">
                      No data available
                    </td>
                  </tr>
                ) : (
                  requestsPerTeam.map((item) => (
                    <tr key={item.id}>
                      <td>{item.team_name || 'Unassigned'}</td>
                      <td>{item.request_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'category' && (
          <div className="report-section">
            <h3>Requests per Equipment Category</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Request Count</th>
                </tr>
              </thead>
              <tbody>
                {requestsPerCategory.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="no-data">
                      No data available
                    </td>
                  </tr>
                ) : (
                  requestsPerCategory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category_name || 'Uncategorized'}</td>
                      <td>{item.request_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="report-section">
            <h3>Requests by Status</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {requestsByStatus.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="no-data">
                      No data available
                    </td>
                  </tr>
                ) : (
                  requestsByStatus.map((item, index) => (
                    <tr key={index}>
                      <td>{item.status}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;


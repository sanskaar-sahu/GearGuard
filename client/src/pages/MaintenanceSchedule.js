import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './MaintenanceSchedule.css';

const MaintenanceSchedule = () => {
  const [date, setDate] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [selectedDateRequests, setSelectedDateRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPreventiveRequests();
  }, []);

  useEffect(() => {
    filterRequestsByDate(date);
  }, [date, requests]);

  const fetchPreventiveRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/requests?type=Preventive');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching preventive requests:', error);
    }
  };

  const filterRequestsByDate = (selectedDate) => {
    const filtered = requests.filter((req) => {
      if (!req.scheduled_date) return false;
      const reqDate = new Date(req.scheduled_date);
      return (
        reqDate.getDate() === selectedDate.getDate() &&
        reqDate.getMonth() === selectedDate.getMonth() &&
        reqDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    setSelectedDateRequests(filtered);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateRequests = requests.filter((req) => {
        if (!req.scheduled_date) return false;
        const reqDate = new Date(req.scheduled_date);
        return (
          reqDate.getDate() === date.getDate() &&
          reqDate.getMonth() === date.getMonth() &&
          reqDate.getFullYear() === date.getFullYear()
        );
      });
      return dateRequests.length > 0 ? (
        <div className="calendar-dot">{dateRequests.length}</div>
      ) : null;
    }
    return null;
  };

  return (
    <div className="maintenance-schedule">
      <div className="schedule-header">
        <h2>Maintenance Schedule</h2>
        <button className="btn-primary" onClick={() => navigate('/requests/new')}>
          + Schedule Maintenance
        </button>
      </div>

      <div className="schedule-content">
        <div className="calendar-section">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            className="maintenance-calendar"
          />
        </div>

        <div className="schedule-list">
          <h3>Tasks for {date.toLocaleDateString()}</h3>
          {selectedDateRequests.length === 0 ? (
            <p className="no-tasks">No tasks scheduled for this date</p>
          ) : (
            <div className="task-list">
              {selectedDateRequests.map((request) => (
                <div
                  key={request.id}
                  className="schedule-task-card"
                  onClick={() => navigate(`/requests/${request.id}/edit`)}
                >
                  <h4>{request.subject}</h4>
                  <p className="equipment">{request.equipment_name || 'No Equipment'}</p>
                  <p className="team">{request.team_name || 'No Team'}</p>
                  <span className={`status-badge ${request.status.toLowerCase().replace(' ', '-')}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;


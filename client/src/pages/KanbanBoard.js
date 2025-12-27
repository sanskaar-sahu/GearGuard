import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'New', title: 'New', color: '#3498db' },
    { id: 'In Progress', title: 'In Progress', color: '#f39c12' },
    { id: 'Repaired', title: 'Repaired', color: '#2ecc71' },
    { id: 'Scrap', title: 'Scrap', color: '#e74c3c' },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Error fetching requests: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    try {
      await axios.patch(`http://localhost:5000/api/requests/${draggableId}/status`, {
        status: newStatus,
      });

      setRequests((prev) =>
        prev.map((req) => (req.id === parseInt(draggableId) ? { ...req, status: newStatus } : req))
      );
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getRequestsByStatus = (status) => {
    return requests.filter((req) => req.status === status);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <h2>Maintenance Kanban Board</h2>
        <button className="btn-primary" onClick={() => navigate('/requests/new')}>
          + New Request
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column">
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="column-count">{getRequestsByStatus(column.id).length}</span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {getRequestsByStatus(column.id).map((request, index) => (
                      <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''} ${
                              isOverdue(request.due_date) ? 'overdue' : ''
                            }`}
                            onClick={() => navigate(`/requests/${request.id}/edit`)}
                          >
                            {isOverdue(request.due_date) && (
                              <div className="overdue-indicator">Overdue</div>
                            )}
                            <div className="card-header">
                              <h4>{request.subject}</h4>
                              {request.assigned_to_name && (
                                <div className="assignee-avatar">
                                  {request.assigned_to_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="card-body">
                              <p className="equipment-name">{request.equipment_name || 'No Equipment'}</p>
                              {request.due_date && (
                                <p className="due-date">
                                  Due: {new Date(request.due_date).toLocaleDateString()}
                                </p>
                              )}
                              {request.team_name && <p className="team-name">{request.team_name}</p>}
                            </div>
                            <div className="card-footer">
                              <span className={`priority-badge ${request.priority?.toLowerCase()}`}>
                                {request.priority}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;


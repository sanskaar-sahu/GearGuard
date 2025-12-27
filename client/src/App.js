import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import EquipmentForm from './pages/EquipmentForm';
import EquipmentRequests from './pages/EquipmentRequests';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import WorkCenter from './pages/WorkCenter';
import Teams from './pages/Teams';
import Reports from './pages/Reports';
import KanbanBoard from './pages/KanbanBoard';
import RequestForm from './pages/RequestForm';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipment"
            element={
              <PrivateRoute>
                <Equipment />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipment/new"
            element={
              <PrivateRoute>
                <EquipmentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipment/:id/edit"
            element={
              <PrivateRoute>
                <EquipmentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipment/:id/requests"
            element={
              <PrivateRoute>
                <EquipmentRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance-schedule"
            element={
              <PrivateRoute>
                <MaintenanceSchedule />
              </PrivateRoute>
            }
          />
          <Route
            path="/work-center"
            element={
              <PrivateRoute>
                <WorkCenter />
              </PrivateRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <PrivateRoute>
                <Teams />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <PrivateRoute>
                <KanbanBoard />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests/new"
            element={
              <PrivateRoute>
                <RequestForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests/:id/edit"
            element={
              <PrivateRoute>
                <RequestForm />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


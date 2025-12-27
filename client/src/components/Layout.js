import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const tabs = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/kanban', label: 'Kanban Board' },
    { path: '/equipment', label: 'Equipment' },
    { path: '/maintenance-schedule', label: 'Maintenance Schedule' },
    { path: '/work-center', label: 'Work Center' },
    { path: '/teams', label: 'Teams' },
    { path: '/reports', label: 'Reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <h1>GearGuard: The Ultimate Maintenance Tracker</h1>
        <div className="header-actions">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      <nav className="nav-tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;


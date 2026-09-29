import React from 'react';
import { BACKEND_URL } from '../services/api';

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) {
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleDbAdmin = () => {
    window.open(`${BACKEND_URL}/admin`, '_blank');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar Drawer */}
      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-dot"></span>
            <h3>PikGrow Admin</h3>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section-title">Navigation</div>
          <nav className="sidebar-nav">
            <button
              id="sidebarApiBtn"
              className={`sidebar-nav-item ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => handleSelectTab('api')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span>API Dashboard</span>
            </button>

            <button
              id="sidebarUsersBtn"
              className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleSelectTab('users')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>User Metrics</span>
            </button>
          </nav>

          <div className="sidebar-section-title">Management</div>
          <nav className="sidebar-nav">
            <button
              id="sidebarDbAdminBtn"
              className="sidebar-nav-item db-admin-item"
              onClick={handleDbAdmin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              <span>DB Admin</span>
              <span className="external-badge">↗</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <small>FastAPI • PostgreSQL • Live</small>
        </div>
      </aside>
    </>
  );
}

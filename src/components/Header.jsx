import React from 'react';

export default function Header({
  activeTab,
  onRefresh,
  onToggleSidebar,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          id="menuBtn"
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
          title="Open Menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div>
          <h1>
            {activeTab === 'api' ? 'API Monitoring Dashboard' : 'User Metrics Dashboard'}
          </h1>
          <p>
            FastAPI • PostgreSQL • {activeTab === 'api' ? 'Real-time Monitoring' : 'User Analytics'}
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          id="refreshBtn"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>
    </header>
  );
}

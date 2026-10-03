import React from 'react';

export default function Header({
  activeTab,
  onRefresh,
  onToggleSidebar,
  theme = 'light',
  onToggleTheme,
}) {
  const getTitle = () => {
    switch (activeTab) {
      case 'analytics':
        return 'Analytics';
      case 'admin':
        return 'Database Admin Dashboard';
      case 'api':
      default:
        return 'API Monitoring Dashboard';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'analytics':
        return 'Farmer Overviews & Harvest Forecast';
      case 'admin':
        return 'Database Management';
      case 'api':
      default:
        return 'Real-time Monitoring';
    }
  };

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
          <h1>{getTitle()}</h1>
          <p>FastAPI • PostgreSQL • {getSubtitle()}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Dark / Light Mode Switch */}
        <button
          id="themeToggleBtn"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              {/* Sun icon for switching to light mode */}
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="theme-icon sun-icon"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <span className="theme-toggle-label">Light</span>
            </>
          ) : (
            <>
              {/* Moon icon for switching to dark mode */}
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="theme-icon moon-icon"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <span className="theme-toggle-label">Dark</span>
            </>
          )}
        </button>

        <button
          id="refreshBtn"
          onClick={onRefresh}
          title="Refresh Dashboard Data"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '6px', verticalAlign: '-1px' }}
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>
    </header>
  );
}

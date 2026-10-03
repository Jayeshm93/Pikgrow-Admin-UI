import React, { useRef } from 'react';

export default function DbAdminView() {
  const iframeRef = useRef(null);

  const handleOpenExternal = () => {
    window.open('/admin', '_blank');
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/admin';
    }
  };

  return (
    <section className="panel db-admin-panel">
      <div className="panel-title db-admin-panel-title">
        <span>PostgreSQL Database Admin (SQLAdmin)</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="db-admin-ext-btn"
            onClick={handleReload}
            title="Reload SQLAdmin Console"
          >
            ↻ Reload
          </button>
          <button
            className="db-admin-ext-btn"
            onClick={handleOpenExternal}
            title="Open in new window"
          >
            Open in New Window ↗
          </button>
        </div>
      </div>

      <div className="iframe-container">
        <iframe
          ref={iframeRef}
          src="/admin"
          title="SQLAdmin Console"
          className="db-admin-iframe"
        />
      </div>
    </section>
  );
}

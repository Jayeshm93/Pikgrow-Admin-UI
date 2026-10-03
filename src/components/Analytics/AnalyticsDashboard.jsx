import React, { useState } from 'react';
import AnalyticsOverview from './AnalyticsOverview';
import BuyerAnalyticsOverview from './BuyerAnalyticsOverview';

export default function AnalyticsDashboard({ theme = 'light', refreshTrigger }) {
  const [activeSubTab, setActiveSubTab] = useState('farmer');

  return (
    <div className="analytics-container">
      {/* Sub-navigation bar */}
      <div className="analytics-nav-bar">
        <div className="analytics-tab-group">
          {/* Farmer Overviews Tab */}
          <button
            id="farmerOverviewTab"
            className={`analytics-tab-btn ${activeSubTab === 'farmer' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('farmer')}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Farmer Overviews</span>
          </button>

          {/* Buyer Overviews Tab */}
          <button
            id="buyerOverviewTab"
            className={`analytics-tab-btn ${activeSubTab === 'buyer' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('buyer')}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Buyer Overviews</span>
          </button>
        </div>
      </div>

      {/* Main Sub-tab View (refreshes ONLY the currently opened section) */}
      {activeSubTab === 'farmer' && <AnalyticsOverview theme={theme} refreshTrigger={refreshTrigger} />}
      {activeSubTab === 'buyer' && <BuyerAnalyticsOverview theme={theme} refreshTrigger={refreshTrigger} />}
    </div>
  );
}

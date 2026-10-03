import React, { useEffect, useState, useCallback } from 'react';
import { getBuyerAnalytics } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BuyerAnalyticsOverview({ theme = 'light', refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerData, setBuyerData] = useState(null);

  const fetchBuyerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBuyerAnalytics();
      setBuyerData(res?.data || null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load buyer analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBuyerData();
  }, [fetchBuyerData]);

  // Respond to main header refresh trigger when buyer overview is open
  useEffect(() => {
    if (refreshTrigger) {
      fetchBuyerData();
    }
  }, [refreshTrigger, fetchBuyerData]);

  const metrics = buyerData?.buyer_metrics || {};
  const growthOverview = buyerData?.growth_overview || {};
  const buyerGrowth = Array.isArray(growthOverview?.buyer_growth) ? growthOverview.buyer_growth : [];
  const buyerTypes = Array.isArray(buyerData?.buyer_type_distribution) ? buyerData.buyer_type_distribution : [];
  const recentTrades = Array.isArray(buyerData?.recent_trades) ? buyerData.recent_trades : [];

  const totalBuyers = metrics.total_buyers;
  const activeBuyers30d = metrics.active_buyers_30d;
  const inactiveBuyers = metrics.inactive_buyers;
  const activeEngagementPct = metrics.active_engagement_pct;
  const totalTradedBuyers = metrics.total_traded_buyers;
  const tradedBuyersPct = metrics.traded_buyers_pct;
  const newBuyers30d = metrics.new_buyers_30d;
  const growthRatePct = metrics.growth_rate_pct;

  const verifiedBuyers = metrics.verified_buyers;
  const totalTrades = metrics.total_trades;
  const completedTrades = metrics.completed_trades;
  const totalTradeVolumeVal = metrics.total_trade_volume_val;
  const totalTradeQuantityQ = metrics.total_trade_quantity_q;

  const isDark = theme === 'dark';

  // Helper to format values: display '-' if not connected to backend or null
  const displayVal = (val, suffix = '') => {
    if (loading) return '...';
    if (val === null || val === undefined) return '-';
    return `${val.toLocaleString()}${suffix}`;
  };

  // Buyer Growth Chart Configuration (Cumulative)
  const growthLabels = buyerGrowth.map((d) => (d.month ? d.month.split(' ')[0] : ''));
  const growthValues = buyerGrowth.map((d) => d.cumulative_count);

  const buyerGrowthChartData = {
    labels: growthLabels,
    datasets: [
      {
        label: 'Cumulative Buyers',
        data: growthValues,
        borderColor: '#0284c7', // Sky Blue
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const buyerGrowthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          color: isDark ? '#cbd5e1' : '#475569',
          font: { size: 12, weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: isDark ? '#334155' : 'transparent',
        borderWidth: isDark ? 1 : 0,
        padding: 10,
        cornerRadius: 8,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return buyerGrowth[idx]?.month || items[0]?.label || '';
          },
          label: (context) => ` Total Buyers: ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, weight: '500' },
          color: isDark ? '#94a3b8' : '#64748b',
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: isDark ? '#334155' : '#f1f5f9' },
        ticks: {
          font: { size: 11 },
          color: isDark ? '#94a3b8' : '#64748b',
          precision: 0,
        },
      },
    },
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '-';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${Number(val).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="overview-container" style={{ marginTop: '16px' }}>
      {/* Overview Top Info Banner (without extra button - main header refresh controls this) */}
      <section className="overview-top-banner" style={{ marginBottom: '20px' }}>
        <div className="banner-text">
          <div className="banner-title-row">
            <h2>Buyer Ecosystem & Marketplace Analytics</h2>
            <span className="banner-badge banner-badge-live">
              <span className="live-pulse"></span>
              Live Platform Sync
            </span>
          </div>
          <p>
            Real-time insights on registered buyers, app activity, verified trading partners, and marketplace transaction volume.
          </p>
        </div>
      </section>

      {error && (
        <div className="panel" style={{ padding: '14px 18px', borderLeft: '4px solid #ef4444', marginBottom: '18px' }}>
          <p style={{ color: '#ef4444', margin: 0, fontWeight: 500, fontSize: '13px' }}>{error}</p>
        </div>
      )}

      {/* SECTION 1: BUYER COMMUNITY & ENGAGEMENT */}
      <div className="analytics-section-title-wrap">
        <h3 className="analytics-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Buyer Community & Engagement
        </h3>
        <span className="analytics-section-badge metric-badge-blue">
          {activeEngagementPct !== null && activeEngagementPct !== undefined
            ? `${activeEngagementPct}% Active Engagement`
            : '- Active Engagement'}
        </span>
      </div>

      <section className="metric-cards-grid metric-cards-5">
        {/* Ttl Buyers */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Buyers</span>
            <span className="metric-badge metric-badge-blue">Platform</span>
          </div>
          <div className="metric-value" id="totalBuyers">
            {displayVal(totalBuyers)}
          </div>
          <div className="metric-sub">Registered buyer accounts</div>
        </div>

        {/* Active Buyers - visit site */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Active Buyers</span>
            <span className="metric-badge metric-badge-green">Last 30d</span>
          </div>
          <div className="metric-value metric-value-green" id="activeBuyers30d">
            {displayVal(activeBuyers30d)}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">
              {activeEngagementPct !== null && activeEngagementPct !== undefined ? `${activeEngagementPct}% active` : '-'}
            </span>
            <span>visited site / app</span>
          </div>
        </div>

        {/* Total Traded Buyers */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Traded Buyers</span>
            <span className="metric-badge metric-badge-purple">Traders</span>
          </div>
          <div className="metric-value metric-value-purple" id="totalTradedBuyers">
            {displayVal(totalTradedBuyers)}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">
              {tradedBuyersPct !== null && tradedBuyersPct !== undefined ? `${tradedBuyersPct}% of total` : '-'}
            </span>
            <span>created trades</span>
          </div>
        </div>

        {/* New Buyers - last 30 days */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">New Buyers</span>
            <span className="metric-badge metric-badge-amber">Last 30d</span>
          </div>
          <div className="metric-value metric-value-amber" id="newBuyers30d">
            {loading ? '...' : (newBuyers30d !== null && newBuyers30d !== undefined ? `+${newBuyers30d.toLocaleString()}` : '-')}
          </div>
          <div className="metric-sub">Joined in the last month</div>
        </div>

        {/* Buyers growth rate */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Buyers Growth Rate</span>
            <span className={`metric-badge ${growthRatePct !== null && growthRatePct !== undefined ? (growthRatePct >= 0 ? 'metric-badge-green' : 'metric-badge-rose') : 'metric-badge-amber'}`}>
              {growthRatePct !== null && growthRatePct !== undefined ? 'MoM' : '-'}
            </span>
          </div>
          <div className={`metric-value ${growthRatePct !== null && growthRatePct !== undefined ? (growthRatePct >= 0 ? 'metric-value-green' : 'metric-value-rose') : ''}`} id="buyersGrowthRatePct">
            {loading ? '...' : (growthRatePct !== null && growthRatePct !== undefined ? `${growthRatePct > 0 ? '+' : ''}${growthRatePct}%` : '-')}
          </div>
          <div className="metric-sub">30-day registration momentum</div>
        </div>
      </section>

      {/* SECTION 2: BUYER GROWTH TRENDS */}
      <section className="panel chart-panel growth-combined-panel">
        <div className="panel-title flex-between">
          <div>
            <span>Buyer Growth Trends</span>
            <span className="panel-sub-caption">• Cumulative registered buyers over time</span>
          </div>
          <div className="growth-header-stats">
            <span className="growth-stat-pill" title="Total cumulative registered buyers">
              <span className="growth-stat-dot blue"></span>
              {totalBuyers !== null && totalBuyers !== undefined ? `${totalBuyers.toLocaleString()} Buyers` : '- Buyers'}
            </span>
            <span className="growth-stat-pill" title="Total active buyers in last 30 days">
              <span className="growth-stat-dot green"></span>
              {activeBuyers30d !== null && activeBuyers30d !== undefined ? `${activeBuyers30d.toLocaleString()} Active` : '- Active'}
            </span>
            <span className="growth-stat-pill" title="Verified business buyers">
              <span className="growth-stat-dot purple"></span>
              {verifiedBuyers !== null && verifiedBuyers !== undefined ? `${verifiedBuyers.toLocaleString()} Verified` : '- Verified'}
            </span>
          </div>
        </div>
        <div className="growth-chart-wrapper">
          {growthLabels && growthLabels.length > 0 ? (
            <Line data={buyerGrowthChartData} options={buyerGrowthChartOptions} />
          ) : (
            <div className="chart-empty-state">
              {loading ? 'Loading buyer growth data...' : 'No monthly buyer registration data available.'}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: MARKETPLACE TRADING & VOLUME */}
      <div className="analytics-section-title-wrap">
        <h3 className="analytics-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Marketplace Trade Volume & Performance
        </h3>
        <span className="analytics-section-badge metric-badge-green">
          {totalTrades !== null && totalTrades !== undefined ? `${totalTrades} Total Trades Recorded` : '- Total Trades Recorded'}
        </span>
      </div>

      <section className="metric-cards-grid metric-cards-4">
        {/* Total Trades */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Trades</span>
            <span className="metric-badge metric-badge-blue">Orders</span>
          </div>
          <div className="metric-value" id="totalTrades">
            {displayVal(totalTrades)}
          </div>
          <div className="metric-sub">Contracts initiated by buyers</div>
        </div>

        {/* Completed Trades */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Completed Trades</span>
            <span className="metric-badge metric-badge-green">Fulfilled</span>
          </div>
          <div className="metric-value metric-value-green" id="completedTrades">
            {displayVal(completedTrades)}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">
              {completedTrades !== null && completedTrades !== undefined && totalTrades
                ? `${Math.round((completedTrades / totalTrades) * 100)}%`
                : '-'}
            </span>
            <span>fulfillment rate</span>
          </div>
        </div>

        {/* Total Traded Volume */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Traded Commodity Volume</span>
            <span className="metric-badge metric-badge-amber">Volume</span>
          </div>
          <div className="metric-value metric-value-amber" id="totalTradeQty">
            {loading ? '...' : (totalTradeQuantityQ !== null && totalTradeQuantityQ !== undefined ? `${totalTradeQuantityQ.toLocaleString()} Quintals` : '-')}
          </div>
          <div className="metric-sub">Aggregate crop volume traded</div>
        </div>

        {/* Total Traded Value */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Gross Traded Value</span>
            <span className="metric-badge metric-badge-purple">Turnover</span>
          </div>
          <div className="metric-value metric-value-purple" id="totalTradeValue">
            {loading ? '...' : formatCurrency(totalTradeVolumeVal)}
          </div>
          <div className="metric-sub">Cumulative marketplace value</div>
        </div>
      </section>

      {/* SECTION 4: TABLES - BUYER TYPES & RECENT TRADES */}
      <div className="api-tables-grid">
        {/* Buyer Categories / Types */}
        <section className="panel">
          <div className="panel-title flex-between">
            <span>Buyer Classification & Types</span>
            <span className="count-pill">
              {buyerTypes.length > 0 ? `${buyerTypes.length} Types` : '-'}
            </span>
          </div>

          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Registered</th>
                  <th>Distribution %</th>
                </tr>
              </thead>
              <tbody>
                {buyerTypes && buyerTypes.length > 0 ? (
                  buyerTypes.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="table-crop-name">{item.buyer_type}</span>
                      </td>
                      <td>
                        <strong>{item.count.toLocaleString()}</strong>
                      </td>
                      <td>
                        <div className="crop-share-wrapper">
                          <span style={{ minWidth: '34px', fontWeight: 600, fontSize: '12px' }}>
                            {item.percentage}%
                          </span>
                          <div className="crop-share-bar-bg">
                            <div
                              className="crop-share-bar-fill"
                              style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="table-empty">
                      {loading ? 'Loading buyer classifications...' : 'No buyer classifications found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Buyer Trades */}
        <section className="panel">
          <div className="panel-title flex-between">
            <span>
              Recent Buyer Trades
              <span className="panel-sub-caption">• Latest Activity</span>
            </span>
            <span className="count-pill">
              {recentTrades.length > 0 ? `${recentTrades.length} Recorded` : '-'}
            </span>
          </div>

          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Status</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades && recentTrades.length > 0 ? (
                  recentTrades.map((item, idx) => {
                    const statusLower = (item.status || '').toLowerCase();
                    let badgeClass = 'status-pill-info';
                    if (statusLower === 'completed') badgeClass = 'status-pill-success';
                    else if (statusLower === 'cancelled' || statusLower === 'rejected') badgeClass = 'status-pill-error';
                    else if (statusLower === 'in_progress' || statusLower === 'accepted') badgeClass = 'status-pill-warning';

                    return (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="table-crop-name">{item.buyer_name}</span>
                            {item.buyer_mobile && (
                              <small style={{ color: '#94a3b8', fontSize: '11px' }}>{item.buyer_mobile}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${badgeClass}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <strong>{item.total_qty_q} <span className="table-unit">Q</span></strong>
                        </td>
                        <td>
                          <strong style={{ color: '#059669' }}>
                            {item.total_amount ? `₹${item.total_amount.toLocaleString()}` : '-'}
                          </strong>
                        </td>
                        <td>
                          <span className="table-date-text">{formatDate(item.created_at)}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="table-empty">
                      {loading ? 'Loading recent trades...' : 'No marketplace trades recorded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

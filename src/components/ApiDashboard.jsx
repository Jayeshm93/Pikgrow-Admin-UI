import React, { useMemo } from 'react';
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

export default function ApiDashboard({
  summary,
  dailySummary,
  endpoints,
  slowRequests,
  theme = 'light',
}) {
  const formatDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const getLatencyClass = (ms) => {
    const num = parseFloat(ms) || 0;
    if (num <= 100) return 'latency-fast';
    if (num <= 300) return 'latency-moderate';
    return 'latency-slow';
  };

  // Sort Endpoint Statistics by Total Requests (descending order)
  const sortedEndpoints = useMemo(() => {
    if (!endpoints || !Array.isArray(endpoints)) return [];
    return [...endpoints].sort((a, b) => {
      const aVal = typeof a.requests === 'number' ? a.requests : parseFloat(a.requests) || 0;
      const bVal = typeof b.requests === 'number' ? b.requests : parseFloat(b.requests) || 0;
      return bVal - aVal;
    });
  }, [endpoints]);

  // Sort Daily Summary table rows by Total Requests (descending order)
  const sortedDailySummary = useMemo(() => {
    if (!dailySummary || !Array.isArray(dailySummary)) return [];
    return [...dailySummary].sort((a, b) => {
      const aVal = typeof a.total_requests === 'number' ? a.total_requests : parseFloat(a.total_requests) || 0;
      const bVal = typeof b.total_requests === 'number' ? b.total_requests : parseFloat(b.total_requests) || 0;
      return bVal - aVal;
    });
  }, [dailySummary]);

  const totalReqs = summary?.total_requests ?? 0;
  const errorReqs = summary?.error_requests ?? 0;
  const successReqs = Math.max(0, totalReqs - errorReqs);
  const successRate = totalReqs > 0 ? ((successReqs / totalReqs) * 100).toFixed(1) : 100;
  const avgLatency = summary?.avg_latency_ms != null ? Number(summary.avg_latency_ms).toFixed(1) : '0';

  const chartLabels = (dailySummary || []).map((item) => item.date);
  const chartValues = (dailySummary || []).map((item) => item.total_requests);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Daily Requests',
        data: chartValues,
        fill: true,
        borderWidth: 2,
        tension: 0.25,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  const isDark = theme === 'dark';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: isDark ? '#334155' : 'transparent',
        borderWidth: isDark ? 1 : 0,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (context) => ` ${context.parsed.y.toLocaleString()} requests`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: isDark ? '#94a3b8' : '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
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

  return (
    <>
      {/* Summary Cards */}
      <section className="cards">
        {/* Total Requests */}
        <div className="card">
          <div className="card-top">
            <span>Total Requests</span>
            <span className="metric-badge metric-badge-blue">Traffic</span>
          </div>
          <h2 id="totalRequests">
            {totalReqs.toLocaleString()}
          </h2>
          <div className="card-sub">All logged HTTP requests</div>
        </div>

        {/* Success Rate */}
        <div className="card">
          <div className="card-top">
            <span>Success Rate</span>
            <span className="metric-badge metric-badge-green">Health</span>
          </div>
          <h2 id="successRate" className="metric-value-green">
            {successRate}%
          </h2>
          <div className="card-sub">
            <span className="metric-unit-tag">{successReqs.toLocaleString()}</span>
            <span>successful calls</span>
          </div>
        </div>

        {/* Error Requests */}
        <div className="card">
          <div className="card-top">
            <span>Error Requests</span>
            <span className={`metric-badge ${errorReqs > 0 ? 'metric-badge-rose' : 'metric-badge-green'}`}>
              {errorReqs > 0 ? 'Errors' : 'Clean'}
            </span>
          </div>
          <h2 id="errorRequests" className={errorReqs > 0 ? 'metric-value-rose' : 'metric-value-green'}>
            {errorReqs.toLocaleString()}
          </h2>
          <div className="card-sub">
            {errorReqs > 0 ? '4xx / 5xx exceptions' : 'Zero unhandled errors'}
          </div>
        </div>

        {/* Average Latency */}
        <div className="card">
          <div className="card-top">
            <span>Average Latency</span>
            <span className={`metric-badge ${parseFloat(avgLatency) <= 150 ? 'metric-badge-green' : 'metric-badge-amber'}`}>
              Speed
            </span>
          </div>
          <h2 id="avgLatency">
            {avgLatency} ms
          </h2>
          <div className="card-sub">Round-trip turnaround</div>
        </div>
      </section>

      {/* Daily Request Trend Chart */}
      <section className="panel chart-panel">
        <div className="panel-title flex-between">
          <span>
            Daily API Traffic
            <span className="panel-sub-caption">• Request volume timeline</span>
          </span>
          <span className="count-pill">{dailySummary?.length || 0} Days</span>
        </div>
        <div className="chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      {/* Tables Grid: Endpoint Statistics & Daily Summary */}
      <div className="api-tables-grid">
        {/* Endpoint Statistics */}
        <section className="panel">
          <div className="panel-title flex-between">
            <span>Endpoint Statistics</span>
            <span className="count-pill">{sortedEndpoints.length} Endpoints</span>
          </div>
          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Requests ▾</th>
                  <th>Avg Latency</th>
                </tr>
              </thead>
              <tbody id="endpointTable">
                {sortedEndpoints && sortedEndpoints.length > 0 ? (
                  sortedEndpoints.map((item, index) => (
                    <tr key={index}>
                      <td className="endpoint-name" title={item.endpoint}>
                        {item.endpoint}
                      </td>
                      <td>
                        <strong>{typeof item.requests === 'number' ? item.requests.toLocaleString() : item.requests}</strong>
                      </td>
                      <td>
                        <span className={`latency-tag ${getLatencyClass(item.avg_latency_ms)}`}>
                          {typeof item.avg_latency_ms === 'number'
                            ? `${item.avg_latency_ms.toFixed(1)} ms`
                            : `${item.avg_latency_ms} ms`}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="table-empty">
                      No endpoint records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Daily Summary */}
        <section className="panel">
          <div className="panel-title flex-between">
            <span>Daily Breakdown</span>
            <span className="count-pill">{sortedDailySummary.length} Days</span>
          </div>
          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Requests ▾</th>
                  <th>Errors</th>
                  <th>Avg Latency</th>
                </tr>
              </thead>
              <tbody id="dailyTable">
                {sortedDailySummary && sortedDailySummary.length > 0 ? (
                  sortedDailySummary.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{ fontWeight: 500 }}>{item.date}</span>
                      </td>
                      <td>
                        <strong>{typeof item.total_requests === 'number' ? item.total_requests.toLocaleString() : item.total_requests}</strong>
                      </td>
                      <td>
                        <span className={item.error_requests > 0 ? 'status-error' : 'status-success'}>
                          {item.error_requests}
                        </span>
                      </td>
                      <td>
                        <span className={`latency-tag ${getLatencyClass(item.avg_latency_ms)}`}>
                          {typeof item.avg_latency_ms === 'number' ? item.avg_latency_ms.toFixed(1) : item.avg_latency_ms} ms
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      No daily summary records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Top 20 Slow Requests */}
      <section className="panel">
        <div className="panel-title flex-between">
          <span>Top Slow Requests (P95 Latency)</span>
          <span className="count-pill">{slowRequests?.length || 0} Recorded</span>
        </div>
        <div className="table-scroll-container table-scroll-slow">
          <table>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody id="slowTable">
              {slowRequests && slowRequests.length > 0 ? (
                slowRequests.map((item, index) => {
                  const isErr = item.status_code >= 400;
                  return (
                    <tr key={index}>
                      <td className="endpoint-name" title={item.endpoint}>
                        {item.endpoint}
                      </td>
                      <td>
                        <span className={`method-badge method-${(item.method || 'get').toLowerCase()}`}>
                          {item.method}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${isErr ? 'status-pill-error' : 'status-pill-success'}`}>
                          {item.status_code}
                        </span>
                      </td>
                      <td>
                        <span className={`latency-tag ${item.duration_ms > 500 ? 'latency-slow' : 'latency-moderate'}`}>
                          {typeof item.duration_ms === 'number'
                            ? `${item.duration_ms.toFixed(1)} ms`
                            : `${item.duration_ms} ms`}
                        </span>
                      </td>
                      <td>
                        <span className="table-date-text">
                          {formatDate(item.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No slow requests recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}


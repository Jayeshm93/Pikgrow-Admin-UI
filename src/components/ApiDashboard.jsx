import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ApiDashboard({
  summary,
  dailySummary,
  endpoints,
  slowRequests,
}) {
  const formatDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const chartLabels = (dailySummary || []).map((item) => item.date);
  const chartValues = (dailySummary || []).map((item) => item.total_requests);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Requests',
        data: chartValues,
        fill: false,
        borderWidth: 3,
        tension: 0.3,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      {/* Summary Cards */}
      <section className="cards">
        <div className="card">
          <span>Total Requests</span>
          <h2 id="totalRequests">
            {summary ? summary.total_requests : 0}
          </h2>
        </div>

        <div className="card">
          <span>Error Requests</span>
          <h2 id="errorRequests">
            {summary ? summary.error_requests : 0}
          </h2>
        </div>

        <div className="card">
          <span>Average Latency</span>
          <h2 id="avgLatency">
            {summary ? `${summary.avg_latency_ms} ms` : '0 ms'}
          </h2>
        </div>
      </section>

      {/* Daily Chart */}
      <section className="panel">
        <div className="panel-title">
          Daily API Requests
        </div>
        <div style={{ padding: '20px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      {/* Endpoint Statistics */}
      <section className="panel">
        <div className="panel-title">
          Endpoint Statistics
        </div>
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Total Requests</th>
              <th>Average Latency</th>
            </tr>
          </thead>
          <tbody id="endpointTable">
            {endpoints &&
              endpoints.map((item, index) => (
                <tr key={index}>
                  <td>{item.endpoint}</td>
                  <td>{item.requests}</td>
                  <td>
                    {typeof item.avg_latency_ms === 'number'
                      ? `${item.avg_latency_ms.toFixed(2)} ms`
                      : `${item.avg_latency_ms} ms`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* Slow Requests */}
      <section className="panel">
        <div className="panel-title">
          Top 20 Slow Requests
        </div>
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Status</th>
              <th>Latency (ms)</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="slowTable">
            {slowRequests &&
              slowRequests.map((item, index) => {
                const statusClass =
                  item.status_code >= 400 ? 'status-error' : 'status-success';
                return (
                  <tr key={index}>
                    <td>{item.endpoint}</td>
                    <td>{item.method}</td>
                    <td className={statusClass}>{item.status_code}</td>
                    <td>
                      {typeof item.duration_ms === 'number'
                        ? item.duration_ms.toFixed(2)
                        : item.duration_ms}
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>

      {/* Daily Summary */}
      <section className="panel">
        <div className="panel-title">
          Daily Summary
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              <th>Errors</th>
              <th>Avg Latency</th>
            </tr>
          </thead>
          <tbody id="dailyTable">
            {dailySummary &&
              dailySummary.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.total_requests}</td>
                  <td>{item.error_requests}</td>
                  <td>{item.avg_latency_ms} ms</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

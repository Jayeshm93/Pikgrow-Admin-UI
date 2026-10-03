import React, { useEffect, useState, useCallback } from 'react';
import { getAnalyticsDashboard } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsOverview({ theme = 'light', refreshTrigger }) {
  const [harvestDays, setHarvestDays] = useState(30);
  const [tempDays, setTempDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async (days) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsDashboard({ harvest_days: days });
      // Support { success, data: { summary, farmer_metrics, crop_distribution, harvest_summary } } or direct
      const data = res?.data || res;
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(harvestDays);
  }, [fetchDashboard, harvestDays]);

  // Respond to main header refresh trigger when farmer overview is active
  useEffect(() => {
    if (refreshTrigger) {
      fetchDashboard(harvestDays);
    }
  }, [refreshTrigger, fetchDashboard, harvestDays]);

  const handleApplyDays = (e) => {
    if (e) e.preventDefault();
    const daysNum = Math.min(90, Math.max(1, parseInt(tempDays, 10) || 30));
    setTempDays(daysNum);
    setHarvestDays(daysNum);
  };

  const handlePresetDays = (days) => {
    setTempDays(days);
    setHarvestDays(days);
  };

  const summary = dashboardData?.summary || {};
  const farmerMetrics = dashboardData?.farmer_metrics || {};
  const cropDistribution = dashboardData?.crop_distribution || [];
  const harvestSummary = dashboardData?.harvest_summary || [];
  const growthOverview = dashboardData?.growth_overview || {};

  // Metrics extraction with safe fallbacks
  const totalFarmers = farmerMetrics.total_farmers ?? summary.farmers ?? 0;
  const activeFarmers30d = farmerMetrics.active_farmers_30d ?? 0;
  const inactiveFarmers = farmerMetrics.inactive_farmers ?? Math.max(0, totalFarmers - activeFarmers30d);
  const newFarmers30d = farmerMetrics.new_farmers_30d ?? 0;
  const growthRatePct = farmerMetrics.growth_rate_pct ?? 0;

  const totalFarms = farmerMetrics.total_farms ?? summary.farms ?? 0;
  const avgFarmSizeAc = farmerMetrics.avg_farm_size_ac ?? 0;
  const avgFarmSizeHa = farmerMetrics.avg_farm_size_ha ?? (avgFarmSizeAc * 0.404686).toFixed(2);

  const cultivatedAreaAc = farmerMetrics.cultivated_area_ac ?? summary.cultivated_area_ac ?? 0;
  const cultivatedAreaHa = farmerMetrics.cultivated_area_ha ?? summary.cultivated_area_ha ?? (cultivatedAreaAc * 0.404686).toFixed(2);
  const activeFarmSeasons = farmerMetrics.active_farm_seasons ?? summary.active_crop_seasons ?? 0;

  const totalMasterCrops = farmerMetrics.total_master_crops ?? cropDistribution.length;
  const totalHarvestedSeasons = farmerMetrics.total_harvested_seasons ?? 0;

  // 60 days before metrics
  const harvestedSeasons60d = farmerMetrics.harvested_seasons_60d ?? 0;
  const harvestProduce60dQ = farmerMetrics.harvest_produce_60d_q ?? 0;
  const harvestProduce60dTon = farmerMetrics.harvest_produce_60d_ton ?? (harvestProduce60dQ / 10).toFixed(2);

  const upcomingHarvests = summary.upcoming_harvests ?? 0;

  // Monthly Growth Data
  const farmerGrowth = Array.isArray(growthOverview?.farmer_growth) ? growthOverview.farmer_growth : [];
  const farmGrowth = Array.isArray(growthOverview?.farm_growth) ? growthOverview.farm_growth : [];
  const cropSeasonGrowth = Array.isArray(growthOverview?.crop_season_growth) ? growthOverview.crop_season_growth : [];

  const isDark = theme === 'dark';

  // Unified Platform Growth Multi-Line Chart (Cumulative Farmers, Farms, Crop Seasons)
  const growthLabels = (
    farmerGrowth.length > 0 ? farmerGrowth :
    farmGrowth.length > 0 ? farmGrowth :
    cropSeasonGrowth
  ).map((d) => d.month ? d.month.split(' ')[0] : '');

  const farmerGrowthValues = farmerGrowth.map((d) => d.cumulative_count);
  const farmGrowthValues = farmGrowth.map((d) => d.cumulative_count);
  const seasonGrowthValues = cropSeasonGrowth.map((d) => d.cumulative_count);

  const combinedGrowthData = {
    labels: growthLabels,
    datasets: [
      {
        label: 'Total Farmers',
        data: farmerGrowthValues,
        borderColor: '#2563eb', // Vibrant Blue
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Total Farms',
        data: farmGrowthValues,
        borderColor: '#059669', // Emerald Green
        backgroundColor: 'rgba(5, 150, 105, 0.06)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#059669',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Total Crop Seasons',
        data: seasonGrowthValues,
        borderColor: '#8b5cf6', // Violet Purple
        backgroundColor: 'rgba(139, 92, 246, 0.06)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const combinedGrowthOptions = {
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
            const fullMonth = farmerGrowth[idx]?.month || farmGrowth[idx]?.month || cropSeasonGrowth[idx]?.month;
            return fullMonth || items[0]?.label || '';
          },
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toLocaleString()}`,
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

  // Prepare chart data for Crop Distribution
  const cropLabels = cropDistribution.map(
    (item) => item.crop_name || item.name || item.crop || 'Unknown'
  );
  const cropValues = cropDistribution.map((item) => {
    const val = item.cultivated_area_ac ?? item.area_ac ?? item.area ?? item.crop_seasons ?? 0;
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  });

  const chartData = {
    labels: cropLabels,
    datasets: [
      {
        label: 'Cultivated Area (Acres)',
        data: cropValues,
        backgroundColor: '#2563eb',
        borderRadius: 4,
        maxBarThickness: 42,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
          label: (context) => ` ${context.parsed.y.toLocaleString()} Acres`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: isDark ? '#94a3b8' : '#64748b', maxRotation: 0, autoSkip: true },
      },
      y: {
        beginAtZero: true,
        grid: { color: isDark ? '#334155' : '#f1f5f9' },
        ticks: { font: { size: 11 }, color: isDark ? '#94a3b8' : '#64748b', precision: 0 },
      },
    },
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      return new Date(val).toLocaleDateString();
    } catch {
      return val;
    }
  };

  const formatAcres = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `${num} ${num === 1 ? 'Acre' : 'Acres'}`;
  };

  const formatHectares = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `${num} ${num === 1 ? 'Hectare' : 'Hectares'}`;
  };

  const formatQuintals = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `${num} ${num === 1 ? 'Quintal' : 'Quintals'}`;
  };

  const formatTonnes = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `${num} ${num === 1 ? 'Tonne' : 'Tonnes'}`;
  };

  const activeRatioPct = totalFarmers > 0 ? Math.round((activeFarmers30d / totalFarmers) * 100) : 0;

  return (
    <div className="analytics-overview">
      {/* Forecast Window Filter Bar */}
      <section className="panel" style={{ marginBottom: '18px' }}>
        <div className="harvest-filter-bar">
          <div className="harvest-filter-left">
            <div className="harvest-filter-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Forecast Window:</span>
              <span className="harvest-badge">{harvestDays} Days</span>
            </div>
            <div className="harvest-filter-scope">
              <span className="scope-dot"></span>
              <span>Applies to: <strong>Upcoming Harvests Card</strong> &amp; <strong>Schedule Table</strong></span>
            </div>
          </div>

          <div className="harvest-filter-right">
            <div className="harvest-preset-group">
              {[15, 30, 45, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`preset-btn ${harvestDays === d ? 'active' : ''}`}
                  onClick={() => handlePresetDays(d)}
                >
                  {d}d
                </button>
              ))}
            </div>

            <form onSubmit={handleApplyDays} className="harvest-custom-form">
              <label>Custom:</label>
              <input
                type="number"
                min="1"
                max="90"
                value={tempDays}
                onChange={(e) => setTempDays(e.target.value)}
              />
              <button type="submit" className="primary-btn-sm">
                Apply
              </button>
            </form>
          </div>
        </div>
      </section>

      {error && (
        <div className="panel" style={{ padding: '14px 18px', borderLeft: '4px solid #ef4444', marginBottom: '18px' }}>
          <p style={{ color: '#ef4444', margin: 0, fontWeight: 500, fontSize: '13px' }}>{error}</p>
        </div>
      )}

      {/* SECTION 1: FARMER COMMUNITY & ENGAGEMENT */}
      <div className="analytics-section-title-wrap">
        <h3 className="analytics-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Farmer Community & Activity
        </h3>
        <span className="analytics-section-badge metric-badge-blue">
          {activeRatioPct}% Active Engagement
        </span>
      </div>

      <section className="metric-cards-grid metric-cards-5">
        {/* Total Farmers */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Farmers</span>
            <span className="metric-badge metric-badge-blue">Platform</span>
          </div>
          <div className="metric-value" id="totalFarmers">
            {loading ? '...' : totalFarmers.toLocaleString()}
          </div>
          <div className="metric-sub">Registered farmer accounts</div>
        </div>

        {/* Active Farmers - Last 30 Days */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Active Farmers</span>
            <span className="metric-badge metric-badge-green">Last 30d</span>
          </div>
          <div className="metric-value metric-value-green" id="activeFarmers30d">
            {loading ? '...' : activeFarmers30d.toLocaleString()}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">{activeRatioPct}% active</span>
            <span>of total farmers</span>
          </div>
        </div>

        {/* Inactive Farmers */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Inactive Farmers</span>
            <span className="metric-badge metric-badge-amber">&gt; 30d Idle</span>
          </div>
          <div className="metric-value metric-value-amber" id="inactiveFarmers">
            {loading ? '...' : inactiveFarmers.toLocaleString()}
          </div>
          <div className="metric-sub">No activity in 30+ days</div>
        </div>

        {/* New Farmers - Last 30 Days */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">New Farmers</span>
            <span className="metric-badge metric-badge-purple">Last 30d</span>
          </div>
          <div className="metric-value metric-value-purple" id="newFarmers30d">
            {loading ? '...' : `+${newFarmers30d.toLocaleString()}`}
          </div>
          <div className="metric-sub">Joined in the last month</div>
        </div>

        {/* Farmers Growth Rate */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Farmers Growth</span>
            <span className={`metric-badge ${growthRatePct >= 0 ? 'metric-badge-green' : 'metric-badge-rose'}`}>
              MoM
            </span>
          </div>
          <div className={`metric-value ${growthRatePct >= 0 ? 'metric-value-green' : 'metric-value-rose'}`} id="growthRatePct">
            {loading ? '...' : `${growthRatePct > 0 ? '+' : ''}${growthRatePct}%`}
          </div>
          <div className="metric-sub">30-day registration growth</div>
        </div>
      </section>

      {/* SECTION 2: LAND & CULTIVATION PORTFOLIO */}
      <div className="analytics-section-title-wrap">
        <h3 className="analytics-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Farms & Cultivation Portfolio
        </h3>
        <span className="analytics-section-badge metric-badge-green">
          {formatAcres(cultivatedAreaAc)} ({formatHectares(cultivatedAreaHa)}) Cultivated
        </span>
      </div>

      <section className="metric-cards-grid metric-cards-6">
        {/* Total Farms */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Farms</span>
            <span className="metric-badge metric-badge-blue">Plots</span>
          </div>
          <div className="metric-value" id="totalFarms">
            {loading ? '...' : totalFarms.toLocaleString()}
          </div>
          <div className="metric-sub">Registered farm boundaries</div>
        </div>

        {/* Avg Farm Size - per farmer */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Avg Farm Size</span>
            <span className="metric-badge metric-badge-purple">Per Farmer</span>
          </div>
          <div className="metric-value" id="avgFarmSize">
            <span>{loading ? '...' : avgFarmSizeAc}</span>
            {!loading && <span className="metric-unit">{avgFarmSizeAc === 1 ? 'Acre' : 'Acres'}</span>}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">{formatHectares(avgFarmSizeHa)}</span>
            <span>average acreage</span>
          </div>
        </div>

        {/* Total Cultivated Area */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Cultivated Area</span>
            <span className="metric-badge metric-badge-green">Active</span>
          </div>
          <div className="metric-value metric-value-green" id="cultivatedArea">
            <span>{loading ? '...' : cultivatedAreaAc}</span>
            {!loading && <span className="metric-unit">{cultivatedAreaAc === 1 ? 'Acre' : 'Acres'}</span>}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">{formatHectares(cultivatedAreaHa)}</span>
            <span>currently in season</span>
          </div>
        </div>

        {/* Total Active Farm Seasons */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Active Seasons</span>
            <span className="metric-badge metric-badge-blue">Ongoing</span>
          </div>
          <div className="metric-value" id="activeFarmSeasons">
            {loading ? '...' : activeFarmSeasons.toLocaleString()}
          </div>
          <div className="metric-sub">Active crop cycles in field</div>
        </div>

        {/* Total Master Crops */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Master Crops</span>
            <span className="metric-badge metric-badge-purple">Catalog</span>
          </div>
          <div className="metric-value" id="totalMasterCrops">
            {loading ? '...' : totalMasterCrops.toLocaleString()}
          </div>
          <div className="metric-sub">Supported crop varieties</div>
        </div>

        {/* Total Harvested Seasons (All Time) */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Harvested Seasons</span>
            <span className="metric-badge metric-badge-amber">All-Time</span>
          </div>
          <div className="metric-value" id="totalHarvestedSeasons">
            {loading ? '...' : totalHarvestedSeasons.toLocaleString()}
          </div>
          <div className="metric-sub">Completed harvest cycles</div>
        </div>
      </section>

      {/* SECTION 3: PLATFORM GROWTH TRENDS (CUMULATIVE TIMELINE) */}
      <section className="panel chart-panel growth-combined-panel">
        <div className="panel-title flex-between">
          <div>
            <span>Platform Growth Trends</span>
            <span className="panel-sub-caption">• Farmers, Farms & Crop Seasons cumulative timeline</span>
          </div>
          <div className="growth-header-stats">
            <span className="growth-stat-pill" title="Total cumulative registered farmers">
              <span className="growth-stat-dot blue"></span>
              {totalFarmers.toLocaleString()} Farmers
            </span>
            <span className="growth-stat-pill" title="Total cumulative registered farms">
              <span className="growth-stat-dot green"></span>
              {totalFarms.toLocaleString()} Farms
            </span>
            <span className="growth-stat-pill" title="Total cumulative crop seasons">
              <span className="growth-stat-dot purple"></span>
              {cropSeasonGrowth.length > 0
                ? `${cropSeasonGrowth[cropSeasonGrowth.length - 1].cumulative_count.toLocaleString()} Seasons`
                : `${(totalHarvestedSeasons + activeFarmSeasons).toLocaleString()} Seasons`}
            </span>
          </div>
        </div>
        <div className="growth-chart-wrapper">
          {growthLabels && growthLabels.length > 0 ? (
            <Line data={combinedGrowthData} options={combinedGrowthOptions} />
          ) : (
            <div className="chart-empty-state">
              {loading ? 'Loading platform growth data...' : 'No monthly growth data available.'}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: RECENT HARVEST PERFORMANCE (60 DAYS BEFORE) */}
      <div className="analytics-section-title-wrap">
        <h3 className="analytics-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Harvest Performance & Window
        </h3>
        <span className="analytics-section-badge metric-badge-amber">
          Past 60 Days Realized + Next {harvestDays}d Forecast
        </span>
      </div>

      <section className="metric-cards-grid metric-cards-3">
        {/* Total Harvest Farm-Seasons (60 days before) */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Harvest Farm-Seasons</span>
            <span className="metric-badge metric-badge-amber">60d Before</span>
          </div>
          <div className="metric-value metric-value-amber" id="harvestedSeasons60d">
            {loading ? '...' : harvestedSeasons60d.toLocaleString()}
          </div>
          <div className="metric-sub">Harvested in past 60 days</div>
        </div>

        {/* Total Harvest Produce (60 days before) */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Harvest Produce</span>
            <span className="metric-badge metric-badge-amber">60d Realized</span>
          </div>
          <div className="metric-value metric-value-amber" id="harvestProduce60d">
            <span>{loading ? '...' : harvestProduce60dQ}</span>
            {!loading && <span className="metric-unit">{harvestProduce60dQ === 1 ? 'Quintal' : 'Quintals'}</span>}
          </div>
          <div className="metric-sub">
            <span className="metric-unit-tag">{formatTonnes(harvestProduce60dTon)}</span>
            <span>realized production</span>
          </div>
        </div>

        {/* Upcoming Harvests in selected window */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Upcoming Harvests</span>
            <span className="metric-badge metric-badge-green">Next {harvestDays}d</span>
          </div>
          <div className="metric-value metric-value-green" id="upcomingHarvests">
            {loading ? '...' : upcomingHarvests.toLocaleString()}
          </div>
          <div className="metric-sub">Estimated harvest pipeline</div>
        </div>
      </section>

      {/* SECTION 5: CROP CULTIVATED AREA DISTRIBUTION CHART */}
      {cropDistribution.length > 0 && cropValues.some((v) => v > 0) && (
        <section className="panel chart-panel">
          <div className="panel-title flex-between">
            <span>
              Cultivated Crop Area Distribution
              <span className="panel-sub-caption">• Acreage breakdown across active varieties</span>
            </span>
            <span className="count-pill">{cropDistribution.length} Crops</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>
      )}

      {/* SECTION 6: TABLES - AREA BY CULTIVATED CROP & HARVEST SUMMARY */}
      <div className="api-tables-grid">
        {/* Area by Cultivated Crop Table */}
        <section className="panel">
          <div className="panel-title flex-between">
            <span>Area by Cultivated Crop</span>
            <span className="count-pill">{cropDistribution.length} Crops</span>
          </div>

          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Crop & Variety</th>
                  <th>Active Seasons</th>
                  <th>Cultivated Area</th>
                  <th>Share %</th>
                </tr>
              </thead>
              <tbody>
                {cropDistribution && cropDistribution.length > 0 ? (
                  cropDistribution.map((item, idx) => {
                    const name = item.crop_name || item.name || item.crop || `Crop #${idx + 1}`;
                    const variety = item.crop_variety;
                    const seasons = item.crop_seasons ?? item.active_seasons ?? item.count ?? '-';
                    const areaAc = item.cultivated_area_ac ?? item.area_ac ?? item.area ?? 0;
                    const areaHa = item.cultivated_area_ha ?? (areaAc * 0.404686).toFixed(2);
                    const pct = item.percentage ?? 0;

                    return (
                      <tr key={idx}>
                        <td>
                          <span className="table-crop-name">{name}</span>
                          {variety && <span className="variety-pill">{variety}</span>}
                        </td>
                        <td>
                          <strong>{seasons}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{areaAc} <span className="table-unit">{areaAc === 1 ? 'Acre' : 'Acres'}</span></strong>
                            <small className="table-unit-sub" style={{ marginLeft: '6px', fontSize: '11px' }}>
                              ({formatHectares(areaHa)})
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="crop-share-wrapper">
                            <span style={{ minWidth: '34px', fontWeight: 600, fontSize: '12px' }}>{pct}%</span>
                            <div className="crop-share-bar-bg">
                              <div
                                className="crop-share-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      {loading ? 'Loading crop distribution...' : 'No active cultivated crops found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Harvest Summary Panel */}
        <section className="panel">
          <div className="panel-title flex-between">
            <span>
              Upcoming Harvest Schedule
              <span className="panel-sub-caption">• Next {harvestDays} Days Window</span>
            </span>
            <span className="count-pill">{harvestSummary.length} Planned</span>
          </div>

          <div className="table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Farm / Farmer</th>
                  <th>Est. Harvest Date</th>
                  <th>Est. Production</th>
                </tr>
              </thead>
              <tbody>
                {harvestSummary && harvestSummary.length > 0 ? (
                  harvestSummary.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="table-crop-name">{item.crop_name || item.crop || '-'}</span>
                      </td>
                      <td>
                        <span className="endpoint-name" style={{ maxWidth: '170px' }} title={item.farm_name || item.farmer_name || item.farm_id || '-'}>
                          {item.farm_name || item.farmer_name || item.farm_id || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="table-date-text">
                          {formatDate(
                            item.expected_harvest_date ||
                              item.harvest_date ||
                              item.estimated_harvest_start_date
                          )}
                        </span>
                      </td>
                      <td>
                        {item.estimated_production_q != null ? (
                          <span className="latency-tag latency-fast">
                            {formatQuintals(item.estimated_production_q)}
                          </span>
                        ) : item.production != null ? (
                          <span className="latency-tag latency-fast">
                            {formatQuintals(item.production)}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      {loading
                        ? 'Loading harvest summary...'
                        : `No upcoming harvests in the selected ${harvestDays}-day window.`}
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


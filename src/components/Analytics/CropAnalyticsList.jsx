import React, { useEffect, useState, useCallback } from 'react';
import { getCropAnalytics } from '../../services/api';

export default function CropAnalyticsList({ onSelectCropSeason }) {
  // Query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [cropId, setCropId] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [status, setStatus] = useState('');

  // Active filters applied to query
  const [appliedFilters, setAppliedFilters] = useState({
    cropId: '',
    district: '',
    taluka: '',
    status: '',
  });

  // Data state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 25,
    total: 0,
    total_pages: 0,
  });

  // Fetch crop analytics data
  const fetchData = useCallback(async (targetPage, targetPageSize, filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: targetPage,
        page_size: targetPageSize,
      };
      if (filters.cropId) params.crop_id = Number(filters.cropId) || filters.cropId;
      if (filters.district) params.district = filters.district.trim();
      if (filters.taluka) params.taluka = filters.taluka.trim();
      if (filters.status) params.status = filters.status;

      const res = await getCropAnalytics(params);
      // Support { success, data: { items, pagination } } or direct { items, pagination }
      const data = res?.data || res;
      setItems(data?.items || []);
      setPagination(
        data?.pagination || {
          page: targetPage,
          page_size: targetPageSize,
          total: data?.items?.length || 0,
          total_pages: 1,
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to load crop analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, pageSize, appliedFilters);
  }, [fetchData, page, pageSize, appliedFilters]);

  // Handle filter submission
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setAppliedFilters({
      cropId,
      district,
      taluka,
      status,
    });
  };

  // Handle filter reset
  const handleResetFilter = () => {
    setCropId('');
    setDistrict('');
    setTaluka('');
    setStatus('');
    setPage(1);
    setAppliedFilters({
      cropId: '',
      district: '',
      taluka: '',
      status: '',
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.total_pages || 1)) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(1);
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      return new Date(val).toLocaleDateString();
    } catch {
      return val;
    }
  };

  const formatHarvestWindow = (start, end) => {
    if (!start && !end) return '-';
    if (start && end) return `${formatDate(start)} → ${formatDate(end)}`;
    return formatDate(start || end);
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? val : `₹${num.toLocaleString()}`;
  };

  const formatConfidence = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (isNaN(num)) return val;
    const pct = num <= 1 ? (num * 100).toFixed(0) : num.toFixed(0);
    return `${pct}%`;
  };

  return (
    <div className="crop-analytics-section">
      {/* Filters Card */}
      <section className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Filters & Search</span>
          <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9 }}>
            Server-side Filter
          </span>
        </div>
        <form onSubmit={handleApplyFilter} className="filters-form">
          <div className="filters-grid">
            <div className="filter-field">
              <label>Crop ID</label>
              <input
                type="number"
                placeholder="e.g. 1, 2"
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label>District</label>
              <input
                type="text"
                placeholder="Enter district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label>Taluka</label>
              <input
                type="text"
                placeholder="Enter taluka"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="primary-btn">
              Apply Filters
            </button>
            <button type="button" className="secondary-btn" onClick={handleResetFilter}>
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Crop Analytics Table Panel */}
      <section className="panel">
        <div className="panel-title flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Crop Analytics & Monitoring</span>
            <span className="count-pill">{pagination.total || 0} Records</span>
          </div>
          {loading && <span className="sync-badge">Refreshing...</span>}
        </div>

        {error && (
          <div className="table-error-banner">
            <span>{error}</span>
          </div>
        )}

        <div className="table-scroll-container table-scroll-wide">
          <table>
            <thead>
              <tr>
                <th>Farm</th>
                <th>Farmer</th>
                <th>Crop</th>
                <th>Variety</th>
                <th>Area</th>
                <th>Soil</th>
                <th>Sowing Date</th>
                <th>Crop Age</th>
                <th>Status</th>
                <th>Harvest Window</th>
                <th>Est. Production</th>
                <th>Est. Revenue</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item, idx) => {
                  const statusNormalized = (item.status || '').toLowerCase();
                  const isCompleted = statusNormalized === 'completed';
                  return (
                    <tr
                      key={item.cs_id || idx}
                      className="clickable-row"
                      onClick={() => onSelectCropSeason(item.cs_id)}
                    >
                      <td style={{ fontWeight: 600 }}>{item.farm_name || item.farm_id || '-'}</td>
                      <td>{item.farmer_name || item.farmer_id || '-'}</td>
                      <td>
                        <span className="crop-pill">{item.crop_name || item.crop_id || '-'}</span>
                      </td>
                      <td>{item.crop_variety || '-'}</td>
                      <td>{item.farm_size_ac != null ? `${item.farm_size_ac} ac` : '-'}</td>
                      <td>{item.soil_type || '-'}</td>
                      <td>{formatDate(item.sowing_date)}</td>
                      <td>{item.crop_age_days != null ? `${item.crop_age_days}d` : '-'}</td>
                      <td>
                        <span className={`status-badge ${isCompleted ? 'badge-completed' : 'badge-active'}`}>
                          {item.status || 'active'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatHarvestWindow(
                          item.estimated_harvest_start_date,
                          item.estimated_harvest_end_date
                        )}
                      </td>
                      <td>{item.estimated_production_q != null ? `${item.estimated_production_q} q` : '-'}</td>
                      <td className="revenue-cell">
                        {formatCurrency(item.estimated_revenue)}
                      </td>
                      <td>
                        <span className="confidence-pill">
                          {formatConfidence(item.confidence_score)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-detail-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCropSeason(item.cs_id);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="14" className="table-empty">
                    {loading ? 'Fetching crop records...' : 'No crop season records found for the selected filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="pagination-bar">
          <div className="pagination-info">
            <span>
              Showing Page <strong>{pagination.page || page}</strong> of{' '}
              <strong>{pagination.total_pages || 1}</strong> ({pagination.total || 0} total seasons)
            </span>
          </div>

          <div className="pagination-controls">
            <div className="page-size-picker">
              <label>Rows per page:</label>
              <select value={pageSize} onChange={handlePageSizeChange}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="page-buttons">
              <button
                className="page-btn"
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(1)}
                title="First Page"
              >
                « First
              </button>
              <button
                className="page-btn"
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
                title="Previous Page"
              >
                ‹ Prev
              </button>
              <span className="page-current">Page {page}</span>
              <button
                className="page-btn"
                disabled={page >= (pagination.total_pages || 1) || loading}
                onClick={() => handlePageChange(page + 1)}
                title="Next Page"
              >
                Next ›
              </button>
              <button
                className="page-btn"
                disabled={page >= (pagination.total_pages || 1) || loading}
                onClick={() => handlePageChange(pagination.total_pages || 1)}
                title="Last Page"
              >
                Last »
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

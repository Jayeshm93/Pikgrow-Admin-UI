import React, { useEffect, useState } from 'react';
import { getCropAnalyticsDetail } from '../../services/api';

export default function CropAnalyticsDetail({ csId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCropAnalyticsDetail(csId);
        if (isMounted) {
          // Normalize if response wrapped in { success, data }
          const data = res?.data || res;
          setDetailData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch crop analytics detail');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (csId) {
      fetchDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [csId]);

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'number') {
      return Number.isInteger(val) ? val.toString() : val.toFixed(2);
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  };

  // Helper to extract section data from detailData using various key conventions
  const findSectionData = (keys) => {
    if (!detailData) return null;
    for (const k of keys) {
      if (detailData[k] !== undefined && detailData[k] !== null) {
        return detailData[k];
      }
    }
    return null;
  };

  // 10 sections requested in the prompt
  const sectionExtractors = [
    {
      id: 'crop_farm_info',
      title: 'Crop / Farm Information',
      icon: '🌱',
      keys: ['crop_farm_info', 'crop_information', 'farm_information', 'crop_info', 'farm_info', 'crop_farm', 'crop', 'farm'],
    },
    {
      id: 'harvest_info',
      title: 'Harvest Information',
      icon: '🌾',
      keys: ['harvest_info', 'harvest_information', 'harvest', 'harvest_details'],
    },
    {
      id: 'gdd',
      title: 'GDD (Growing Degree Days)',
      icon: '🌡️',
      keys: ['gdd', 'growing_degree_days', 'gdd_data', 'gdd_metrics'],
    },
    {
      id: 'soil_moisture',
      title: 'Soil Moisture',
      icon: '💧',
      keys: ['soil_moisture', 'soil_moisture_data', 'moisture', 'soil'],
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: '☀️',
      keys: ['weather', 'weather_data', 'current_weather', 'forecast'],
    },
    {
      id: 'active_diseases',
      title: 'Active Diseases',
      icon: '🦠',
      keys: ['active_diseases', 'diseases', 'disease_alerts', 'disease_risk'],
    },
    {
      id: 'irrigation_practices',
      title: 'Irrigation Practices',
      icon: '🚰',
      keys: ['irrigation_practices', 'irrigation', 'irrigation_schedule', 'irrigation_logs'],
    },
    {
      id: 'cultivation_practices',
      title: 'Cultivation Practices',
      icon: '🚜',
      keys: ['cultivation_practices', 'cultivation', 'farming_practices', 'agronomy_practices'],
    },
    {
      id: 'disease_sprays',
      title: 'Disease Sprays',
      icon: '🧴',
      keys: ['disease_sprays', 'sprays', 'spray_recommendations', 'spray_logs'],
    },
    {
      id: 'weather_alert',
      title: 'Weather Alert',
      icon: '⚠️',
      keys: ['weather_alert', 'weather_alerts', 'alerts', 'weather_warnings'],
    },
  ];

  // Render individual section data
  const renderSectionContent = (data) => {
    if (data === null || data === undefined) {
      return (
        <div className="section-empty-msg">
          <span>No recorded data for this section</span>
        </div>
      );
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div className="section-empty-msg">
            <span>No records available</span>
          </div>
        );
      }

      // Check if array of primitives
      if (typeof data[0] !== 'object' || data[0] === null) {
        return (
          <div className="tags-container">
            {data.map((item, idx) => (
              <span key={idx} className="data-tag">
                {String(item)}
              </span>
            ))}
          </div>
        );
      }

      // Array of objects -> render as card list or table
      const headers = Object.keys(data[0]);
      return (
        <div className="table-scroll-container" style={{ maxHeight: '260px' }}>
          <table>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{formatKey(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => (
                <tr key={rIdx}>
                  {headers.map((h) => (
                    <td key={h}>{formatValue(row[h])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (typeof data === 'object') {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        return (
          <div className="section-empty-msg">
            <span>No details recorded</span>
          </div>
        );
      }

      return (
        <div className="detail-kv-grid">
          {entries.map(([k, v]) => {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
              return (
                <div key={k} className="kv-card-nested">
                  <div className="kv-label">{formatKey(k)}</div>
                  <div className="nested-grid">
                    {Object.entries(v).map(([subK, subV]) => (
                      <div key={subK} className="kv-item">
                        <span className="kv-sub-label">{formatKey(subK)}:</span>{' '}
                        <span className="kv-value">{formatValue(subV)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            if (Array.isArray(v)) {
              return (
                <div key={k} className="kv-card-nested">
                  <div className="kv-label">{formatKey(k)}</div>
                  <div className="kv-array-content">
                    {renderSectionContent(v)}
                  </div>
                </div>
              );
            }
            return (
              <div key={k} className="kv-item">
                <span className="kv-label">{formatKey(k)}</span>
                <span className="kv-value">{formatValue(v)}</span>
              </div>
            );
          })}
        </div>
      );
    }

    // Primitive value
    return (
      <div className="kv-primitive">
        <span className="kv-value-lg">{formatValue(data)}</span>
      </div>
    );
  };

  // Find any leftover fields that weren't matched in the 10 sections
  const matchedKeys = new Set(
    sectionExtractors.flatMap((sec) => sec.keys)
  );
  const remainingKeys = detailData
    ? Object.keys(detailData).filter(
        (k) =>
          !matchedKeys.has(k) &&
          !['success', 'message', 'status'].includes(k) &&
          detailData[k] !== null &&
          detailData[k] !== undefined
      )
    : [];

  return (
    <div className="crop-detail-view">
      {/* Detail Header */}
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Crop Seasons</span>
        </button>

        <div className="detail-title-group">
          <h2>Crop Season Details</h2>
          <span className="cs-id-badge">CS ID: #{csId}</span>
        </div>
      </div>

      {loading && (
        <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '12px', color: '#64748b' }}>
            Loading Crop Season #{csId} details...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Unable to load details</h3>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
          <button className="primary-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && detailData && (
        <div className="detail-sections-container">
          {sectionExtractors.map((section) => {
            const data = findSectionData(section.keys);
            return (
              <section key={section.id} className="panel detail-section-panel">
                <div className="panel-title detail-section-title">
                  <span>
                    <span className="section-icon">{section.icon}</span> {section.title}
                  </span>
                  {data !== null && data !== undefined && (
                    <span className="section-has-data-dot" title="Data available"></span>
                  )}
                </div>
                <div className="section-body">
                  {renderSectionContent(data)}
                </div>
              </section>
            );
          })}

          {/* Any additional unmapped fields returned by the backend */}
          {remainingKeys.length > 0 && (
            <section className="panel detail-section-panel">
              <div className="panel-title detail-section-title">
                <span>📋 Additional Season Data</span>
              </div>
              <div className="section-body">
                <div className="detail-kv-grid">
                  {remainingKeys.map((k) => (
                    <div key={k} className="kv-item">
                      <span className="kv-label">{formatKey(k)}</span>
                      <span className="kv-value">{formatValue(detailData[k])}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

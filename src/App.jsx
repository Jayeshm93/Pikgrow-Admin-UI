import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ApiDashboard from './components/ApiDashboard';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import DbAdminView from './components/DbAdminView';
import {
  fetchSummary,
  fetchDailySummary,
  fetchEndpoints,
  fetchSlowRequests,
} from './services/api';

export default function App() {
  const getInitialTab = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#analytics') return 'analytics';
    if (hash === '#admin') return 'admin';
    return 'api';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('pikgrow_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // fallback
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('pikgrow_theme', theme);
    } catch (e) {
      // ignore
    }
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // API Dashboard Data
  const [summary, setSummary] = useState(null);
  const [dailySummary, setDailySummary] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [slowRequests, setSlowRequests] = useState([]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.location.hash = `#${tab}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTabState(getInitialTab());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load API Dashboard directly from live backend
  const loadApiDashboard = useCallback(async () => {
    try {
      const [sum, daily, ep, slow] = await Promise.all([
        fetchSummary(),
        fetchDailySummary(),
        fetchEndpoints(),
        fetchSlowRequests(),
      ]);
      setSummary(sum);
      setDailySummary(daily);
      setEndpoints(ep);
      setSlowRequests(slow);
    } catch (err) {
      console.error(err);
      alert('Unable to connect backend.');
    }
  }, []);

  // Refresh trigger for analytics active sub-tab (Farmer vs Buyer)
  const [analyticsRefreshTrigger, setAnalyticsRefreshTrigger] = useState(0);

  // Load active tab data or trigger refresh for open section
  const handleRefresh = useCallback(() => {
    if (activeTab === 'api') {
      loadApiDashboard();
    } else if (activeTab === 'analytics') {
      setAnalyticsRefreshTrigger((prev) => prev + 1);
    }
  }, [activeTab, loadApiDashboard]);

  // Initial load and tab change
  useEffect(() => {
    if (activeTab === 'api') {
      loadApiDashboard();
    }
  }, [activeTab, loadApiDashboard]);

  // Auto refresh every 30 seconds for the currently open section
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'api') {
        loadApiDashboard();
      } else if (activeTab === 'analytics') {
        setAnalyticsRefreshTrigger((prev) => prev + 1);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab, loadApiDashboard]);

  return (
    <div className="container">
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Header */}
      <Header
        activeTab={activeTab}
        onRefresh={handleRefresh}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Active Dashboard View */}
      {activeTab === 'api' && (
        <ApiDashboard
          summary={summary}
          dailySummary={dailySummary}
          endpoints={endpoints}
          slowRequests={slowRequests}
          theme={theme}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard theme={theme} refreshTrigger={analyticsRefreshTrigger} />
      )}

      {activeTab === 'admin' && (
        <DbAdminView theme={theme} />
      )}
    </div>
  );
}

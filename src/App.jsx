import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ApiDashboard from './components/ApiDashboard';
import UsersDashboard from './components/UsersDashboard';
import {
  fetchSummary,
  fetchDailySummary,
  fetchEndpoints,
  fetchSlowRequests,
  fetchUserCards,
  fetchRecentUsers,
} from './services/api';

export default function App() {
  const getInitialTab = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#users') return 'users';
    return 'api';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // API Dashboard Data
  const [summary, setSummary] = useState(null);
  const [dailySummary, setDailySummary] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [slowRequests, setSlowRequests] = useState([]);

  // User Dashboard Data
  const [userCards, setUserCards] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.location.hash = tab === 'users' ? '#users' : '#api';
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

  // Load User Dashboard directly from live backend
  const loadUsersDashboard = useCallback(async () => {
    try {
      const [cards, recent] = await Promise.all([
        fetchUserCards(),
        fetchRecentUsers(),
      ]);
      setUserCards(cards);
      setRecentUsers(recent);
    } catch (err) {
      console.error(err);
      alert('Unable to connect backend.');
    }
  }, []);

  // Load active tab data
  const loadDashboard = useCallback(() => {
    if (activeTab === 'api') {
      loadApiDashboard();
    } else {
      loadUsersDashboard();
    }
  }, [activeTab, loadApiDashboard, loadUsersDashboard]);

  // Initial load and tab change
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  return (
    <div className="container">
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Header */}
      <Header
        activeTab={activeTab}
        onRefresh={loadDashboard}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Active Dashboard View */}
      {activeTab === 'api' ? (
        <ApiDashboard
          summary={summary}
          dailySummary={dailySummary}
          endpoints={endpoints}
          slowRequests={slowRequests}
        />
      ) : (
        <UsersDashboard
          userCards={userCards}
          recentUsers={recentUsers}
        />
      )}
    </div>
  );
}

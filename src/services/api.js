// ==========================
// Backend Base URL
// ==========================
// In Vite dev, relative URLs are proxied to http://127.0.0.1:9000
// to avoid browser CORS origin blocks.
export const API_BASE = "";
export const BACKEND_URL = "http://localhost:9000";

// ==========================
// API Dashboard Endpoints
// ==========================

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error(`Summary fetch failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchDailySummary() {
  const res = await fetch(`${API_BASE}/daily-summary`);
  if (!res.ok) throw new Error(`Daily summary fetch failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchEndpoints() {
  const res = await fetch(`${API_BASE}/endpoints`);
  if (!res.ok) throw new Error(`Endpoints fetch failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchSlowRequests() {
  const res = await fetch(`${API_BASE}/slow`);
  if (!res.ok) throw new Error(`Slow requests fetch failed: ${res.statusText}`);
  return await res.json();
}

// ==========================
// User Dashboard Endpoints
// ==========================

export async function fetchUserCards() {
  const responses = await Promise.all([
    fetch(`${API_BASE}/users/total`),
    fetch(`${API_BASE}/users/monthly-active`),
    fetch(`${API_BASE}/users/weekly-active`),
    fetch(`${API_BASE}/users/farmers`),
    fetch(`${API_BASE}/users/active-farmers`),
    fetch(`${API_BASE}/users/buyers`),
    fetch(`${API_BASE}/users/active-buyers`),
  ]);

  const [
    totalUsers,
    monthlyUsers,
    weeklyUsers,
    farmers,
    activeFarmers,
    buyers,
    activeBuyers,
  ] = await Promise.all(
    responses.map(async (res) => {
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return res.json();
    })
  );

  return {
    totalUsers,
    monthlyUsers,
    weeklyUsers,
    farmers,
    activeFarmers,
    buyers,
    activeBuyers,
  };
}

export async function fetchRecentUsers() {
  const res = await fetch(`${API_BASE}/users/recently-active`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return await res.json();
}

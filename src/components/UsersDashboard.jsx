import React from 'react';

export default function UsersDashboard({
  userCards,
  recentUsers,
}) {
  const formatDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <>
      {/* User Summary Cards */}
      <section className="cards">
        <div className="card">
          <span>Total Users</span>
          <h2 id="totalUsers">
            {userCards?.totalUsers ? userCards.totalUsers.total_users : '0'}
          </h2>
        </div>

        <div className="card">
          <span>Monthly Active Users</span>
          <h2 id="monthlyUsers">
            {userCards?.monthlyUsers ? userCards.monthlyUsers.monthly_active_users : '0'}
          </h2>
        </div>

        <div className="card">
          <span>Weekly Active Users</span>
          <h2 id="weeklyUsers">
            {userCards?.weeklyUsers ? userCards.weeklyUsers.weekly_active_users : '0'}
          </h2>
        </div>

        <div className="card">
          <span>Total Farmers</span>
          <h2 id="farmers">
            {userCards?.farmers ? userCards.farmers.total_farmers : '0'}
          </h2>
        </div>

        <div className="card">
          <span>Active Farmers</span>
          <h2 id="activeFarmers">
            {userCards?.activeFarmers ? userCards.activeFarmers.active_farmers : '0'}
          </h2>
        </div>

        <div className="card">
          <span>Total Buyers</span>
          <h2 id="buyers">
            {userCards?.buyers ? userCards.buyers.total_buyers : '0'}
          </h2>
        </div>

        <div className="card">
          <span>Active Buyers</span>
          <h2 id="activeBuyers">
            {userCards?.activeBuyers ? userCards.activeBuyers.active_buyers : '0'}
          </h2>
        </div>
      </section>

      {/* Recently Active Users */}
      <section className="panel">
        <div className="panel-title">
          Recently Active Users
        </div>

        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody id="recentUsers">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <tr key={user.user_id || index}>
                  <td>{user.user_id}</td>
                  <td>{user.name ?? '-'}</td>
                  <td>{user.email ?? '-'}</td>
                  <td>{user.role ?? '-'}</td>
                  <td>{formatDate(user.last_active_at)}</td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </section>
    </>
  );
}

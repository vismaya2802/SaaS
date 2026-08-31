/**
 * Dashboard.jsx — Real-time Analytics Dashboard
 * Displays live metrics, KPIs, funnel visualization, and trending products
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  // Sample/fallback metrics data
  const defaultMetrics = {
    timestamp: new Date().toISOString(),
    active_sessions: 2,
    sessions_today: 15,
    conversion_rate: 8.5,
    revenue_today: 45000,
    ar_sessions_hour: 5,
    avg_session_duration: 240,
    active_experiments: 1,
    top_products: [{id: 'p1', title: 'Sample Product', try_count: 12}],
    funnel: [
      {stage: 'landing', count: 100, percentage: 100},
      {stage: 'view_product', count: 75, percentage: 75},
      {stage: 'try_ar', count: 50, percentage: 50},
      {stage: 'add_to_cart', count: 35, percentage: 35},
      {stage: 'checkout', count: 20, percentage: 20},
      {stage: 'payment', count: 15, percentage: 15},
      {stage: 'completed', count: 12, percentage: 12}
    ]
  };

  const [metrics, setMetrics] = useState(defaultMetrics);
  const [overview, setOverview] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  // Fetch overview data (HTTP)
  useEffect(() => {
    fetch(`${apiUrl}/dashboard/overview`)
      .then(res => res.json())
      .then(data => {
        setOverview(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load overview:', err);
        setLoading(false);
      });

    // Fetch active sessions
    fetch(`${apiUrl}/dashboard/sessions/active`)
      .then(res => res.json())
      .then(data => setActiveSessions(data.sessions || []))
      .catch(err => console.error('Failed to load sessions:', err));

    // Fetch trending products
    fetch(`${apiUrl}/dashboard/products/trending`)
      .then(res => res.json())
      .then(data => setTrendingProducts(data.trending_products || []))
      .catch(err => console.error('Failed to load trending:', err));
  }, [apiUrl]);

  // WebSocket for real-time metrics
  useEffect(() => {
    const wsBaseUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://').replace('/api', '');
    const socketUrl = `${wsBaseUrl}/api/dashboard/ws`;
    
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log('📊 Dashboard WebSocket connected');
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'metrics_update') {
        setMetrics(message.data);
      }
    };

    socket.onclose = () => {
      console.log('📊 Dashboard WebSocket disconnected');
      setConnected(false);
    };

    socket.onerror = (err) => {
      console.error('Dashboard WebSocket error:', err);
      setConnected(false);
      // Try HTTP fallback if WebSocket fails
      fetch(`${apiUrl}/dashboard/metrics`)
        .then(res => res.json())
        .then(data => setMetrics(data))
        .catch(e => console.error('HTTP fallback failed:', e));
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-gold-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 p-6 page-enter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Real-time business intelligence & metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-semibold">{connected ? 'Live' : 'Offline'}</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 rounded-lg transition-colors"
            >
              ← Back to Site
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Active Sessions"
              value={metrics.active_sessions}
              subtitle="Last 30 minutes"
              icon="👥"
              trend={null}
            />
            <KPICard
              title="Sessions Today"
              value={metrics.sessions_today}
              subtitle={`${metrics.conversion_rate}% conversion rate`}
              icon="📈"
              trend={null}
            />
            <KPICard
              title="Revenue Today"
              value={`₹${metrics.revenue_today.toLocaleString()}`}
              subtitle={`${metrics.ar_sessions_hour} AR tries (1h)`}
              icon="💰"
              trend={null}
            />
            <KPICard
              title="Avg. Session"
              value={`${Math.round(metrics.avg_session_duration)}s`}
              subtitle={`${metrics.active_experiments} A/B tests running`}
              icon="⏱️"
              trend={null}
            />
          </div>
        )}

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Summary */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gold-400 mb-4">Overview</h2>
              <div className="space-y-3">
                <StatRow label="Total Users" value={overview.overview.total_users} />
                <StatRow label="Total Products" value={overview.overview.total_products} />
                <StatRow label="Total Orders" value={overview.overview.total_orders} />
                <StatRow label="Paid Orders" value={overview.overview.paid_orders} />
                <StatRow label="Total Revenue" value={`₹${overview.overview.total_revenue.toLocaleString()}`} />
                <StatRow label="Avg Order Value" value={`₹${overview.overview.avg_order_value.toFixed(2)}`} />
              </div>
            </div>

            {/* Funnel Visualization */}
            {metrics?.funnel && (
              <div className="glass-card p-6 lg:col-span-2">
                <h2 className="text-xl font-bold text-gold-400 mb-4">Conversion Funnel (24h)</h2>
                <div className="space-y-2">
                  {metrics.funnel.map((stage, index) => (
                    <FunnelStage
                      key={stage.stage}
                      stage={stage.stage}
                      count={stage.count}
                      percentage={stage.percentage}
                      isFirst={index === 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts Row */}
        {overview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions Trend */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gold-400 mb-4">Sessions (7 Days)</h2>
              <SimpleTrendChart data={overview.trends.sessions_7d} dataKey="count" color="text-purple-400" />
            </div>

            {/* Revenue Trend */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gold-400 mb-4">Revenue (7 Days)</h2>
              <SimpleTrendChart data={overview.trends.revenue_7d} dataKey="amount" color="text-gold-400" prefix="₹" />
            </div>
          </div>
        )}

        {/* Top Products & Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Revenue Products */}
          {metrics?.top_products && metrics.top_products.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gold-400 mb-4">🔥 Most Tried (24h)</h2>
              <div className="space-y-3">
                {metrics.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between bg-charcoal-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gold-400">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{product.title}</p>
                        <p className="text-xs text-gray-400">{product.try_count} AR tries</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Products */}
          {trendingProducts.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gold-400 mb-4">📈 Trending Products</h2>
              <div className="space-y-3">
                {trendingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between bg-charcoal-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{product.title}</p>
                        <p className="text-xs text-gray-400">
                          {product.category} • ₹{product.price} • {product.try_count} tries
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions Table */}
        {activeSessions.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gold-400 mb-4">Active Sessions (Last 30 min)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-500/20 text-left">
                    <th className="p-3 text-gold-400">Session ID</th>
                    <th className="p-3 text-gold-400">Started</th>
                    <th className="p-3 text-gold-400">Last Activity</th>
                    <th className="p-3 text-gold-400">Page Views</th>
                    <th className="p-3 text-gold-400">Events</th>
                    <th className="p-3 text-gold-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.slice(0, 10).map((session) => (
                    <tr key={session.session_id} className="border-b border-charcoal-700 hover:bg-charcoal-800/50">
                      <td className="p-3 font-mono text-xs text-gray-300">{session.session_id.slice(0, 8)}...</td>
                      <td className="p-3 text-gray-400">{new Date(session.started_at).toLocaleTimeString()}</td>
                      <td className="p-3 text-gray-400">{new Date(session.last_activity_at).toLocaleTimeString()}</td>
                      <td className="p-3 text-center text-purple-400">{session.page_views}</td>
                      <td className="p-3 text-center text-blue-400">{session.events_count}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${session.converted ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {session.converted ? '✓ Converted' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

// Helper Components
const KPICard = ({ title, value, subtitle, icon, trend }) => (
  <div className="glass-card p-6 hover:scale-105 transition-transform duration-200">
    <div className="flex items-start justify-between mb-3">
      <span className="text-3xl">{icon}</span>
      {trend && (
        <span className={`text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
    <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
      {value}
    </p>
    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

const FunnelStage = ({ stage, count, percentage, isFirst }) => {
  const maxWidth = isFirst ? 100 : percentage;
  
  return (
    <div className="relative">
      <div
        className="bg-gradient-to-r from-gold-500 to-gold-600 h-12 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
        style={{ width: `${maxWidth}%` }}
      >
        <span className="text-sm font-bold text-charcoal-950 capitalize">
          {stage.replace('_', ' ')}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-charcoal-950">{count}</span>
          <span className="text-xs text-charcoal-950/80">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const SimpleTrendChart = ({ data, dataKey, color, prefix = '' }) => {
  const maxValue = Math.max(...data.map(d => d[dataKey]));
  
  return (
    <div className="space-y-2">
      {data.map((item) => {
        const percentage = (item[dataKey] / maxValue) * 100;
        return (
          <div key={item.date} className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className={`font-bold ${color}`}>{prefix}{item[dataKey].toLocaleString()}</span>
            </div>
            <div className="w-full bg-charcoal-800 rounded-full h-2">
              <div
                className={`bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;


import { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';

const API = 'http://localhost:4000/api';

export default function AdminPage() {
  // Stats
  const [stats, setStats] = useState({ online: 0, busy: 0, total: 0, pending: 0, active: 0, completed: 0 });
  // Drivers
  const [drivers, setDrivers] = useState([]);
  const [driverForm, setDriverForm] = useState({ name: '', category: 'HATCH', lat: '26.8467', lng: '80.9462' });
  const [spawnForm, setSpawnForm] = useState({ count: 5, radius: 3, lat: '26.8467', lng: '80.9462', category: 'Random' });
  // Rides
  const [rides, setRides] = useState([]);
  const [pendingRides, setPendingRides] = useState([]);
  const [rideFilter, setRideFilter] = useState({ status: 'all', category: 'all', search: '' });
  // Zones
  const [zoneForm, setZoneForm] = useState({ lat: '26.8467', lng: '80.9462', radius: 3, surgeMultiplier: 1.5 });
  const [zones, setZones] = useState([]);
  // UI
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const notify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [dRes, rStatsRes, dStatsRes, pRes, ridesRes, zRes] = await Promise.all([
        fetch(`${API}/drivers`),
        fetch(`${API}/rides/stats`),
        fetch(`${API}/drivers/stats`),
        fetch(`${API}/rides?status=pending`),
        fetch(`${API}/rides?${new URLSearchParams(rideFilter)}`),
        fetch(`${API}/zones`),
      ]);
      setDrivers(await dRes.json());
      const rStats = await rStatsRes.json();
      const dStats = await dStatsRes.json();
      setStats({ ...dStats, ...rStats });
      setPendingRides(await pRes.json());
      setRides(await ridesRes.json());
      setZones(await zRes.json());
    } catch (e) { console.error(e); }
  }, [rideFilter]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 4000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Driver actions
  async function addDriver(e) {
    e.preventDefault();
    try {
      await fetch(`${API}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...driverForm, lat: +driverForm.lat, lng: +driverForm.lng }),
      });
      setDriverForm({ name: '', category: 'HATCH', lat: '26.8467', lng: '80.9462' });
      notify('success', 'Driver added successfully');
      fetchAll();
    } catch (e) { notify('error', 'Failed to add driver'); }
  }

  async function spawnDrivers(e) {
    e.preventDefault();
    try {
      await fetch(`${API}/drivers/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...spawnForm, lat: +spawnForm.lat, lng: +spawnForm.lng, count: +spawnForm.count, radius: +spawnForm.radius }),
      });
      notify('success', `${spawnForm.count} drivers spawned!`);
      fetchAll();
    } catch (e) { notify('error', 'Failed to spawn drivers'); }
  }

  async function deleteDriver(id) {
    await fetch(`${API}/drivers/${id}`, { method: 'DELETE' });
    fetchAll();
  }

  // Ride actions
  async function generateRides() {
    try {
      await fetch(`${API}/rides/generate`, { method: 'POST' });
      notify('success', '5 ride requests generated!');
      fetchAll();
    } catch (e) { notify('error', 'Failed to generate rides'); }
  }

  async function fastForward() {
    try {
      const res = await fetch(`${API}/rides/fast-forward`, { method: 'POST' });
      const data = await res.json();
      notify('success', `Completed: ${data.completed}, Assigned: ${data.assigned}`);
      fetchAll();
    } catch (e) { notify('error', 'Fast-forward failed'); }
  }

  async function assignRide(rideId, driverId, driverName) {
    try {
      await fetch(`${API}/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', driverId, driverName }),
      });
      notify('success', 'Ride assigned!');
      fetchAll();
    } catch (e) { notify('error', 'Failed to assign ride'); }
  }

  async function cancelRide(rideId) {
    try {
      await fetch(`${API}/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      notify('success', 'Ride cancelled');
      fetchAll();
    } catch (e) { notify('error', 'Failed to cancel ride'); }
  }

  async function completeRide(rideId) {
    try {
      await fetch(`${API}/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      notify('success', 'Ride completed');
      fetchAll();
    } catch (e) { notify('error', 'Failed'); }
  }

  function exportCSV() {
    window.open(`${API}/rides/export`, '_blank');
  }

  // Zone actions
  async function createZone(e) {
    e.preventDefault();
    try {
      await fetch(`${API}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...zoneForm, lat: +zoneForm.lat, lng: +zoneForm.lng, radius: +zoneForm.radius, surgeMultiplier: +zoneForm.surgeMultiplier }),
      });
      notify('success', 'Surge zone created');
      fetchAll();
    } catch (e) { notify('error', 'Failed to create zone'); }
  }

  const onlineDrivers = drivers.filter(d => d.status === 'online');

  return (
    <div className="admin-page">
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          <span className="toast-icon">{notification.type === 'success' ? '✓' : '✕'}</span>
          {notification.text}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-badge admin-badge">
            <span className="pulse-dot"></span>
            Fleet Management Dashboard
          </div>
          <h2 className="page-title">Admin Control Center</h2>
          <p className="page-desc">Manage fleet, monitor rides, and control surge pricing in real-time.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-amber" onClick={generateRides}>
            ⚡ Generate 5 Rides
          </button>
          <button className="btn btn-purple" onClick={fastForward}>
            ⏩ Fast-forward
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.online}</span>
            <span className="stat-label">Online Drivers</span>
          </div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Rides</span>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {['overview', 'drivers', 'bookings', 'zones'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' && '📊'} {tab === 'drivers' && '🚘'} {tab === 'bookings' && '📋'} {tab === 'zones' && '🗺️'}
            {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div className="admin-overview-grid">
          {/* Pending Rides */}
          <div className="card">
            <div className="card-header">
              <h3>⏳ Pending Ride Requests</h3>
              <span className="badge badge-amber">{pendingRides.length} pending</span>
            </div>
            {pendingRides.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎉</span>
                <p>No pending rides</p>
              </div>
            ) : (
              <div className="pending-list">
                {pendingRides.map(ride => (
                  <div key={ride._id} className="pending-item">
                    <div className="pending-info">
                      <span className="ride-id">{ride.rideId}</span>
                      <span className="ride-cat-badge">{ride.category}</span>
                      <span className="ride-detail">📍 {ride.originLat.toFixed(3)},{ride.originLng.toFixed(3)}</span>
                      <span className="ride-detail">📐 {ride.distance} km</span>
                      <span className="ride-fare">₹{ride.fare}</span>
                    </div>
                    <div className="pending-actions">
                      {onlineDrivers.length > 0 && (
                        <select
                          className="assign-select"
                          defaultValue=""
                          onChange={e => {
                            const d = onlineDrivers.find(d => d._id === e.target.value);
                            if (d) assignRide(ride._id, d._id, d.name);
                          }}>
                          <option value="" disabled>Assign driver...</option>
                          {onlineDrivers.map(d => (
                            <option key={d._id} value={d._id}>{d.name} ({d.category})</option>
                          ))}
                        </select>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => cancelRide(ride._id)}>Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="card">
            <div className="card-header">
              <h3>🗺️ Live Fleet Map</h3>
              <span className="drivers-online">
                <span className="pulse-dot green"></span>
                {stats.online} online
              </span>
            </div>
            <div className="map-container">
              <MapView drivers={drivers} rides={pendingRides.concat(rides.filter(r => r.status === 'active'))} height="400px" />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Drivers */}
      {activeTab === 'drivers' && (
        <div className="admin-drivers-grid">
          {/* Add Driver */}
          <div className="card">
            <div className="card-header"><h3>➕ Add Driver</h3></div>
            <form onSubmit={addDriver} className="compact-form">
              <div className="form-row">
                <input placeholder="Driver Name" value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} required />
                <select value={driverForm.category} onChange={e => setDriverForm({ ...driverForm, category: e.target.value })}>
                  <option>HATCH</option><option>SEDAN</option><option>SUV</option>
                </select>
              </div>
              <div className="form-row">
                <input placeholder="Latitude" value={driverForm.lat} onChange={e => setDriverForm({ ...driverForm, lat: e.target.value })} />
                <input placeholder="Longitude" value={driverForm.lng} onChange={e => setDriverForm({ ...driverForm, lng: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-green">Add Driver</button>
            </form>
          </div>

          {/* Spawn Drivers */}
          <div className="card">
            <div className="card-header"><h3>🚀 Spawn Demo Drivers</h3></div>
            <form onSubmit={spawnDrivers} className="compact-form">
              <div className="form-row">
                <input type="number" placeholder="Count" value={spawnForm.count} onChange={e => setSpawnForm({ ...spawnForm, count: e.target.value })} />
                <input type="number" placeholder="Radius (km)" value={spawnForm.radius} onChange={e => setSpawnForm({ ...spawnForm, radius: e.target.value })} />
              </div>
              <div className="form-row">
                <input placeholder="Center Lat" value={spawnForm.lat} onChange={e => setSpawnForm({ ...spawnForm, lat: e.target.value })} />
                <input placeholder="Center Lng" value={spawnForm.lng} onChange={e => setSpawnForm({ ...spawnForm, lng: e.target.value })} />
              </div>
              <select value={spawnForm.category} onChange={e => setSpawnForm({ ...spawnForm, category: e.target.value })}>
                <option>Random</option><option>HATCH</option><option>SEDAN</option><option>SUV</option>
              </select>
              <button type="submit" className="btn btn-green">Spawn Drivers</button>
            </form>
          </div>

          {/* Drivers List */}
          <div className="card card-full">
            <div className="card-header">
              <h3>🚘 All Drivers ({drivers.length})</h3>
            </div>
            {drivers.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🚫</span>
                <p>No drivers registered yet. Add or spawn some above.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Category</th><th>Location</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {drivers.map(d => (
                      <tr key={d._id}>
                        <td className="font-medium">{d.name}</td>
                        <td><span className="ride-cat-badge">{d.category}</span></td>
                        <td className="text-muted">{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</td>
                        <td><span className={`status-badge status-${d.status}`}>{d.status}</span></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => deleteDriver(d._id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Bookings */}
      {activeTab === 'bookings' && (
        <div className="card">
          <div className="card-header">
            <h3>📋 Bookings & Analytics</h3>
            <button className="btn btn-sm btn-outline" onClick={exportCSV}>📥 Export CSV</button>
          </div>
          <div className="filter-bar">
            <select value={rideFilter.status} onChange={e => setRideFilter({ ...rideFilter, status: e.target.value })}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={rideFilter.category} onChange={e => setRideFilter({ ...rideFilter, category: e.target.value })}>
              <option value="all">All Categories</option>
              <option value="HATCH">HATCH</option>
              <option value="SEDAN">SEDAN</option>
              <option value="SUV">SUV</option>
            </select>
            <input type="text" placeholder="Search ride ID..." value={rideFilter.search} onChange={e => setRideFilter({ ...rideFilter, search: e.target.value })} />
          </div>
          {rides.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th><th>Ride ID</th><th>Rider</th><th>Cat</th><th>Status</th>
                    <th>Dist (km)</th><th>Dur (min)</th><th>Driver</th><th>Fare</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map(r => (
                    <tr key={r._id}>
                      <td className="text-muted">{new Date(r.createdAt).toLocaleTimeString()}</td>
                      <td className="font-medium">{r.rideId}</td>
                      <td>{r.riderName}</td>
                      <td><span className="ride-cat-badge">{r.category}</span></td>
                      <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                      <td>{r.distance}</td>
                      <td>{r.duration}</td>
                      <td>{r.driverName || '—'}</td>
                      <td className="font-medium">₹{r.fare}</td>
                      <td>
                        {r.status === 'active' && <button className="btn btn-sm btn-green" onClick={() => completeRide(r._id)}>Complete</button>}
                        {r.status === 'pending' && <button className="btn btn-sm btn-danger" onClick={() => cancelRide(r._id)}>Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Zones */}
      {activeTab === 'zones' && (
        <div className="admin-zones-grid">
          <div className="card">
            <div className="card-header"><h3>🗺️ Create Surge Zone</h3></div>
            <form onSubmit={createZone} className="compact-form">
              <div className="form-row">
                <div className="form-group"><label>Latitude</label><input value={zoneForm.lat} onChange={e => setZoneForm({ ...zoneForm, lat: e.target.value })} /></div>
                <div className="form-group"><label>Longitude</label><input value={zoneForm.lng} onChange={e => setZoneForm({ ...zoneForm, lng: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Radius (km)</label><input type="number" value={zoneForm.radius} onChange={e => setZoneForm({ ...zoneForm, radius: e.target.value })} /></div>
                <div className="form-group"><label>Surge Multiplier</label><input type="number" step="0.1" value={zoneForm.surgeMultiplier} onChange={e => setZoneForm({ ...zoneForm, surgeMultiplier: e.target.value })} /></div>
              </div>
              <button type="submit" className="btn btn-green">Create Zone</button>
            </form>
          </div>
          <div className="card">
            <div className="card-header"><h3>Active Zones ({zones.length})</h3></div>
            {zones.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🌐</span><p>No surge zones configured.</p></div>
            ) : (
              <div className="zones-list">
                {zones.map(z => (
                  <div key={z._id} className="zone-item">
                    <div>📍 {z.lat.toFixed(4)}, {z.lng.toFixed(4)} — {z.radius}km — {z.surgeMultiplier}x surge</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

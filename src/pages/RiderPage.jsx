import { useState, useEffect } from 'react';
import MapView from '../components/MapView';

const API = 'http://localhost:4000/api';

export default function RiderPage() {
  const [origin, setOrigin] = useState('26.8467,80.9462');
  const [destination, setDestination] = useState('26.8800,80.9200');
  const [category, setCategory] = useState('HATCH');
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [myRides, setMyRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notification, setNotification] = useState(null);

  const parsedOrigin = origin.split(',').map(Number);
  const parsedDest = destination.split(',').map(Number);

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDrivers() {
    try {
      const res = await fetch(`${API}/drivers?status=online`);
      const data = await res.json();
      setDrivers(data);
    } catch (e) { /* silently fail */ }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setOrigin(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`);
    });
  }

  async function requestRide(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const [oLat, oLng] = origin.split(',').map(Number);
      const [dLat, dLng] = destination.split(',').map(Number);
      const res = await fetch(`${API}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: oLat, originLng: oLng,
          destLat: dLat, destLng: dLng,
          category, riderName: riderName || 'Rider', riderPhone,
        }),
      });
      const ride = await res.json();
      setMyRides(prev => [ride, ...prev]);
      setNotification({ type: 'success', text: `Ride ${ride.rideId} booked! Estimated fare: ₹${ride.fare}` });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to book ride. Please try again.' });
      setTimeout(() => setNotification(null), 4000);
    }
    setLoading(false);
  }

  const fareEstimate = () => {
    const baseFare = { HATCH: 30, SEDAN: 50, SUV: 80 };
    const perKm = { HATCH: 10, SEDAN: 14, SUV: 18 };
    const [oLat, oLng] = origin.split(',').map(Number);
    const [dLat, dLng] = destination.split(',').map(Number);
    if (isNaN(oLat) || isNaN(dLat)) return '—';
    const R = 6371;
    const dLatR = (dLat - oLat) * Math.PI / 180;
    const dLngR = (dLng - oLng) * Math.PI / 180;
    const a = Math.sin(dLatR / 2) ** 2 + Math.cos(oLat * Math.PI / 180) * Math.cos(dLat * Math.PI / 180) * Math.sin(dLngR / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `₹${(baseFare[category] + perKm[category] * dist).toFixed(0)}`;
  };

  return (
    <div className="rider-page">
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          <span className="toast-icon">{notification.type === 'success' ? '✓' : '✕'}</span>
          {notification.text}
        </div>
      )}

      <div className="page-header">
        <div className="page-badge rider-badge">
          <span className="pulse-dot"></span>
          Live Ride Booking
        </div>
        <h2 className="page-title">Book Your Ride</h2>
        <p className="page-desc">Fast, reliable rides across Lucknow. Enter pickup & drop-off to get started.</p>
      </div>

      <div className="rider-grid">
        {/* Booking Form */}
        <div className="card booking-card">
          <div className="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Ride Details
            </h3>
            <span className="fare-badge">{fareEstimate()}</span>
          </div>

          <form onSubmit={requestRide} className="ride-form">
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" value={riderName} onChange={e => setRiderName(e.target.value)} placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" value={riderPhone} onChange={e => setRiderPhone(e.target.value)} placeholder="10-digit phone number" />
            </div>
            <div className="form-group">
              <label>Pickup Location <span className="label-hint">lat, lng</span></label>
              <div className="input-with-btn">
                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="26.8467,80.9462" required />
                <button type="button" className="btn-icon" onClick={useMyLocation} title="Use my location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Drop-off Location <span className="label-hint">lat, lng</span></label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="26.8800,80.9200" required />
            </div>
            <div className="form-group">
              <label>Vehicle Type</label>
              <div className="vehicle-selector">
                {['HATCH', 'SEDAN', 'SUV'].map(cat => (
                  <button key={cat} type="button"
                    className={`vehicle-option ${category === cat ? 'selected' : ''}`}
                    onClick={() => setCategory(cat)}>
                    <span className="vehicle-icon">{cat === 'HATCH' ? '🚗' : cat === 'SEDAN' ? '🚙' : '🚐'}</span>
                    <span className="vehicle-name">{cat}</span>
                    <span className="vehicle-price">₹{cat === 'HATCH' ? '10' : cat === 'SEDAN' ? '14' : '18'}/km</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <><span className="spinner"></span> Booking...</>
              ) : (
                <>🚕 Request Ride</>
              )}
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="card map-card">
          <div className="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              Live Map
            </h3>
            <span className="drivers-online">
              <span className="pulse-dot green"></span>
              {drivers.length} drivers online
            </span>
          </div>
          <div className="map-container">
            <MapView
              drivers={drivers}
              origin={!isNaN(parsedOrigin[0]) ? { lat: parsedOrigin[0], lng: parsedOrigin[1] } : null}
              destination={!isNaN(parsedDest[0]) ? { lat: parsedDest[0], lng: parsedDest[1] } : null}
              height="450px"
            />
          </div>
        </div>
      </div>

      {/* My Rides */}
      {myRides.length > 0 && (
        <div className="card rides-history-card">
          <div className="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Your Rides
            </h3>
          </div>
          <div className="rides-list">
            {myRides.map(ride => (
              <div key={ride._id} className="ride-card-item">
                <div className="ride-id">{ride.rideId}</div>
                <div className="ride-meta">
                  <span className={`status-badge status-${ride.status}`}>{ride.status}</span>
                  <span className="ride-cat">{ride.category}</span>
                  <span className="ride-dist">{ride.distance} km</span>
                  <span className="ride-fare">₹{ride.fare}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

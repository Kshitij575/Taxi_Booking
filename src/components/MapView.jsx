import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LUCKNOW = [26.8467, 80.9462];

const driverIcon = L.divIcon({
  html: `<div style="background:#10b981;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px rgba(16,185,129,0.6)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const originIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.6)"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destIcon = L.divIcon({
  html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(239,68,68,0.6)"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function MapView({ drivers = [], origin, destination, rides = [], height = '100%' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: LUCKNOW,
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add driver markers
    drivers.forEach(d => {
      if (d.lat && d.lng) {
        const m = L.marker([d.lat, d.lng], { icon: driverIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>${d.name}</b><br/>${d.category} · ${d.status}`);
        markersRef.current.push(m);
      }
    });

    // Add origin
    if (origin && origin.lat && origin.lng) {
      const m = L.marker([origin.lat, origin.lng], { icon: originIcon })
        .addTo(mapInstance.current)
        .bindPopup('📍 Pickup');
      markersRef.current.push(m);
    }

    // Add destination
    if (destination && destination.lat && destination.lng) {
      const m = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .addTo(mapInstance.current)
        .bindPopup('🏁 Drop-off');
      markersRef.current.push(m);
    }

    // Add ride markers
    rides.forEach(r => {
      if (r.originLat && r.originLng) {
        const m = L.marker([r.originLat, r.originLng], { icon: originIcon })
          .addTo(mapInstance.current)
          .bindPopup(`🚖 ${r.rideId}<br/>${r.status}`);
        markersRef.current.push(m);
      }
    });
  }, [drivers, origin, destination, rides]);

  return <div ref={mapRef} style={{ height, width: '100%', borderRadius: '12px' }} />;
}

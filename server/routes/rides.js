import { Router } from 'express';
import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';

const router = Router();

const BASE_FARE   = { HATCH: 30, SEDAN: 50, SUV: 80 };
const PER_KM      = { HATCH: 10, SEDAN: 14, SUV: 18 };

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// List rides with filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
    if (req.query.search) filter.rideId = { $regex: req.query.search, $options: 'i' };
    const rides = await Ride.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const pending   = await Ride.countDocuments({ status: 'pending' });
    const active    = await Ride.countDocuments({ status: 'active' });
    const completed = await Ride.countDocuments({ status: 'completed' });
    const cancelled = await Ride.countDocuments({ status: 'cancelled' });
    res.json({ pending, active, completed, cancelled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV
router.get('/export', async (req, res) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 }).lean();
    const header = 'RideID,Category,Status,Distance(km),Duration(min),SurgeMultiplier,Fare,CreatedAt\n';
    const rows = rides.map(r =>
      `${r.rideId},${r.category},${r.status},${r.distance.toFixed(2)},${r.duration},${r.surgeMultiplier},${r.fare.toFixed(2)},${r.createdAt}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create ride request
router.post('/', async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, category = 'HATCH', riderName, riderPhone } = req.body;
    const dist = haversine(originLat, originLng, destLat, destLng);
    const duration = Math.round(dist * 3 + Math.random() * 10); // rough estimate
    const fare = BASE_FARE[category] + PER_KM[category] * dist;

    const ride = await Ride.create({
      originLat, originLng, destLat, destLng,
      category, riderName, riderPhone,
      distance: Math.round(dist * 100) / 100,
      duration,
      fare: Math.round(fare * 100) / 100,
    });
    res.status(201).json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate 5 random ride requests (simulation)
router.post('/generate', async (req, res) => {
  try {
    const center = { lat: 26.8467, lng: 80.9462 };
    const cats = ['HATCH', 'SEDAN', 'SUV'];
    const names = ['Aarav', 'Vivaan', 'Aditya', 'Ishaan', 'Reyansh', 'Arjun', 'Kavya', 'Ananya', 'Diya', 'Priya'];
    const rides = [];
    for (let i = 0; i < 5; i++) {
      const oLat = center.lat + (Math.random() - 0.5) * 0.08;
      const oLng = center.lng + (Math.random() - 0.5) * 0.08;
      const dLat = center.lat + (Math.random() - 0.5) * 0.12;
      const dLng = center.lng + (Math.random() - 0.5) * 0.12;
      const cat = cats[Math.floor(Math.random() * 3)];
      const dist = haversine(oLat, oLng, dLat, dLng);
      const fare = BASE_FARE[cat] + PER_KM[cat] * dist;
      rides.push({
        originLat: oLat, originLng: oLng,
        destLat: dLat, destLng: dLng,
        category: cat,
        riderName: names[Math.floor(Math.random() * names.length)],
        riderPhone: '9' + Math.floor(Math.random() * 900000000 + 100000000),
        distance: Math.round(dist * 100) / 100,
        duration: Math.round(dist * 3 + Math.random() * 10),
        fare: Math.round(fare * 100) / 100,
      });
    }
    const created = await Ride.insertMany(rides);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update ride (assign driver, complete, cancel)
router.patch('/:id', async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    // If assigning a driver, mark driver busy
    if (req.body.status === 'active' && req.body.driverId) {
      await Driver.findByIdAndUpdate(req.body.driverId, { status: 'busy', currentRideId: ride._id });
    }
    // If completing, free the driver
    if (req.body.status === 'completed' && ride.driverId) {
      await Driver.findByIdAndUpdate(ride.driverId, { status: 'online', currentRideId: null });
    }
    res.json(ride);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fast-forward: complete all active rides
router.post('/fast-forward', async (req, res) => {
  try {
    const activeRides = await Ride.find({ status: 'active' });
    for (const ride of activeRides) {
      ride.status = 'completed';
      await ride.save();
      if (ride.driverId) {
        await Driver.findByIdAndUpdate(ride.driverId, { status: 'online', currentRideId: null });
      }
    }
    // Also auto-assign pending rides to available drivers
    const pendingRides = await Ride.find({ status: 'pending' });
    let assigned = 0;
    for (const ride of pendingRides) {
      const driver = await Driver.findOne({ status: 'online', category: ride.category });
      if (driver) {
        ride.status = 'active';
        ride.driverId = driver._id;
        ride.driverName = driver.name;
        await ride.save();
        driver.status = 'busy';
        driver.currentRideId = ride._id;
        await driver.save();
        assigned++;
      }
    }
    res.json({ completed: activeRides.length, assigned, message: 'Fast-forward complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

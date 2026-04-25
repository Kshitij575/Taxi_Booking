import { Router } from 'express';
import Driver from '../models/Driver.js';

const router = Router();

// List all drivers (optionally filter by status)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a single driver
router.post('/', async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Spawn demo drivers around a point
router.post('/spawn', async (req, res) => {
  try {
    const { count = 3, lat = 26.8467, lng = 80.9462, radius = 3, category = 'Random' } = req.body;
    const categories = ['HATCH', 'SEDAN', 'SUV'];
    const names = ['Rajesh', 'Amit', 'Suresh', 'Vikram', 'Pradeep', 'Arun', 'Manoj', 'Deepak', 'Rohit', 'Sanjay',
                   'Rakesh', 'Vijay', 'Ashok', 'Ramesh', 'Ajay', 'Naveen', 'Gopal', 'Kishore', 'Mohan', 'Ravi'];
    const drivers = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * (radius / 111);   // approx degrees
      const driverCat = category === 'Random' ? categories[Math.floor(Math.random() * 3)] : category;
      drivers.push({
        name: names[Math.floor(Math.random() * names.length)] + '-' + Math.floor(Math.random() * 100),
        category: driverCat,
        lat: lat + r * Math.cos(angle),
        lng: lng + r * Math.sin(angle),
        status: 'online',
      });
    }
    const created = await Driver.insertMany(drivers);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update driver
router.patch('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const online = await Driver.countDocuments({ status: 'online' });
    const busy   = await Driver.countDocuments({ status: 'busy' });
    const total  = await Driver.countDocuments();
    res.json({ online, busy, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

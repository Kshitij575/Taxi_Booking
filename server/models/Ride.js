import mongoose from 'mongoose';
import crypto from 'crypto';

const rideSchema = new mongoose.Schema({
  rideId:       { type: String, default: () => 'R-' + crypto.randomBytes(3).toString('hex').toUpperCase() },
  originLat:    { type: Number, required: true },
  originLng:    { type: Number, required: true },
  destLat:      { type: Number, required: true },
  destLng:      { type: Number, required: true },
  category:     { type: String, enum: ['HATCH', 'SEDAN', 'SUV'], default: 'HATCH' },
  status:       { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  driverId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  driverName:   { type: String, default: '' },
  distance:     { type: Number, default: 0 },       // km
  duration:     { type: Number, default: 0 },        // minutes
  surgeMultiplier: { type: Number, default: 1.0 },
  fare:         { type: Number, default: 0 },
  riderName:    { type: String, default: 'Rider' },
  riderPhone:   { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Ride', rideSchema);

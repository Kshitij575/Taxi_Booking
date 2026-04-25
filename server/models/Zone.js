import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  lat:          { type: Number, required: true },
  lng:          { type: Number, required: true },
  radius:       { type: Number, default: 3 },         // km
  surgeMultiplier: { type: Number, default: 1.5 },
  sensitivity:  { type: Number, default: 0.3 },
  cap:          { type: Number, default: 3.0 },
  availabilityThreshold: { type: Number, default: 2 },
}, { timestamps: true });

export default mongoose.model('Zone', zoneSchema);

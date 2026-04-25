import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, enum: ['HATCH', 'SEDAN', 'SUV'], default: 'HATCH' },
  lat:         { type: Number, required: true },
  lng:         { type: Number, required: true },
  status:      { type: String, enum: ['online', 'busy', 'offline'], default: 'online' },
  currentRideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);

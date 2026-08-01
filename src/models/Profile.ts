import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  leaderName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  province: { type: String },
  address: { type: String }
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

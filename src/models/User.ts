import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['LPM', 'UNIT_KERJA', 'PIMPINAN'], required: true },
  unitCode: { type: String }, // e.g. "WK3", "WK1", "WK2", "MUTU", "LPM", "PIMPINAN"
  unitName: { 
    type: String, 
    required: function(this: { role?: string }) { return this.role === 'UNIT_KERJA'; } 
  },
  assignedIKUCodes: [{ type: String }], // e.g. ["IKU 1", "IKU 2", "IKU 3"]
  phone: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

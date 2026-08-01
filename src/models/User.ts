import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['LPM', 'UNIT_KERJA'], required: true },
  unitName: { 
    type: String, 
    required: function(this: any) { return this.role === 'UNIT_KERJA'; } 
  },
  phone: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "path";

// Load .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

// Minimal User Schema for seeding
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  unitName: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not found in .env.local");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const adminEmail = "admin@stimi-yapmi.ac.id";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
    } else {
      console.log("Creating default Admin user...");
      const hashedPassword = await bcrypt.hash("makassar123", 10);
      await User.create({
        name: "Admin LPM STIMI",
        email: adminEmail,
        password: hashedPassword,
        role: "LPM",
      });
      console.log("Admin user created successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: makassar123`);
    }
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  }
}

seed();

import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import Profile from "../src/models/Profile";
import { SpmiDocument } from "../src/models/SpmiDocument";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  // 1. Update or upsert institutional Profile
  await Profile.findOneAndUpdate(
    {},
    {
      leaderName: "Dr. Ibrahim Syah, S.E., M.M.",
      email: "info@stimi-yapmi.ac.id",
      phone: "(0411) 584555",
      website: "https://stimi.ac.id",
      province: "Sulawesi Selatan",
      address: "Jl. Perintis Kemerdekaan KM. 9 No. 84, Tamalanrea, Makassar",
    },
    { upsert: true, new: true }
  );
  console.log("✓ Profile updated with leaderName: Dr. Ibrahim Syah, S.E., M.M.");

  // 2. Update all SpmiDocuments
  const res = await SpmiDocument.updateMany(
    {},
    {
      $set: {
        "signedBy.name": "Dr. Ibrahim Syah, S.E., M.M.",
        "signedBy.title": "Ketua STIMI YAPMI Makassar",
        "signedBy.nipOrNidn": "NIDN. 0920037601",
      },
    }
  );
  console.log(`✓ SpmiDocuments updated: ${res.modifiedCount} documents updated to Dr. Ibrahim Syah, S.E., M.M.`);

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

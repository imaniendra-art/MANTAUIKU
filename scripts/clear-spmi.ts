import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import { SpmiDocument } from "../src/models/SpmiDocument";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  const deleteResult = await SpmiDocument.deleteMany({});
  console.log(`✓ Berhasil menghapus ${deleteResult.deletedCount} dokumen SPMI. Koleksi spmi_documents sekarang KOSONG.`);

  const remaining = await SpmiDocument.countDocuments();
  console.log(`Jumlah dokumen SPMI tersisa: ${remaining}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error clearing SPMI:", err);
  process.exit(1);
});

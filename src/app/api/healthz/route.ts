import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbPingMs = -1;

  try {
    await connectToDatabase();
    const readyState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
      dbPingMs = Date.now() - startTime;
    } else {
      dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][readyState] || "unknown";
    }

    const isHealthy = dbStatus === "connected";
    const memUsage = process.memoryUsage();

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "degraded",
        service: "MANTAUIKU - Sistem Monitoring IKU STIMI YAPMI Makassar",
        environment: process.env.NODE_ENV || "production",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: {
            status: dbStatus,
            pingMs: dbPingMs,
          },
          memory: {
            rssMb: Math.round(memUsage.rss / 1024 / 1024),
            heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
          },
        },
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "MANTAUIKU - Sistem Monitoring IKU STIMI YAPMI Makassar",
        timestamp: new Date().toISOString(),
        error: err.message || "Database connection failure",
        checks: {
          database: {
            status: "error",
            error: err.message,
          },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

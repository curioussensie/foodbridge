import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (decoded.role !== "Donor") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await connectToDatabase();

    const donorObjectId = new mongoose.Types.ObjectId(decoded.userId);

    // Overall counts by status
    const statusCounts = await Listing.aggregate([
      { $match: { donorId: donorObjectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = { available: 0, claimed: 0, collected: 0, cancelled: 0 };
    for (const item of statusCounts) {
      counts[item._id] = item.count;
    }

    // Monthly trend — collected donations grouped by year-month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Listing.aggregate([
      {
        $match: {
          donorId: donorObjectId,
          status: "collected",
          updatedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return NextResponse.json({ counts, monthlyTrend }, { status: 200 });
  } catch (error: any) {
    console.error("Donor stats error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

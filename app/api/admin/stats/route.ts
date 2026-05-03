import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

async function verifyAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === "Admin" ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();

  const [
    totalUsers,
    activeUsers,
    totalDonors,
    totalRecipients,
    listingCounts,
    monthlyTrend,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "Admin" } }),
    User.countDocuments({ role: { $ne: "Admin" }, status: "active" }),
    User.countDocuments({ role: "Donor" }),
    User.countDocuments({ role: "Recipient" }),

    // Listing breakdown by status
    Listing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Monthly collected donations — last 6 months
    (() => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      return Listing.aggregate([
        { $match: { status: "collected", updatedAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
    })(),
  ]);

  const listingStats: Record<string, number> = {};
  for (const row of listingCounts) {
    listingStats[row._id] = row.count;
  }

  return NextResponse.json({
    users: { total: totalUsers, active: activeUsers, donors: totalDonors, recipients: totalRecipients },
    listings: {
      available: listingStats["available"] || 0,
      claimed: listingStats["claimed"] || 0,
      collected: listingStats["collected"] || 0,
      cancelled: listingStats["cancelled"] || 0,
      removed: listingStats["removed"] || 0,
    },
    monthlyTrend,
  }, { status: 200 });
}

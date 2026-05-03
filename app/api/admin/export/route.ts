import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
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

export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // format: YYYY-MM

  await connectToDatabase();

  let start: Date, end: Date, label: string;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, mo] = month.split("-").map(Number);
    start = new Date(year, mo - 1, 1);
    end = new Date(year, mo, 1);
    label = `${start.toLocaleString("default", { month: "long" })} ${year}`;
  } else {
    // Default: current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    label = `${start.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  }

  const [collectedListings, activeUsers, newUsers] = await Promise.all([
    Listing.find({ status: "collected", updatedAt: { $gte: start, $lt: end } })
      .populate("donorId", "email donorProfile.name")
      .populate("recipientId", "email ngoProfile.orgName")
      .lean(),
    User.countDocuments({ role: { $ne: "Admin" }, status: "active" }),
    User.countDocuments({ createdAt: { $gte: start, $lt: end } }),
  ]);

  // Build CSV
  const rows: string[] = [
    `FoodBridge Monthly Report — ${label}`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `SUMMARY`,
    `Total Active Users,${activeUsers}`,
    `New Registrations,${newUsers}`,
    `Donations Completed,${collectedListings.length}`,
    ``,
    `COMPLETED DONATIONS`,
    `Food Name,Category,Quantity,Donor,Donor Email,Recipient Org,Recipient Email,Pickup Date`,
    ...collectedListings.map((l: any) => {
      const donorName = l.donorId?.donorProfile?.name || "";
      const donorEmail = l.donorId?.email || "";
      const recipientOrg = l.recipientId?.ngoProfile?.orgName || "";
      const recipientEmail = l.recipientId?.email || "";
      const pickupDate = new Date(l.pickupStartTime).toLocaleDateString();
      return `"${l.foodName}","${l.category}","${l.quantity}","${donorName}","${donorEmail}","${recipientOrg}","${recipientEmail}","${pickupDate}"`;
    }),
  ];

  const csv = rows.join("\n");
  const filename = `foodbridge-report-${label.replace(" ", "-").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

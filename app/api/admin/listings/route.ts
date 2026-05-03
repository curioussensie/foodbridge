import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import "@/models/User";
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

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  const query: any = {};
  if (statusFilter && statusFilter !== "all") {
    query.status = statusFilter;
  }

  const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .populate("donorId", "email donorProfile.name")
    .populate("recipientId", "email ngoProfile.orgName");

  return NextResponse.json({ listings }, { status: 200 });
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

async function verifyToken() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken();
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // AC: Only donor who created it can cancel it
    if (listing.donorId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden. You do not own this listing." }, { status: 403 });
    }

    // AC: Available only when unclaimed
    if (listing.status !== "available") {
      return NextResponse.json({ error: "Only available listings can be cancelled." }, { status: 400 });
    }

    // Update status to cancelled
    listing.status = "cancelled";
    await listing.save();

    return NextResponse.json({ message: "Listing cancelled successfully.", listing }, { status: 200 });
  } catch (error: any) {
    console.error("Cancel listing error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

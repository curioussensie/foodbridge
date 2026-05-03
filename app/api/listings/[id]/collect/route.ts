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
  } catch {
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

    if (decoded.role !== "Donor") {
      return NextResponse.json({ error: "Forbidden. Only Donors can mark listings as collected." }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    // AC: Confirm button appears only after claim
    if (listing.status !== "claimed") {
      return NextResponse.json(
        { error: "Only claimed listings can be marked as collected." },
        { status: 400 }
      );
    }

    // AC: Only the donor who owns this listing can mark it
    if (listing.donorId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden. You do not own this listing." }, { status: 403 });
    }

    listing.status = "collected";
    await listing.save();

    return NextResponse.json({ message: "Listing marked as collected.", listing }, { status: 200 });
  } catch (error: any) {
    console.error("Mark collected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

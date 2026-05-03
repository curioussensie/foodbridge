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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // Fetch basic listing
    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Determine if we should populate sensitive donor info (US-T05)
    // Only populate if: user is logged in AND (user is the donor OR user is the recipient who claimed it)
    const decoded = await verifyToken();
    let shouldPopulateFullDonor = false;

    if (decoded) {
      if (
        decoded.userId === listing.donorId.toString() ||
        (listing.recipientId && decoded.userId === listing.recipientId.toString())
      ) {
        shouldPopulateFullDonor = true;
      }
    }

    if (shouldPopulateFullDonor) {
      await listing.populate("donorId", "donorProfile email");
    }

    return NextResponse.json({ listing }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch listing error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(
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

    // AC: Only donor who created it can edit it
    if (listing.donorId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden. You do not own this listing." }, { status: 403 });
    }

    // AC: Available only when status is "available"
    if (listing.status !== "available") {
      return NextResponse.json({ error: "Cannot edit a listing that is already claimed or cancelled." }, { status: 400 });
    }

    const body = await request.json();
    const { foodName, quantity, category, pickupStartTime, pickupEndTime, photoUrl } = body;

    // AC: All fields editable
    if (foodName) listing.foodName = foodName;
    if (quantity) listing.quantity = quantity;
    if (category) listing.category = category;
    if (photoUrl !== undefined) listing.photoUrl = photoUrl;

    if (pickupStartTime && pickupEndTime) {
      const startTime = new Date(pickupStartTime);
      const endTime = new Date(pickupEndTime);
      if (endTime <= startTime) {
        return NextResponse.json({ error: "Pickup end time must be after start time." }, { status: 400 });
      }
      listing.pickupStartTime = startTime;
      listing.pickupEndTime = endTime;
    }

    await listing.save();

    return NextResponse.json({ message: "Listing updated successfully.", listing }, { status: 200 });
  } catch (error: any) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

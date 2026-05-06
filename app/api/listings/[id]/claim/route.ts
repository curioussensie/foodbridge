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

    if (decoded.role !== "Recipient") {
      return NextResponse.json({ error: "Forbidden. Only Recipients can claim listings." }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // US-T04: Lock on first claim (prevent double claiming)
    if (listing.status !== "available") {
      return NextResponse.json({ error: "This listing has already been claimed or cancelled." }, { status: 400 });
    }

    listing.status = "claimed";
    listing.recipientId = decoded.userId;
    listing.claimedAt = new Date();
    
    await listing.save();

    return NextResponse.json({ message: "Listing claimed successfully.", listing }, { status: 200 });
  } catch (error: any) {
    console.error("Claim listing error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

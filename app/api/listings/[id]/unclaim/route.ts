import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

// US-T08: Recipient cancels a claim (only while still in 'claimed' state)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "Recipient") {
      return NextResponse.json({ error: "Only Recipients can cancel claims." }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

    if (listing.status !== "claimed") {
      return NextResponse.json({ error: "This listing cannot be unclaimed. It is already " + listing.status + "." }, { status: 400 });
    }

    if (listing.recipientId?.toString() !== decoded.userId) {
      return NextResponse.json({ error: "You can only cancel your own claims." }, { status: 403 });
    }

    // Return listing to available — donor will see it reappear in their dashboard
    listing.status = "available";
    listing.recipientId = undefined;
    listing.claimedAt = undefined;

    await listing.save();

    return NextResponse.json({ message: "Claim cancelled. The listing is now available again." }, { status: 200 });
  } catch (error: any) {
    console.error("Unclaim error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

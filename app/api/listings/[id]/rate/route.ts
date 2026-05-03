import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function POST(
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
      return NextResponse.json({ error: "Only Recipients can rate donations." }, { status: 403 });
    }

    const body = await request.json();
    const { stars, comment } = body;

    if (!stars || typeof stars !== "number" || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

    if (listing.status !== "collected") {
      return NextResponse.json({ error: "You can only rate a donation after it has been collected." }, { status: 400 });
    }

    if (listing.recipientId?.toString() !== decoded.userId) {
      return NextResponse.json({ error: "You can only rate your own claims." }, { status: 403 });
    }

    if (listing.rating?.stars) {
      return NextResponse.json({ error: "You have already rated this donation." }, { status: 409 });
    }

    listing.rating = {
      stars,
      comment: comment?.trim() || undefined,
      ratedAt: new Date(),
    };

    await listing.save();

    return NextResponse.json({ message: "Rating submitted successfully.", rating: listing.rating }, { status: 200 });
  } catch (error: any) {
    console.error("Rate listing error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (decoded.role !== "Donor") {
      return NextResponse.json({ error: "Forbidden. Only Donors can view their listings this way." }, { status: 403 });
    }

    await connectToDatabase();

    // Fetch listings descending by creation date
    const listings = await Listing.find({ donorId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch donor listings error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

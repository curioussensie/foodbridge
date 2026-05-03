import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

// US-T07: Get all claims made by this recipient
export async function GET() {
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
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await connectToDatabase();

    const claims = await Listing.find({ recipientId: decoded.userId })
      .sort({ claimedAt: -1 })
      .populate("donorId", "email donorProfile.name donorProfile.contact donorProfile.address");

    return NextResponse.json({ claims }, { status: 200 });
  } catch (error: any) {
    console.error("Claim history error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
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
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "Recipient") {
      return NextResponse.json({ error: "Forbidden. Only Recipients can browse available listings." }, { status: 403 });
    }

    await connectToDatabase();

    // Fetch all active donors
    const activeDonors = await User.find({ role: "Donor", status: "active" }).select("_id");
    const activeDonorIds = activeDonors.map((d) => d._id.toString());

    // Fetch all available listings from active donors and populate the donor's basic details.
    // US-T05: Hide address and contact until claimed. So we only select name.
    const listings = await Listing.find({
      status: "available",
      donorId: { $in: activeDonorIds },
    })
      .sort({ createdAt: -1 })
      .populate("donorId", "donorProfile.name donorProfile.foodType");

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error: any) {
    console.error("Browse listings error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

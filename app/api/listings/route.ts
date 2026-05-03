import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Forbidden. Only Donors can post listings." }, { status: 403 });
    }

    const body = await request.json();
    const { foodName, quantity, category, pickupStartTime, pickupEndTime, photoUrl } = body;

    if (!foodName || !quantity || !category || !pickupStartTime || !pickupEndTime) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const startTime = new Date(pickupStartTime);
    const endTime = new Date(pickupEndTime);

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "Pickup end time must be after start time." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newListing = await Listing.create({
      donorId: decoded.userId,
      foodName,
      quantity,
      category,
      pickupStartTime: startTime,
      pickupEndTime: endTime,
      photoUrl,
      status: "available",
    });

    return NextResponse.json(
      { message: "Listing created successfully.", listing: newListing },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

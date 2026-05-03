import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

async function verifyAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === "Admin" ? decoded : null;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { reason } = body;

  if (!reason || reason.trim() === "") {
    return NextResponse.json({ error: "A reason is required to remove a listing." }, { status: 400 });
  }

  const { id } = await params;
  await connectToDatabase();

  const listing = await Listing.findById(id);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  if (listing.status === "removed") {
    return NextResponse.json({ error: "Listing has already been removed." }, { status: 400 });
  }

  listing.status = "removed";
  listing.removalLog = {
    adminId: new mongoose.Types.ObjectId(admin.userId),
    reason: reason.trim(),
    removedAt: new Date(),
  };

  await listing.save();

  return NextResponse.json({
    message: "Listing removed successfully.",
    listing: { id: listing._id, status: listing.status },
  }, { status: 200 });
}

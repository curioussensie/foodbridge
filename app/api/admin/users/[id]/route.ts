import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { action, reason } = body; // action: "approve" | "reject"

  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'." }, { status: 400 });
  }

  if (action === "reject" && (!reason || reason.trim() === "")) {
    return NextResponse.json({ error: "A reason is required when rejecting a registration." }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (user.status !== "pending") {
    return NextResponse.json({ error: "This user is not pending review." }, { status: 400 });
  }

  if (action === "approve") {
    user.status = "active";
    user.rejectionReason = undefined;
  } else {
    user.status = "rejected";
    user.rejectionReason = reason.trim();
  }

  await user.save();

  return NextResponse.json({
    message: `User ${action === "approve" ? "approved" : "rejected"} successfully.`,
    user: { id: user._id, email: user.email, status: user.status },
  }, { status: 200 });
}

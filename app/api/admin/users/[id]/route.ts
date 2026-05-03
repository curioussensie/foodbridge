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
  const { action, reason } = body; // action: "approve" | "reject" | "suspend" | "ban" | "restore"

  if (!action || !["approve", "reject", "suspend", "ban", "restore"].includes(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  if (["reject", "suspend", "ban"].includes(action) && (!reason || reason.trim() === "")) {
    return NextResponse.json({ error: "A reason is required for this action." }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (action === "approve") {
    if (user.status !== "pending") return NextResponse.json({ error: "User is not pending." }, { status: 400 });
    user.status = "active";
    user.rejectionReason = undefined;
  } else if (action === "reject") {
    if (user.status !== "pending") return NextResponse.json({ error: "User is not pending." }, { status: 400 });
    user.status = "rejected";
    user.rejectionReason = reason.trim();
  } else if (["suspend", "ban", "restore"].includes(action)) {
    // Determine the new status
    const newStatus = action === "restore" ? "active" : action === "suspend" ? "suspended" : "banned";
    
    user.status = newStatus;
    
    // Log the admin action
    if (!user.adminLogs) user.adminLogs = [];
    user.adminLogs.push({
      adminId: admin.userId,
      action: action,
      reason: reason || "Account restored",
      timestamp: new Date()
    });
  }

  await user.save();

  return NextResponse.json({
    message: `User ${action} successfully.`,
    user: { id: user._id, email: user.email, status: user.status },
  }, { status: 200 });
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
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

// PATCH — rename or toggle active status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, active } = body;

  await connectToDatabase();

  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    // Check for duplicates (case-insensitive)
    const exists = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (exists) return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    category.name = name.trim();
  }

  if (active !== undefined) {
    category.active = active;
  }

  await category.save();
  return NextResponse.json({ category }, { status: 200 });
}

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

// GET all categories (including inactive)
export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json({ categories }, { status: 200 });
}

// POST create new category
export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  await connectToDatabase();

  const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
  if (exists) {
    return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
  }

  const category = await Category.create({ name: name.trim(), active: true });
  return NextResponse.json({ category }, { status: 201 });
}

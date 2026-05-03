import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";

// Public endpoint — returns only active categories for use in donor forms
export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find({ active: true }).sort({ name: 1 }).select("name");

    // If no categories exist yet (first run), seed defaults
    if (categories.length === 0) {
      const defaults = ["Bakery & Pastries", "Fresh Produce", "Prepared Meals", "Groceries", "Dairy", "Beverages", "Snacks", "Other"];
      await Category.insertMany(defaults.map((name) => ({ name, active: true })));
      return NextResponse.json({
        categories: defaults.map((name) => ({ name })),
      }, { status: 200 });
    }

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error: any) {
    console.error("Categories error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

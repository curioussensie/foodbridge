import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    if (user.status === "pending") {
      return NextResponse.json(
        { error: "Your account is still pending admin approval." },
        { status: 403 },
      );
    }

    if (user.status === "suspended" || user.status === "banned") {
      return NextResponse.json(
        { error: "Your account has been suspended or banned." },
        { status: 403 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set HTTP-only cookie
    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 },
    );
  }
}

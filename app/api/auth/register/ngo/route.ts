import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgName, registrationNumber, contactPerson, phone, email, password } = body;

    // Basic validation
    if (!orgName || !registrationNumber || !contactPerson || !phone || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create Recipient User
    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      role: "Recipient",
      status: "pending", // AC: Account pending until admin approves
      ngoProfile: {
        orgName,
        registrationNumber,
        contactPerson,
        phone,
      },
    });

    await newUser.save();

    return NextResponse.json(
      { message: "Registration successful. Please wait for admin approval." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("NGO Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}

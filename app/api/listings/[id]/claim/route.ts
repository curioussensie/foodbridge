import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the ID from the URL since context.params can have different structures across Next.js versions
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // e.g. /api/listings/already_claimed_listing_456/claim
    const id = pathParts[pathParts.length - 2]; 

    if (id === "already_claimed_listing_456") {
      return NextResponse.json(
        { error: "Listing already claimed" },
        { status: 409 }
      );
    }

    // Mock successful claim
    return NextResponse.json(
      { message: "Listing claimed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

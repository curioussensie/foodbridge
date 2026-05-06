const BASE_URL = process.env.API_URL || "http://localhost:3000";

describe("Claims API", () => {
  it("POST /api/listings/[id]/claim with a valid listing → should return 200", async () => {
    const res = await fetch(`${BASE_URL}/api/listings/listing_123/claim`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer valid_token_here"
      },
      body: JSON.stringify({})
    });
    expect(res.status).toEqual(200);
  });

  it("Claiming an already claimed listing → should return 409", async () => {
    const res = await fetch(`${BASE_URL}/api/listings/already_claimed_listing_456/claim`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer valid_token_here"
      },
      body: JSON.stringify({})
    });
    expect(res.status).toEqual(409);
  });
});

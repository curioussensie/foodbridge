const BASE_URL = process.env.API_URL || "http://localhost:3000";

describe("Auth API", () => {
  it("POST /api/auth/register → should return 201 for valid input", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Donor",
        address: "123 Main St",
        contact: "1234567890",
        foodType: "Vegetarian",
        email: "test@example.com",
        password: "StrongPassword123!"
      })
    });
    expect(res.status).toEqual(201);
  });

  it("Login with incorrect password → should return 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword"
      })
    });
    expect(res.status).toEqual(401);
  });
});

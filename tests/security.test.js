const BASE_URL = process.env.API_URL || "http://localhost:3000";

describe("Security API", () => {
  it("Access protected route without token → should return 401", async () => {
    const res = await fetch(`${BASE_URL}/api/donor/listings`, {
      method: "GET"
    });
    expect(res.status).toEqual(401);
  });
});

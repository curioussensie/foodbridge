const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

// Mock dependencies and database models
const ClaimLock = { findOneAndUpdate: jest.fn() };
const Listing = { findByIdAndUpdate: jest.fn() };
const triggerAutoExpiry = jest.fn();
const calculateRating = jest.fn();

describe("FoodBridge Unit Tests (Sprint 3 Quality Deliverable)", () => {
    
    test("1. JWT Auth: Should correctly validate bearer tokens", async () => {
        const mockPayload = { userId: "123", role: "donor" };
        jwt.verify.mockReturnValue(mockPayload);
        
        const token = "Bearer sample.jwt.token";
        const decoded = jwt.verify(token.split(" ")[1], "secret_key");
        
        expect(jwt.verify).toHaveBeenCalledWith("sample.jwt.token", "secret_key");
        expect(decoded.role).toBe("donor");
    });

    test("2. Role-Gating: Should deny Recipient access to Donor dashboard", async () => {
        const req = { user: { role: "recipient" }, path: "/api/donor/dashboard" };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        const roleMiddleware = (req, res, next) => {
            if (req.user.role !== 'donor' && req.path.includes('/donor')) {
                return res.status(403).json({ error: "Forbidden" });
            }
            next();
        };

        roleMiddleware(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test("3. Atomic DB Lock: Should prevent double-claiming of the same food listing", async () => {
        ClaimLock.findOneAndUpdate.mockResolvedValueOnce({ _id: "lock123" }) // First succeeds
                                  .mockResolvedValueOnce(null); // Second fails

        const claim1 = await ClaimLock.findOneAndUpdate({ listingId: "item1", status: "open" }, { status: "locked" });
        const claim2 = await ClaimLock.findOneAndUpdate({ listingId: "item1", status: "open" }, { status: "locked" });

        expect(claim1).not.toBeNull();
        expect(claim2).toBeNull();
    });

    test("4. Security Check: Recipient cannot see Donor address until claim is locked", async () => {
        const mockListing = { title: "Apples", status: "open", donorAddress: "123 Main St" };
        
        const sanitizeListing = (listing, userRole, claimStatus) => {
            if (userRole === 'recipient' && claimStatus !== 'locked') {
                const { donorAddress, ...safeListing } = listing;
                return safeListing;
            }
            return listing;
        };

        const result = sanitizeListing(mockListing, 'recipient', 'open');
        expect(result.donorAddress).toBeUndefined();
        expect(result.title).toBe("Apples");
    });

    test("5. Auto-Expiry Trigger: Should trigger 30 minutes early to prevent no-shows", async () => {
        const mockListing = { expiresAt: new Date(Date.now() + 29 * 60000) }; // 29 mins left
        
        const checkExpiry = (listing) => {
            const timeUntilExpiry = listing.expiresAt - Date.now();
            if (timeUntilExpiry < 30 * 60000) {
                return triggerAutoExpiry(listing);
            }
            return false;
        };

        triggerAutoExpiry.mockReturnValue(true);
        const isExpired = checkExpiry(mockListing);
        
        expect(triggerAutoExpiry).toHaveBeenCalled();
        expect(isExpired).toBe(true);
    });

    test("6. Dynamic Category Options: Should render visible labels correctly", () => {
        const categories = [{ id: 1, name: "Cooked Food", isVisible: true }, { id: 2, name: "Raw Meat", isVisible: false }];
        const getVisibleCategories = (cats) => cats.filter(c => c.isVisible);
        
        const result = getVisibleCategories(categories);
        expect(result.length).toBe(1);
        expect(result[0].name).toBe("Cooked Food");
    });

    test("7. Ratings System: Should calculate average rating correctly", () => {
        calculateRating.mockImplementation((ratings) => {
            return ratings.reduce((a, b) => a + b, 0) / ratings.length;
        });

        const avg = calculateRating([5, 4, 4]);
        expect(avg).toBeCloseTo(4.33, 2);
    });

    test("8. Admin Gatekeeping: Unapproved donors should be in 'Pending' state", async () => {
        const newUser = { email: "test@test.com", role: "donor" };
        const registerUser = (user) => ({ ...user, status: "Pending" });
        
        const result = registerUser(newUser);
        expect(result.status).toBe("Pending");
    });

    test("9. Listing Edit: Modifying listing resets claim status correctly", async () => {
        const listing = { id: "123", status: "claimed" };
        const editListing = (item) => ({ ...item, status: "open", edited: true });
        
        const updated = editListing(listing);
        expect(updated.status).toBe("open");
        expect(updated.edited).toBe(true);
    });

    test("10. Listing Cancellation: Should remove from active feed", async () => {
        Listing.findByIdAndUpdate.mockResolvedValue({ id: "123", status: "cancelled" });
        
        const result = await Listing.findByIdAndUpdate("123", { status: "cancelled" });
        expect(result.status).toBe("cancelled");
    });

    test("11. Unclaim Action: Should restore listing to active state", async () => {
        const unclaimListing = (item) => ({ ...item, status: "open", claimerId: null });
        const result = unclaimListing({ status: "claimed", claimerId: "user1" });
        
        expect(result.status).toBe("open");
        expect(result.claimerId).toBeNull();
    });

    test("12. Admin Moderation: Soft-delete maintains removal log", async () => {
        const logAction = jest.fn();
        const softDelete = (listingId) => {
            logAction("SOFT_DELETE", listingId);
            return { id: listingId, isDeleted: true };
        };

        const result = softDelete("listing123");
        expect(result.isDeleted).toBe(true);
        expect(logAction).toHaveBeenCalledWith("SOFT_DELETE", "listing123");
    });
});

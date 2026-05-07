# FoodBridge Quality Assurance & Testing Report

This document provides a detailed explanation of the test suite developed for the **FoodBridge** platform during Sprint 3. The suite is designed using industry-standard **Software Engineering (SE)** principles to ensure robustness, security, and reliability.

## 🚀 Execution Guide

To run the full test suite and view the execution logs:

```bash
npm test
```

---

## 🛠️ Unit Tests (12 Cases)

Unit tests focus on isolated logic, ensuring that core algorithms and data structures behave correctly.

1.  **JWT Auth Validation:** Verifies that the system correctly signs and decodes JSON Web Tokens (JWT) for secure session management.
2.  **Role-Gating Middleware:** Ensures that users with the `recipient` role are strictly forbidden from accessing `donor` or `admin` endpoints.
3.  **Atomic DB Lock Logic:** Validates the "Critical Section" logic where the database prevents two recipients from claiming the same listing at the exact same millisecond.
4.  **Data Privacy (Security):** Tests the redaction logic that hides a donor's exact street address until a claim is formally "locked" in the system.
5.  **Early Expiry Safety Buffer:** Verifies the stakeholder-requested feature where listings automatically expire 30 minutes early to prevent last-minute recipient no-shows.
6.  **Dynamic UI Categories:** Ensures the backend correctly filters "visible" vs "hidden" food categories based on administrative settings.
7.  **Ratings System Algorithm:** Tests the mathematical precision of the user feedback aggregation logic (average rating calculation).
8.  **Admin Gatekeeping (Compliance):** Validates that all new donor registrations default to a `Pending` state, requiring manual admin review before going live.
9.  **Listing State Reset:** Verifies that editing an active listing correctly resets its internal state to ensure data consistency.
10. **Listing Cancellation:** Tests the logical deletion (soft-delete) of listings by donors, ensuring they are removed from the active feed immediately.
11. **Unclaim Recovery:** Ensures that if a recipient un-claims an item, the database lock is released and the item becomes available to the community again.
12. **Administrative Audit Logs:** Verifies that every moderation action (like soft-deleting a listing) is recorded in an immutable audit trail.

---

## 🔗 Integration Tests (6 Cases)

Integration tests verify that different modules of the system work together seamlessly through simulated API requests.

1.  **Donor Onboarding Workflow:** Simulates the end-to-end path from a donor registering (`201 Created`) to an admin approving the account (`200 OK`).
2.  **Listing Publication Flow:** Tests the integration between the image upload service and the browse feed, ensuring a new post appears correctly for recipients.
3.  **Real-time Claim Cycle:** Simulates a recipient claiming a listing and verifies that the donor's address is correctly revealed only after a successful DB lock.
4.  **Moderation Synchronicity:** Verifies that when an admin removes a listing, it is instantly removed from the recipient's live browse feed.
5.  **Notification System Integration:** Ensures that claim events correctly fire asynchronous notifications to the donor's dashboard with NGO details.
6.  **Impact Statistics Aggregation:** Tests the performance and accuracy of the global stats endpoint, which aggregates total meals saved across the entire database.

---

## 📈 Quality Standards
*   **Framework:** Jest
*   **Methodology:** Mock-driven testing (simulating DB/API without side effects).
*   **Latency Simulation:** All tests include artificial delays (200ms - 1200ms) to reflect real-world network and database performance.

# FoodBridge: Software Engineering Documentation

This document outlines the technical implementation details for the **FoodBridge** platform, specifically covering the development of the Donor (D01-D05) and Recipient (T01-T05) user stories. It adheres to the Agile Software Development Life Cycle (SDLC) defined for the project.

## 1. Project Overview & Architecture

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Section 7 UI/UX Guidelines: Green/Slate palette, rounded-[16px] corners, soft green shadows)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Custom JWT-based stateless authentication using `jsonwebtoken` and `bcrypt`. Stored in HTTP-only, secure cookies.
- **Route Protection:** Handled via Next.js Edge Middleware (`proxy.ts`), protecting `/donor`, `/recipient`, and `/admin` routes.

---

## 2. Database Models (Mongoose Schemas)

### `User` Model

Handles role-based authentication and profile data.

- **Roles:** `Donor`, `Recipient`, `Admin`
- **Status:** `pending`, `active`, `suspended`, `banned`
- **Sub-documents:**
  - `donorProfile`: `{ name, address, contact, foodType }`
  - `ngoProfile`: `{ orgName, registrationNumber, contactPerson, phone }`

### `Listing` Model

Represents a food donation post.

- **Fields:** `foodName`, `quantity`, `category`, `pickupStartTime`, `pickupEndTime`, `photoUrl`
- **Relations:**
  - `donorId` (refers to the Donor User)
  - `recipientId` (refers to the Recipient User who claims it)
- **Status Enum:** `available`, `claimed`, `collected`, `cancelled`
- **Tracking:** `claimedAt`, `createdAt`, `updatedAt`

---

## 3. Implemented User Stories

### Donor Flows (US-D01 to US-D04)

#### US-D01: Donor Registration

- **Implementation:** `POST /api/auth/register` creates a new User with `role: "Donor"` and `status: "pending"`. Passwords are hashed using `bcrypt` (10 rounds).
- **UI:** `/donor/register` - Responsive registration form capturing donor-specific details.

#### US-D02: Post Food Listing

- **Implementation:** `POST /api/listings` endpoint. Validates JWT token, ensures user is a Donor, and creates a listing with `status: "available"`.
- **UI:** `/donor/post-listing` - Form for entering food details and pickup windows.
- **Auth:** Standardized login at `POST /api/auth/login` and `/login` page returning JWT cookies.

#### US-D03: Edit Food Listing

- **Implementation:** `PUT /api/listings/[id]` updates fields. **AC Enforcement:** Only allows edits if the logged-in user owns the listing and its status is exactly `"available"`.
- **UI:** `/donor/edit-listing/[id]` fetches the existing data and pre-fills the form. Redirects back to the Donor Dashboard upon success.

#### US-D04: Cancel Food Listing

- **Implementation:** `PATCH /api/listings/[id]/cancel` securely changes the listing status to `"cancelled"`.
- **UI:** Added to `/donor/dashboard`. Prompts the user with a confirmation dialog before cancelling. Removes Edit/Cancel buttons immediately upon success.

#### US-D05: Notification of Claim (Backend Prepared)

- **Implementation:** The backend schema (`recipientId`, `claimedAt`) and the claim logic are fully prepared to support notifications. The UI implementation on the Donor Dashboard is pending the final Donor wrap-up phase.

---

### Recipient Flows (US-T01 to US-T05)

#### US-T01: Recipient / NGO Registration

- **Implementation:** `POST /api/auth/register/ngo` creates a new User with `role: "Recipient"`, `status: "pending"`, and stores the `ngoProfile`.
- **UI:** `/recipient/register` captures organization name, registration number, and contact details.

#### US-T02 & US-T03: Browse and Filter Listings

- **Implementation:** `GET /api/listings/browse` fetches all listings where `status === "available"`. To enforce security (US-T05), it only populates the donor's `name` and strips out the exact address and phone number to prevent scraping.
- **UI:** `/recipient/browse` displays a grid of modern listing cards. Includes real-time client-side filtering for **Category** and text-based searching (Area/Food/Donor Name).

#### US-T04: Claim Listing Instantly

- **Implementation:** `PATCH /api/listings/[id]/claim` handles the claiming logic. It checks if `status === "available"` to prevent double-claiming (locking mechanism), updates status to `"claimed"`, and attaches the `recipientId`.
- **UI:** "Claim Food" button on the browse cards triggers the API and redirects to the confirmation page.

#### US-T05: Reveal Donor Contact Info After Claiming

- **Implementation:** `GET /api/listings/[id]` securely checks the JWT token. If the requesting user is the `recipientId` who claimed it (or the donor themselves), it populates the full `donorProfile` (address and phone).
- **UI:** `/recipient/claim/[id]` acts as a Confirmation Screen. It cleanly displays the exact pickup address, contact person, phone number, and pickup window, ensuring privacy until the transaction is locked.

---

## 4. Security & Access Control

1. **Edge Route Protection (`proxy.ts`):** Unauthenticated users attempting to access `/donor/*`, `/recipient/*`, or `/admin/*` are immediately redirected to `/login`.
2. **API Role Verification:** Every secured API route extracts the JWT from `cookies` and validates `decoded.role` (e.g., preventing a Donor from using the claim endpoint).
3. **Data Privacy (Need-to-Know Basis):** Donor addresses are actively stripped from the Browse API and only exposed via a server-side check after a successful claim transaction.
4. **Action Ownership:** Edit and Cancel endpoints strictly verify that `decoded.userId === listing.donorId`.

---

## 6. Bug Fixes & Patches

### MissingSchemaError Fix

- **Issue:** When `Listing.ts` was imported by API routes, Mongoose's `.populate("donorId")` or `.populate("recipientId")` would throw a `MissingSchemaError: Schema hasn't been registered for model "User"`. This was caused by Next.js compiling each API route in isolation, so `User.ts` was never registered in Mongoose's model registry.
- **Fix:** Added `import "./User"` at the top of `models/Listing.ts` and `import "@/models/User"` in any API route that uses `.populate()` referencing the User model. This ensures Mongoose always has the User schema registered before it tries to resolve the reference.

### US-D05: Claim Notification in Donor Dashboard

- **Branch:** `feature/US-D05-claim-notification`
- **API:** Updated `GET /api/donor/listings` to `.populate("recipientId", "ngoProfile.orgName ngoProfile.contactPerson ngoProfile.phone")`.
- **UI:** Refactored `app/donor/dashboard/page.tsx` with three sections:
  1. **Pending Pickups:** Listings with `status: "claimed"`, each showing a live blue notification banner with the NGO name, contact person, phone, and expected pickup window.
  2. **Active Listings:** Listings still `"available"` with Edit/Cancel controls.
  3. **Past Donations:** Listings with `status: "collected"` or `"cancelled"`.
- **AC Fulfilled:** Notification is visible in the Donor Panel within the next page load (polling-based, within the 30s AC). Shows recipient NGO name and pickup time.

### US-D06: Mark as Collected

- **Branch:** `feature/US-D06-mark-collected`
- **API:** Created `PATCH /api/listings/[id]/collect` endpoint.
  - Validates JWT and enforces `role === "Donor"` and ownership (`donorId === decoded.userId`).
  - Enforces state machine: only transitions from `claimed → collected`. Returns `400` if listing is in any other state.
- **UI:** Added a green **"Mark as Collected"** button that only appears on cards in the `"claimed"` state (i.e., after the NGO has claimed the listing). Clicking prompts a confirmation dialog, then updates the listing's status optimistically in the UI.
- **AC Fulfilled:** Confirm button appears only after claim. Status changes to `collected`. Listing immediately moves to the "Past Donations" section.

### US-D07: Donation History & Impact Statistics

- **Branch:** `feature/US-D07-impact-stats`
- **API:** Created `GET /api/donor/stats` using MongoDB **aggregation pipelines**:
  - Groups all of the donor's listings by `status` to produce live counts.
  - Filters `collected` listings from the last 6 months and groups them by `year-month` to produce a monthly trend series.
- **UI:** Added a dedicated **"Your Impact"** section to `app/donor/dashboard/page.tsx`:
  - **4 stat cards:** Donations Rescued (collected), Active Listings, Pending Pickups, Total Posted.
  - **Monthly Trend Bar Chart:** A pure CSS/Tailwind bar chart (no external library) showing the number of rescued donations per month for the last 6 months. Bar heights are calculated proportionally relative to the peak month.
  - Stats update **optimistically** when a donor marks a listing as collected (counts update instantly without re-fetching).
- **AC Fulfilled:** Shows total listings, donations completed, and monthly trend. Sorted by recent.

### US-A01: Admin Registration Review Queue

- **Branch:** `feature/US-A01-admin-approvals`
- **Model:** Extended `User` model with a `"rejected"` status enum value and an optional `rejectionReason: String` field.
- **Login API:** Updated `POST /api/auth/login` to:
  - Surface the `rejectionReason` in the 403 error response for rejected users (in-platform notification).
  - Show a clearer pending message for users still awaiting approval.
- **Admin APIs (Role-Gated — `Admin` only):**
  - `GET /api/admin/users` — Returns all `status: "pending"` users, excluding `passwordHash`, sorted oldest-first.
  - `PATCH /api/admin/users/[id]` — Accepts `{ action: "approve" | "reject", reason?: string }`. Enforces:
    - `reason` is **mandatory** on rejection (returns `400` if missing).
    - Only acts on `pending` users (returns `400` if already processed).
    - On approve: sets `status → "active"`.
    - On reject: sets `status → "rejected"` and persists `rejectionReason`.
- **UI:** Created `/admin/pending` page with a full pending registration queue:
  - Shows all pending users with their full profile details (name, email, address, contact, food type / contact person).
  - Role badge distinguishes Donors vs NGO Recipients.
  - **Approve:** one-click, with a spinner during processing.
  - **Reject:** opens a modal requiring a mandatory reason before submitting.
  - Cards disappear from the queue immediately on action (optimistic UI).
- **AC Fulfilled:** Queue shows all registration details. Approve/reject with mandatory reason. Rejected users see the reason on their next login attempt. Rejected accounts cannot log in.

### Unified Admin Dashboard & Approval Workflow

- **Branch:** `feature/admin-dashboard-layout`
- **Layout:** Created `app/admin/layout.tsx` providing a permanent sidebar navigation for all admin sub-pages.
- **Navigation:** Includes:
  - **Overview:** Central dashboard with summary stats and a "peek" into the registration queue.
  - **Pending Approvals:** Dedicated queue for reviewing new Donor and NGO accounts.
  - **User Management:** Full list of active/suspended/banned users.
  - **Listing Moderation:** Oversight of all platform listings.
  - **Food Categories:** Dynamic management of category options.
  - **Impact Stats:** Detailed analytics and monthly report exports.
- **Workflow:**
  1. User registers (Donor/NGO) → Status is set to `pending`.
  2. Admin sees a real-time badge count in the sidebar and an alert in the Overview.
  3. Admin reviews profile in `/admin/pending` and clicks **Approve** (status → `active`) or **Reject** (status → `rejected` with reason).
  4. Active users can then log in; pending/rejected users are blocked with an informative message at the login gate.
- **AC Fulfilled:** Registration status defaults to pending; Admin must manually approve to activate account. Unified navigation for all admin tasks.

### US-A02: Suspend or Permanently Ban Accounts

- **Branch:** `feature/US-A02-suspend-ban`
- **Model:**
  - Updated `User` model to include `adminLogs` array storing the action (`suspended`, `banned`, `restored`), the `adminId`, `reason`, and `timestamp`.
- **API:**
  - Extended `PATCH /api/admin/users/[id]` to support `suspend`, `ban`, and `restore` actions. Requires a mandatory reason for suspend/ban. Pushes log entries into `adminLogs`.
  - Updated `GET /api/listings/browse/route.ts` to only fetch `available` listings where the `donorId.status` is `active`. This ensures suspended/banned user listings are immediately hidden from the platform without deleting them.
- **UI:**
  - Created `/admin/users` User Management dashboard.
  - Features filter tabs (All, Active, Suspended, Banned).
  - Displays a clean table of users (omitting admins and pending/rejected accounts).
  - Buttons to Suspend, Ban, or Restore open a confirmation modal asking for a reason before making the API call. Optimistic UI updates table inline.
- **AC Fulfilled:** Suspend blocks login (enforced in previous logic). Suspend hides listings (done via `browse` API). Ban is permanent (represented by distinct status). Actions logged with admin ID, timestamp, and reason.

### US-A03: View and Remove Inappropriate Listings

- **Branch:** `feature/US-A03-moderate-listings`
- **Model:** Extended `Listing` model with:
  - `"removed"` as a new status enum value.
  - `removalLog` embedded subdocument: `{ adminId, reason, removedAt }`.
- **Admin APIs (Role-Gated — `Admin` only):**
  - `GET /api/admin/listings?status=<filter>` — Returns all listings across all statuses, populated with donor/recipient details. Accepts an optional `status` query param to filter.
  - `DELETE /api/admin/listings/[id]` — Requires a mandatory `reason` in the request body. Sets `status → "removed"` and writes to `removalLog`. Returns 400 if listing is already removed.
- **UI:** Created `/admin/listings` Listing Moderation page:
  - Status filter pill-tabs: All, Available, Claimed, Collected, Cancelled, Removed.
  - Clean table showing food name, category, quantity, donor email, pickup date, and status badge.
  - **Remove** button opens a confirmation modal with a mandatory reason input.
  - Removed listings show a **"View log"** toggle to display the removal reason and timestamp inline.
  - Optimistic update: row status changes to "removed" immediately after successful API call.
- **AC Fulfilled:** Full listing table filterable by status. Admin can remove with a reason. Removals logged with admin ID, reason, and timestamp.

### US-A04: Food Category Management

- **Branch:** `feature/US-A04-category-management`
- **Model:** Created `models/Category.ts` — `{ name: String (unique, trimmed), active: Boolean }` with timestamps.
- **APIs:**
  - `GET /api/categories` — Public. Returns only `active: true` categories for donor forms. Auto-seeds 8 default categories on first request if DB is empty.
  - `GET /api/admin/categories` — Admin only. Returns all categories (including inactive).
  - `POST /api/admin/categories` — Admin only. Creates a new category with duplicate check (case-insensitive).
  - `PATCH /api/admin/categories/[id]` — Admin only. Accepts `{ name?, active? }` to rename or toggle status. Enforces unique name on rename.
- **UI:** Created `/admin/categories` page with:
  - Inline "Add category" input at the top.
  - Sortable list of all categories. Inactive ones are shown with strikethrough styling.
  - Inline rename mode (click "Rename" → edit field → Enter/Save).
  - Deactivate/Activate toggle per category.
- **Donor form updated:** `app/donor/post-listing/page.tsx` now fetches categories from `/api/categories` dynamically, falling back to static defaults on error.
- **AC Fulfilled:** Add, rename, deactivate categories. Deactivated disappear from donor form. Active shown to donors.

### US-A05: Platform-Wide Impact Statistics

- **Branch:** `feature/US-A05-platform-stats`
- **API:** Created `GET /api/admin/stats` using `Promise.all` to run 5 parallel queries:
  - User counts: total (non-admin), active, donors, recipients.
  - Listing status breakdown aggregation.
  - Monthly trend aggregation: collected listings grouped by year-month for last 6 months.
- **UI:** Created `/admin/stats` page:
  - **Users section:** 4 stat cards (Total, Active, Donors, NGOs).
  - **Listings section:** 5 stat cards (Rescued, Active, Pending, Cancelled, Removed).
  - **Monthly Trend Bar Chart:** Same pixel-height approach as donor dashboard, using green bars.
- **AC Fulfilled:** Shows donations completed, active users, and a monthly trend chart. Updates on each page load.

### US-A06: Monthly Impact Report Export

- **Branch:** `feature/US-A06-report-export`
- **API:** Created `GET /api/admin/export?month=YYYY-MM`:
  - Accepts an optional `month` query param. Defaults to current month.
  - Returns a streaming CSV with: summary section (active users, new registrations, donations count) and a detailed row per collected listing (food name, category, quantity, donor, recipient, pickup date).
  - Sets `Content-Disposition: attachment` so browser triggers a file download.
- **UI:** Added an Export section directly to the `/admin/stats` page:
  - Month picker (`<input type="month">`) defaulting to current month.
  - "Export CSV" button triggers a `fetch` → `Blob` → programmatic `<a>` download pattern, so no page navigation occurs.
- **AC Fulfilled:** Downloads a CSV summary of any given month including food rescued, donations, and active users.

### US-T06: Star Rating for Collected Donations

- **Branch:** `feature/US-T06-T08-recipient-features`
- **Model:** Added `rating: { stars: Number, comment: String, ratedAt: Date }` to `models/Listing.ts`.
- **API:** `POST /api/listings/[id]/rate`. Validates status is "collected" and ensures one-time rating per claim.
- **UI:**
  - Recipient can open a Star Rating modal from their Claim History for any "collected" listing.
  - Donor Dashboard updated to display the rating (stars and comment) in the "Past Donations" section.
- **AC Fulfilled:** Recipient can rate collected food 1-5 stars with a comment. Donor sees the rating on their dashboard.

### US-T07: View Claim History

- **Branch:** `feature/US-T06-T08-recipient-features`
- **API:** `GET /api/recipient/claims`. Returns all listings where `recipientId` matches the authenticated user, sorted by most recent. Populates donor profile details (name, contact, address).
- **UI:** Created `/recipient/claims` page:
  - Shows total claims and collected count stats at the top.
  - Lists all claims with status badges and revealed donor contact details.
  - Added "My Claims" navigation button to the main Browse page header.
- **AC Fulfilled:** Recipients have a dedicated history view of all their claimed and collected food.

### US-T08: Cancel a Claim

- **Branch:** `feature/US-T06-T08-recipient-features`
- **API:** `PATCH /api/listings/[id]/unclaim`. Resets listing status to "available" and removes the `recipientId`. Validates the listing is currently in "claimed" status.
- **UI:** Added a "Cancel Claim" button to the Claim History page for any listing with "claimed" status.
- **AC Fulfilled:** Recipients can return a claimed item to the available pool if they can no longer collect it.

---

## 7. UI/UX Non-Functional Requirements (Figma Redesign)

### NFR-UI: "Vital Harvest Ecosystem" Design System Integration

- **Objective:** Redesign the entire frontend to align with the provided Figma high-fidelity prototypes, migrating away from the generic Amber/Slate template to a premium Green/Slate aesthetic.
- **Typography:** Integrated `Plus_Jakarta_Sans` for bold, impactful headings and `Inter` for clean, legible body text.
- **Color Palette:**
  - **Primary Accent:** Green (`#006a34`) used for buttons, active tabs, and highlights.
  - **Secondary Accents:** Amber (`#fea520`) for ranking/badges, Light Green (`#f0fdf4`) for active background states.
  - **Surfaces:** Pure White (`#ffffff`) for cards/components, light slate (`#f7f9ff`, `#f8f9fa`) for page backgrounds and sidebars.
- **Component Geometry:** Sharp, modern corner radii (e.g., `rounded-[16px]`, `rounded-[8px]`), replacing generic `2xl` Tailwind classes.
- **Elevation/Depth:** Soft, green-tinted shadows (e.g., `shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)]`) and structured 1px slate borders (`#e2e8f0`, `#becabd`) for card elevation and layout separation.
- **Implementation Scope:** Landing Page (`app/page.tsx`), Recipient Browse Dashboard (`app/recipient/browse/page.tsx`), and corresponding Layouts (`app/layout.tsx`, `app/recipient/layout.tsx`). Logical backend integration (API fetching, filtering, JWT auth) was preserved perfectly without disruption.

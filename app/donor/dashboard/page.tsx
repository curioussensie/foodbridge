"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthSlots(trend: { _id: { year: number; month: number }; count: number }[]) {
  // Build last 6 months as slots
  const now = new Date();
  const slots = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = trend.find((t) => t._id.year === year && t._id.month === month);
    slots.push({ label: MONTH_NAMES[month - 1], count: found ? found.count : 0 });
  }
  return slots;
}

export default function DonorDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadAll() {
      try {
        const [listingsRes, statsRes] = await Promise.all([
          fetch("/api/donor/listings"),
          fetch("/api/donor/stats"),
        ]);

        if (!listingsRes.ok) {
          if (listingsRes.status === 401 || listingsRes.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load listings");
        }

        const listingsData = await listingsRes.json();
        setListings(listingsData.listings);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [router]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this listing? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/listings/${id}/cancel`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to cancel");
      setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: "cancelled" } : l)));
      setStats((prev: any) => prev ? {
        ...prev,
        counts: { ...prev.counts, available: prev.counts.available - 1, cancelled: prev.counts.cancelled + 1 }
      } : prev);
    } catch (err: any) { alert(err.message); }
  };

  const handleCollect = async (id: string) => {
    if (!window.confirm("Confirm that the food has been picked up and mark this listing as collected?")) return;
    try {
      const res = await fetch(`/api/listings/${id}/collect`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to mark as collected");
      setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: "collected" } : l)));
      setStats((prev: any) => prev ? {
        ...prev,
        counts: { ...prev.counts, claimed: prev.counts.claimed - 1, collected: prev.counts.collected + 1 }
      } : prev);
    } catch (err: any) { alert(err.message); }
  };

  const claimedListings = listings.filter((l) => l.status === "claimed");
  const activeListings = listings.filter((l) => l.status === "available");
  const pastListings = listings.filter((l) => l.status === "collected" || l.status === "cancelled");

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      available: "bg-emerald-100 text-emerald-700",
      claimed: "bg-blue-100 text-blue-700",
      collected: "bg-slate-100 text-slate-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${styles[status] || ""}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ListingCard = ({ listing }: { listing: any }) => (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-shadow hover:shadow-md ${listing.status === "claimed" ? "border-blue-200" : "border-slate-100"}`}>
      {listing.status === "claimed" && (
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 flex items-start gap-3">
          <span className="text-blue-500 mt-0.5 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Claimed by {listing.recipientId?.ngoProfile?.orgName || "an NGO"}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Pickup: {new Date(listing.pickupStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(listing.pickupEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, {new Date(listing.pickupStartTime).toLocaleDateString()}
            </p>
            {listing.recipientId?.ngoProfile?.contactPerson && (
              <p className="text-xs text-blue-500 mt-0.5">
                Contact: {listing.recipientId.ngoProfile.contactPerson}{listing.recipientId.ngoProfile.phone ? ` · ${listing.recipientId.ngoProfile.phone}` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {listing.photoUrl ? (
        <div className="h-40 overflow-hidden"><img src={listing.photoUrl} alt={listing.foodName} className="w-full h-full object-cover" /></div>
      ) : (
        <div className="h-36 bg-slate-100 flex items-center justify-center text-slate-300">
          <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{listing.foodName}</h3>
          <StatusBadge status={listing.status} />
        </div>
        <p className="text-sm text-slate-600 mb-4">{listing.quantity} · {listing.category}</p>

        <div className="mt-auto space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
            <div className="font-semibold text-slate-700 mb-1">Pickup Window</div>
            <div>{new Date(listing.pickupStartTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</div>
            <div>{new Date(listing.pickupEndTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>

          {listing.status === "available" && (
            <div className="flex gap-2">
              <Link href={`/donor/edit-listing/${listing._id}`} className="flex-1 flex items-center justify-center min-h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </Link>
              <button onClick={() => handleCancel(listing._id)} className="flex-1 flex items-center justify-center min-h-10 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl text-sm transition-colors">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Cancel
              </button>
            </div>
          )}

          {listing.status === "claimed" && (
            <button onClick={() => handleCollect(listing._id)} className="w-full flex items-center justify-center min-h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Mark as Collected
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Build chart slots from stats
  const chartSlots = stats ? buildMonthSlots(stats.monthlyTrend || []) : [];
  const chartMax = Math.max(...chartSlots.map((s) => s.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Donor Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your listings and track your impact.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/donor/post-listing" className="inline-flex items-center justify-center min-h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-md shadow-amber-500/20">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Post New Listing
            </Link>
          </div>
        </div>

        {/* US-D07: Impact Stats */}
        {stats && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Your Impact</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="text-4xl font-extrabold text-emerald-600">{stats.counts.collected}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Donations Rescued</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="text-4xl font-extrabold text-amber-500">{stats.counts.available}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Active Listings</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="text-4xl font-extrabold text-blue-500">{stats.counts.claimed}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Pending Pickups</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="text-4xl font-extrabold text-slate-700">
                  {stats.counts.available + stats.counts.claimed + stats.counts.collected + stats.counts.cancelled}
                </div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Total Posted</div>
              </div>
            </div>

            {/* Monthly trend chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-700 mb-6">Monthly Donations Rescued (Last 6 Months)</h3>
              <div className="flex items-end gap-3" style={{ height: "128px" }}>
                {chartSlots.map((slot, i) => {
                  const barHeightPx = slot.count === 0 ? 4 : Math.max((slot.count / chartMax) * 104, 12);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500" style={{ minHeight: "16px" }}>
                        {slot.count > 0 ? slot.count : ""}
                      </span>
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${barHeightPx}px`,
                          backgroundColor: slot.count === 0 ? "#f1f5f9" : "#f59e0b",
                        }}
                      />
                      <span className="text-xs text-slate-400 font-medium">{slot.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center p-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No listings yet</h3>
            <p className="text-slate-500 mt-1 mb-6">Start sharing your surplus food with the community.</p>
            <Link href="/donor/post-listing" className="text-amber-500 font-medium hover:text-amber-600">Create your first listing &rarr;</Link>
          </div>
        ) : (
          <>
            {claimedListings.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <h2 className="text-xl font-bold text-slate-800">Pending Pickups</h2>
                  <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">{claimedListings.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {claimedListings.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>
              </section>
            )}

            {activeListings.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Active Listings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeListings.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>
              </section>
            )}

            {pastListings.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Past Donations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastListings.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

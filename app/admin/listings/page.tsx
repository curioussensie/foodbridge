"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700",
  claimed: "bg-blue-50 text-blue-700",
  collected: "bg-slate-100 text-slate-600",
  cancelled: "bg-orange-50 text-orange-700",
  removed: "bg-red-50 text-red-600",
};

type Listing = {
  _id: string;
  foodName: string;
  category: string;
  quantity: string;
  status: "available" | "claimed" | "collected" | "cancelled" | "removed";
  createdAt: string;
  pickupStartTime: string;
  donorId?: { email: string; donorProfile?: { name: string } };
  recipientId?: { email: string; ngoProfile?: { orgName: string } };
  removalLog?: { reason: string; removedAt: string };
};

const STATUS_FILTERS = ["all", "available", "claimed", "collected", "cancelled", "removed"];

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [removeModal, setRemoveModal] = useState<{ id: string; foodName: string } | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  async function loadListings(status: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/listings${status !== "all" ? `?status=${status}` : ""}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load listings.");
      const data = await res.json();
      setListings(data.listings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings(filter);
  }, [filter]);

  const handleRemoveSubmit = async () => {
    if (!removeModal) return;
    if (!removeReason.trim()) {
      setRemoveError("A reason is required.");
      return;
    }

    setProcessingId(removeModal.id);
    try {
      const res = await fetch(`/api/admin/listings/${removeModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: removeReason }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove.");
      setListings((prev) =>
        prev.map((l) => l._id === removeModal.id ? { ...l, status: "removed" as any } : l)
      );
      setRemoveModal(null);
      setRemoveReason("");
      setRemoveError("");
    } catch (err: any) {
      setRemoveError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Listing Moderation</h1>
              <p className="text-slate-500 text-sm mt-0.5">Review and remove inappropriate listings.</p>
            </div>
            {!loading && (
              <span className="ml-auto sm:ml-0 text-sm font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {listings.length} result{listings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${filter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <p className="text-slate-500">No listings found with status "{filter}".</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">Food</th>
                    <th className="px-6 py-4 font-semibold">Donor</th>
                    <th className="px-6 py-4 font-semibold">Pickup</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((listing) => (
                    <>
                      <tr key={listing._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{listing.foodName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{listing.category} · {listing.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {listing.donorId?.donorProfile?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-400">{listing.donorId?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(listing.pickupStartTime).toLocaleDateString([], { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[listing.status] || ""}`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {listing.status === "removed" ? (
                            <button
                              onClick={() => setExpandedId(expandedId === listing._id ? null : listing._id)}
                              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              {expandedId === listing._id ? "Hide log" : "View log"}
                            </button>
                          ) : (
                            <button
                              onClick={() => { setRemoveModal({ id: listing._id, foodName: listing.foodName }); setRemoveReason(""); setRemoveError(""); }}
                              className="text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded removal log */}
                      {expandedId === listing._id && listing.removalLog && (
                        <tr key={`${listing._id}-log`} className="bg-red-50">
                          <td colSpan={5} className="px-6 py-3">
                            <div className="text-xs text-red-700 flex gap-4 flex-wrap">
                              <span><span className="font-semibold">Removed on:</span> {new Date(listing.removalLog.removedAt).toLocaleString()}</span>
                              <span><span className="font-semibold">Reason:</span> {listing.removalLog.reason}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Remove modal */}
      {removeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-red-600 mb-1">Remove Listing</h2>
            <p className="text-sm text-slate-500 mb-4">
              You are removing <span className="font-semibold text-slate-700">"{removeModal.foodName}"</span>. This will immediately hide it from the platform. The record will be preserved with the reason.
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={removeReason}
              onChange={(e) => { setRemoveReason(e.target.value); setRemoveError(""); }}
              rows={3}
              placeholder="e.g. Listing contains offensive content or inappropriate information."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            {removeError && <p className="text-red-500 text-xs mt-1">{removeError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setRemoveModal(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSubmit}
                disabled={processingId !== null}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-[rgba(38,133,73,0.1)] text-[#006a34]",
  claimed: "bg-[rgba(254,165,32,0.2)] text-[#865300]",
  collected: "bg-[#e7eff9] text-[#3f4940]",
  cancelled: "bg-[rgba(212,62,48,0.1)] text-[#b1241a]",
  removed: "bg-[#d43e30] text-white",
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
    <div className="min-h-screen bg-transparent p-4 py-8 font-['Inter']">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgba(212,62,48,0.1)] rounded-[8px] flex items-center justify-center text-[#b1241a]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Listing Moderation</h1>
              <p className="text-[#6f7a6f] text-[14px] mt-0.5">Review and remove inappropriate listings.</p>
            </div>
            {!loading && (
              <span className="ml-auto sm:ml-0 text-[12px] font-semibold bg-[#f7f9ff] text-[#3f4940] px-3 py-1 rounded-[6px] border border-[#dbe3ed]">
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
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-[6px] capitalize transition-colors ${filter === f ? "bg-[#151c23] text-white" : "bg-[#f7f9ff] text-[#6f7a6f] hover:bg-[#e7eff9] border border-[#dbe3ed]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]" />
          </div>
        ) : error ? (
          <div className="p-4 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-[12px] border border-[#d43e30]/20">{error}</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-16 text-center">
            <p className="text-[#6f7a6f] text-[14px]">No listings found with status "{filter}".</p>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f9ff] border-b border-[#dbe3ed] text-[12px] uppercase tracking-wider text-[#6f7a6f] font-semibold">
                    <th className="px-6 py-4">Food</th>
                    <th className="px-6 py-4">Donor</th>
                    <th className="px-6 py-4">Pickup</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe3ed]">
                  {listings.map((listing) => (
                    <>
                      <tr key={listing._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#151c23] text-[14px]">{listing.foodName}</div>
                          <div className="text-[12px] text-[#8a968a] mt-0.5">{listing.category} · {listing.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-medium text-[#3f4940]">
                            {listing.donorId?.donorProfile?.name || "—"}
                          </div>
                          <div className="text-[12px] text-[#8a968a]">{listing.donorId?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-[#3f4940]">
                          {new Date(listing.pickupStartTime).toLocaleDateString([], { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[12px] px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[listing.status] || ""}`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {listing.status === "removed" ? (
                            <button
                              onClick={() => setExpandedId(expandedId === listing._id ? null : listing._id)}
                              className="text-[12px] font-semibold px-3 py-1.5 bg-[#f7f9ff] border border-[#dbe3ed] text-[#3f4940] hover:bg-[#e7eff9] rounded-[6px] transition-colors"
                            >
                              {expandedId === listing._id ? "Hide log" : "View log"}
                            </button>
                          ) : (
                            <button
                              onClick={() => { setRemoveModal({ id: listing._id, foodName: listing.foodName }); setRemoveReason(""); setRemoveError(""); }}
                              className="text-[12px] font-semibold px-3 py-1.5 bg-[rgba(212,62,48,0.1)] text-[#b1241a] hover:bg-[rgba(212,62,48,0.2)] rounded-[6px] transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded removal log */}
                      {expandedId === listing._id && listing.removalLog && (
                        <tr key={`${listing._id}-log`} className="bg-[rgba(212,62,48,0.05)] border-b border-[#dbe3ed]">
                          <td colSpan={5} className="px-6 py-3">
                            <div className="text-[12px] text-[#b1241a] flex gap-4 flex-wrap">
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
        <div className="fixed inset-0 bg-[#151c23]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.1)] w-full max-w-md p-6">
            <h2 className="text-[20px] font-bold text-[#b1241a] font-['Plus_Jakarta_Sans'] mb-1">Remove Listing</h2>
            <p className="text-[14px] text-[#6f7a6f] mb-4">
              You are removing <span className="font-semibold text-[#151c23]">"{removeModal.foodName}"</span>. This will immediately hide it from the platform. The record will be preserved with the reason.
            </p>

            <label className="block text-[14px] font-medium text-[#3f4940] mb-1.5">
              Reason <span className="text-[#b1241a]">*</span>
            </label>
            <textarea
              value={removeReason}
              onChange={(e) => { setRemoveReason(e.target.value); setRemoveError(""); }}
              rows={3}
              placeholder="e.g. Listing contains offensive content or inappropriate information."
              className="w-full border border-[#dbe3ed] rounded-[8px] px-4 py-3 text-[14px] text-[#151c23] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] resize-none"
            />
            {removeError && <p className="text-[#b1241a] text-[12px] mt-1">{removeError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setRemoveModal(null)}
                className="flex-1 px-4 py-2.5 bg-[#f7f9ff] hover:bg-[#e7eff9] text-[#3f4940] font-semibold rounded-[8px] text-[14px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSubmit}
                disabled={processingId !== null}
                className="flex-1 px-4 py-2.5 bg-[#d43e30] hover:bg-[#b1241a] text-white font-semibold rounded-[8px] text-[14px] transition-colors disabled:opacity-50"
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

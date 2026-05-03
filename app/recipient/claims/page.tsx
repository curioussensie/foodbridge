"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  claimed: "bg-blue-50 text-blue-700",
  collected: "bg-emerald-50 text-emerald-700",
  available: "bg-slate-100 text-slate-500",
  cancelled: "bg-orange-50 text-orange-700",
  removed: "bg-red-50 text-red-600",
};

type Claim = {
  _id: string;
  foodName: string;
  quantity: string;
  category: string;
  status: string;
  claimedAt?: string;
  pickupStartTime: string;
  rating?: { stars: number; comment?: string };
  donorId?: { email: string; donorProfile?: { name: string; contact: string; address: string } };
};

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-colors"
        >
          <span className={(hovered || value) >= n ? "text-amber-400" : "text-slate-200"}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function ClaimHistoryPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{ id: string; foodName: string } | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/recipient/claims");
        if (res.status === 401 || res.status === 403) { router.push("/login"); return; }
        if (!res.ok) throw new Error("Failed to load claim history.");
        const data = await res.json();
        setClaims(data.claims);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleUnclaim = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this claim? The listing will return to available.")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/listings/${id}/unclaim`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to cancel.");
      // Remove from list (or update status — since cancelled claims stay with recipientId, show updated status)
      setClaims((prev) => prev.filter((c) => c._id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const openRatingModal = (id: string, foodName: string) => {
    setRatingModal({ id, foodName });
    setRatingStars(0);
    setRatingComment("");
    setRatingError("");
  };

  const handleRatingSubmit = async () => {
    if (!ratingModal) return;
    if (ratingStars === 0) { setRatingError("Please select a star rating."); return; }
    setRatingSubmitting(true); setRatingError("");
    try {
      const res = await fetch(`/api/listings/${ratingModal.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: ratingStars, comment: ratingComment }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to submit rating.");
      setClaims((prev) => prev.map((c) =>
        c._id === ratingModal.id ? { ...c, rating: { stars: ratingStars, comment: ratingComment } } : c
      ));
      setRatingModal(null);
    } catch (e: any) {
      setRatingError(e.message);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const totalClaims = claims.length;
  const collected = claims.filter((c) => c.status === "collected").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Claim History</h1>
              <p className="text-slate-500 text-sm mt-0.5">All donations you have claimed.</p>
            </div>
          </div>

          {!loading && (
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-slate-800">{totalClaims}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Total Claims</div>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <div className="text-3xl font-extrabold text-emerald-600">{collected}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Collected</div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <p className="text-slate-500">You haven't claimed any donations yet.</p>
            <button onClick={() => router.push("/recipient/browse")} className="mt-4 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">Browse Listings</button>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const donor = claim.donorId?.donorProfile;
              return (
                <div key={claim._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-800">{claim.foodName}</h2>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[claim.status] || "bg-slate-100 text-slate-500"}`}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {claim.category} · {claim.quantity}
                      </div>
                      {claim.claimedAt && (
                        <div className="text-xs text-slate-400 mt-1">
                          Claimed {new Date(claim.claimedAt).toLocaleDateString([], { dateStyle: "medium" })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {/* US-T08: Cancel claim */}
                      {claim.status === "claimed" && (
                        <button
                          onClick={() => handleUnclaim(claim._id)}
                          disabled={processingId === claim._id}
                          className="text-xs font-semibold px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancel Claim
                        </button>
                      )}
                      {/* US-T06: Rate */}
                      {claim.status === "collected" && !claim.rating && (
                        <button
                          onClick={() => openRatingModal(claim._id, claim.foodName)}
                          className="text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                          ★ Rate Donation
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Donor details (revealed after claim) */}
                  {donor && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Donor</div>
                        <div className="text-sm font-semibold text-slate-700 mt-0.5">{donor.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Address</div>
                        <div className="text-sm text-slate-600 mt-0.5">{donor.address}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Contact</div>
                        <div className="text-sm text-slate-600 mt-0.5">{donor.contact}</div>
                      </div>
                    </div>
                  )}

                  {/* Existing rating */}
                  {claim.rating && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-lg">{Array.from({ length: claim.rating.stars }, () => "★").join("")}<span className="text-slate-200">{Array.from({ length: 5 - claim.rating.stars }, () => "★").join("")}</span></span>
                        {claim.rating.comment && <span className="text-sm text-slate-500 italic">"{claim.rating.comment}"</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Rate this Donation</h2>
            <p className="text-sm text-slate-500 mb-5">How was <span className="font-semibold text-slate-700">"{ratingModal.foodName}"</span>?</p>

            <div className="mb-4">
              <div className="text-sm font-medium text-slate-700 mb-2">Stars <span className="text-red-500">*</span></div>
              <StarRating value={ratingStars} onChange={setRatingStars} />
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">Comment <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
            {ratingError && <p className="text-red-500 text-xs mt-1">{ratingError}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setRatingModal(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={handleRatingSubmit} disabled={ratingSubmitting} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50">
                {ratingSubmitting ? "Submitting…" : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

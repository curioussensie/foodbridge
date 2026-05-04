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
    <div className="p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Claim History</h1>
            <p className="text-slate-500 mt-1">Track all your food rescues and contributions.</p>
          </div>
        </div>

        {!loading && (
          <div className="flex items-center gap-8 px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800">{totalClaims}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Claims</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-600">{collected}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Collected</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium">{error}</div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No claims yet</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto mb-8">You haven't claimed any donations yet. Start making an impact today!</p>
          <button onClick={() => router.push("/recipient/browse")} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Browse Listings</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {claims.map((claim) => {
            const donor = claim.donorId?.donorProfile;
            return (
              <div key={claim._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-widest ${STATUS_STYLES[claim.status] || "bg-slate-100 text-slate-500"}`}>
                      {claim.status}
                    </span>
                    {claim.claimedAt && (
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(claim.claimedAt).toLocaleDateString([], { dateStyle: "long" })}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{claim.foodName}</h2>
                  <div className="flex items-center gap-4 text-slate-500 font-medium">
                     <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
                        {claim.category}
                     </span>
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                     <span>{claim.quantity}</span>
                  </div>

                  {donor && (
                    <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex gap-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                         </div>
                         <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Donor Store</div>
                            <div className="text-sm font-bold text-slate-700">{donor.name}</div>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Address</div>
                            <div className="text-sm font-medium text-slate-600 line-clamp-1">{donor.address}</div>
                         </div>
                      </div>
                    </div>
                  )}

                  {claim.rating && (
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Your Rating</div>
                        <div className="flex items-center gap-2">
                           <div className="flex gap-0.5 text-amber-400 text-sm">
                             {"★".repeat(claim.rating.stars)}{"☆".repeat(5 - claim.rating.stars)}
                           </div>
                           {claim.rating.comment && <span className="text-sm text-slate-500 italic">"{claim.rating.comment}"</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-[160px]">
                  {claim.status === "claimed" && (
                    <>
                      <button
                        onClick={() => router.push(`/recipient/claim/${claim._id}`)}
                        className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-slate-900/10"
                      >
                        Collection Details
                      </button>
                      <button
                        onClick={() => handleUnclaim(claim._id)}
                        disabled={processingId === claim._id}
                        className="w-full h-11 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                      >
                        Cancel Claim
                      </button>
                    </>
                  )}
                  {claim.status === "collected" && !claim.rating && (
                    <button
                      onClick={() => openRatingModal(claim._id, claim.foodName)}
                      className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      Rate Experience
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 transform transition-all">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 mx-auto">
               <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">Rate Donation</h2>
            <p className="text-sm text-slate-500 text-center mb-8">How was <span className="font-bold text-slate-700">"{ratingModal.foodName}"</span>?</p>

            <div className="space-y-6">
              <div className="flex justify-center py-2">
                <StarRating value={ratingStars} onChange={setRatingStars} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Share your thoughts</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about the collection process, food quality, etc."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all resize-none font-medium"
                />
              </div>
              
              {ratingError && <p className="text-red-500 text-xs text-center font-bold">{ratingError}</p>}

              <div className="flex flex-col gap-3 pt-2">
                <button onClick={handleRatingSubmit} disabled={ratingSubmitting} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10">
                  {ratingSubmitting ? "Submitting…" : "Submit Feedback"}
                </button>
                <button onClick={() => setRatingModal(null)} className="w-full py-3 bg-white text-slate-400 font-bold rounded-2xl hover:text-slate-600 transition-all text-sm">
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

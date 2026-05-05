"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  claimed: "bg-[rgba(254,165,32,0.2)] text-[#865300]",
  collected: "bg-[rgba(38,133,73,0.1)] text-[#006a34]",
  available: "bg-[#e7eff9] text-[#3f4940]",
  cancelled: "bg-[rgba(212,62,48,0.1)] text-[#b1241a]",
  removed: "bg-[rgba(212,62,48,0.1)] text-[#b1241a]",
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
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-colors focus:outline-none"
        >
          <span className={(hovered || value) >= n ? "text-[#fea520]" : "text-[#dbe3ed]"}>★</span>
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
    <div className="p-6 lg:p-10 space-y-10 font-['Inter']">
      {/* Header */}
      <div className="bg-white rounded-[16px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[rgba(38,133,73,0.1)] rounded-[12px] flex items-center justify-center text-[#006a34] shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] tracking-tight">My Claim History</h1>
            <p className="text-[#6f7a6f] text-[14px] mt-1">Track all your food rescues and contributions.</p>
          </div>
        </div>

        {!loading && (
          <div className="flex items-center gap-8 px-8 py-4 bg-[#f7f9ff] rounded-[12px] border border-[#dbe3ed]">
            <div className="text-center">
              <div className="text-[28px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">{totalClaims}</div>
              <div className="text-[10px] text-[#8a968a] font-bold uppercase tracking-widest mt-1">Total Claims</div>
            </div>
            <div className="w-px h-10 bg-[#dbe3ed]" />
            <div className="text-center">
              <div className="text-[28px] font-bold text-[#006a34] font-['Plus_Jakarta_Sans']">{collected}</div>
              <div className="text-[10px] text-[#8a968a] font-bold uppercase tracking-widest mt-1">Collected</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-[8px] border border-[#d43e30]/20 font-medium text-[14px]">{error}</div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-20 text-center">
          <div className="w-20 h-20 bg-[#f7f9ff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#8a968a]">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
          </div>
          <h3 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">No claims yet</h3>
          <p className="text-[#6f7a6f] text-[14px] mt-2 max-w-md mx-auto mb-8">You haven't claimed any donations yet. Start making an impact today!</p>
          <button onClick={() => router.push("/recipient/browse")} className="px-8 py-3 bg-[#006a34] text-white font-semibold rounded-[8px] shadow-[0px_4px_10px_rgba(0,106,52,0.15)] hover:bg-[#00552a] transition-colors">Browse Listings</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {claims.map((claim) => {
            const donor = claim.donorId?.donorProfile;
            return (
              <div key={claim._id} className="bg-white rounded-[16px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] hover:shadow-[0px_8px_20px_rgba(0,106,52,0.08)] transition-all p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-[4px] font-bold uppercase tracking-widest ${STATUS_STYLES[claim.status] || "bg-[#e7eff9] text-[#3f4940]"}`}>
                      {claim.status}
                    </span>
                    {claim.claimedAt && (
                      <span className="text-[12px] text-[#8a968a] font-medium">
                        {new Date(claim.claimedAt).toLocaleDateString([], { dateStyle: "long" })}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-[20px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-2">{claim.foodName}</h2>
                  <div className="flex items-center gap-4 text-[#6f7a6f] text-[14px] font-medium">
                     <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#8a968a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
                        {claim.category}
                     </span>
                     <span className="w-1.5 h-1.5 rounded-full bg-[#dbe3ed]" />
                     <span>{claim.quantity}</span>
                  </div>

                  {donor && (
                    <div className="mt-6 pt-5 border-t border-[#dbe3ed] grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex gap-3">
                         <div className="w-10 h-10 bg-[#f7f9ff] rounded-[8px] flex items-center justify-center text-[#3f4940] shrink-0 border border-[#dbe3ed]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                         </div>
                         <div>
                            <div className="text-[10px] text-[#8a968a] font-bold uppercase tracking-widest mb-0.5">Donor Store</div>
                            <div className="text-[14px] font-semibold text-[#151c23]">{donor.name}</div>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <div className="w-10 h-10 bg-[#f7f9ff] rounded-[8px] flex items-center justify-center text-[#3f4940] shrink-0 border border-[#dbe3ed]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <div>
                            <div className="text-[10px] text-[#8a968a] font-bold uppercase tracking-widest mb-0.5">Address</div>
                            <div className="text-[14px] font-medium text-[#3f4940] line-clamp-1">{donor.address}</div>
                         </div>
                      </div>
                    </div>
                  )}

                  {claim.rating && (
                    <div className="mt-6 pt-5 border-t border-[#dbe3ed] flex items-start gap-4">
                      <div className="w-10 h-10 bg-[rgba(254,165,32,0.1)] rounded-[8px] flex items-center justify-center text-[#fea520] shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8a968a] font-bold uppercase tracking-widest mb-1">Your Rating</div>
                        <div className="flex items-center gap-2">
                           <div className="flex gap-0.5 text-[#fea520] text-[14px]">
                             {"★".repeat(claim.rating.stars)}<span className="text-[#dbe3ed]">{"★".repeat(5 - claim.rating.stars)}</span>
                           </div>
                           {claim.rating.comment && <span className="text-[14px] text-[#6f7a6f] italic line-clamp-1">"{claim.rating.comment}"</span>}
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
                        className="w-full h-10 bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] text-[12px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)]"
                      >
                        Collection Details
                      </button>
                      <button
                        onClick={() => handleUnclaim(claim._id)}
                        disabled={processingId === claim._id}
                        className="w-full h-10 bg-[rgba(212,62,48,0.1)] hover:bg-[rgba(212,62,48,0.2)] text-[#b1241a] font-semibold rounded-[8px] text-[12px] transition-colors disabled:opacity-50"
                      >
                        Cancel Claim
                      </button>
                    </>
                  )}
                  {claim.status === "collected" && !claim.rating && (
                    <button
                      onClick={() => openRatingModal(claim._id, claim.foodName)}
                      className="w-full h-10 bg-[#f7f9ff] hover:bg-[#e7eff9] text-[#3f4940] border border-[#dbe3ed] font-semibold rounded-[8px] text-[12px] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-[#fea520]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
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
        <div className="fixed inset-0 bg-[#151c23]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-md p-8 border border-[#dbe3ed]">
            <div className="w-16 h-16 bg-[rgba(254,165,32,0.1)] rounded-[12px] flex items-center justify-center text-[#fea520] mb-6 mx-auto">
               <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] text-center mb-1">Rate Donation</h2>
            <p className="text-[14px] text-[#6f7a6f] text-center mb-6">How was <span className="font-semibold text-[#151c23]">"{ratingModal.foodName}"</span>?</p>

            <div className="space-y-6">
              <div className="flex justify-center py-2">
                <StarRating value={ratingStars} onChange={setRatingStars} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8a968a] uppercase tracking-widest mb-2">Share your thoughts</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about the collection process, food quality, etc."
                  className="w-full bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] px-4 py-3 text-[14px] text-[#151c23] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] focus:border-[#006a34] transition-all resize-none placeholder:text-[#8a968a]"
                />
              </div>
              
              {ratingError && <p className="text-[#b1241a] text-[12px] text-center font-bold">{ratingError}</p>}

              <div className="flex flex-col gap-3 pt-2">
                <button onClick={handleRatingSubmit} disabled={ratingSubmitting} className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors disabled:opacity-50 shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[14px]">
                  {ratingSubmitting ? "Submitting…" : "Submit Feedback"}
                </button>
                <button onClick={() => setRatingModal(null)} className="w-full h-[48px] bg-white border border-[#dbe3ed] text-[#3f4940] font-semibold rounded-[8px] hover:bg-[#f7f9ff] transition-colors text-[14px]">
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

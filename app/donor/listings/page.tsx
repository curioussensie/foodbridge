"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DonorListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch("/api/donor/listings");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load listings");
        }
        const data = await res.json();
        setListings(data.listings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [router]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this listing? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/listings/${id}/cancel`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to cancel");
      setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: "cancelled" } : l)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCollect = async (id: string) => {
    if (!window.confirm("Confirm that the food has been picked up and mark this listing as collected?")) return;
    try {
      const res = await fetch(`/api/listings/${id}/collect`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to mark as collected");
      setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: "collected" } : l)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const claimedListings = listings.filter((l) => l.status === "claimed");
  const activeListings = listings.filter((l) => l.status === "available");
  const pastListings = listings.filter((l) => l.status === "collected" || l.status === "cancelled");

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      available: "bg-[rgba(38,133,73,0.1)] text-[#006a34]",
      claimed: "bg-[rgba(254,165,32,0.2)] text-[#865300]",
      collected: "bg-[#e7eff9] text-[#3f4940]",
      cancelled: "bg-[rgba(212,62,48,0.1)] text-[#b1241a]",
    };
    return (
      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-[4px] font-bold ${styles[status] || ""}`}>
        {status}
      </span>
    );
  };

  const ListingCard = ({ listing }: { listing: any }) => (
    <div className={`bg-white rounded-[12px] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] border flex flex-col transition-all hover:shadow-[0px_8px_20px_rgba(0,106,52,0.08)] ${listing.status === "claimed" ? "border-[rgba(254,165,32,0.4)]" : "border-[#dbe3ed]"}`}>
      {listing.status === "claimed" && (
        <div className="bg-[rgba(254,165,32,0.05)] border-b border-[rgba(254,165,32,0.2)] px-5 py-4 flex items-start gap-3 rounded-t-[12px]">
          <div className="w-8 h-8 bg-[rgba(254,165,32,0.2)] rounded-[8px] flex items-center justify-center text-[#865300] shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] line-clamp-1">Claimed by {listing.recipientId?.ngoProfile?.orgName || "an NGO"}</p>
            <p className="text-[12px] text-[#6f7a6f] font-medium mt-0.5">Contact: {listing.recipientId?.ngoProfile?.contactPerson || "Pending"}</p>
          </div>
        </div>
      )}

      {listing.photoUrl ? (
        <div className={`h-40 overflow-hidden relative ${listing.status !== "claimed" ? "rounded-t-[12px]" : ""}`}>
          <img src={listing.photoUrl} alt={listing.foodName} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4"><StatusBadge status={listing.status} /></div>
        </div>
      ) : (
        <div className={`h-40 bg-[#f7f9ff] flex items-center justify-center text-[#8a968a] relative ${listing.status !== "claimed" ? "rounded-t-[12px]" : ""}`}>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="absolute top-4 right-4"><StatusBadge status={listing.status} /></div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[18px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] line-clamp-1 mb-1">{listing.foodName}</h3>
        <p className="text-[14px] text-[#6f7a6f] mb-4">{listing.quantity} · {listing.category}</p>

        {listing.rating && (
          <div className="mb-4 bg-[rgba(254,165,32,0.1)] p-3 rounded-[8px] border border-[rgba(254,165,32,0.2)]">
            <div className="flex items-center gap-1 mb-1 text-[12px]">
              <span className="text-[#fea520] font-bold">{"★".repeat(listing.rating.stars)}</span>
              <span className="text-[#dbe3ed] font-bold">{"★".repeat(5 - listing.rating.stars)}</span>
            </div>
            {listing.rating.comment && <p className="text-[12px] text-[#694000] italic line-clamp-2">"{listing.rating.comment}"</p>}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#dbe3ed] space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-[#8a968a] font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Pickup Window
          </div>
          <div className="text-[12px] text-[#3f4940] font-medium">
            {new Date(listing.pickupStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(listing.pickupEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            <span className="text-[#dbe3ed] mx-2">|</span>
            {new Date(listing.pickupStartTime).toLocaleDateString([], { dateStyle: "medium" })}
          </div>

          <div className="pt-2 flex gap-2">
            {listing.status === "available" && (
              <>
                <Link href={`/donor/edit-listing/${listing._id}`} className="flex-1 h-10 bg-[#f7f9ff] border border-[#dbe3ed] hover:bg-[#e7eff9] text-[#3f4940] font-semibold rounded-[8px] text-[12px] transition-colors flex items-center justify-center">Edit</Link>
                <button onClick={() => handleCancel(listing._id)} className="w-10 h-10 bg-[rgba(212,62,48,0.1)] hover:bg-[rgba(212,62,48,0.2)] text-[#b1241a] rounded-[8px] transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </>
            )}
            {listing.status === "claimed" && (
              <button onClick={() => handleCollect(listing._id)} className="w-full h-10 bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] text-[12px] transition-colors flex items-center justify-center gap-2 shadow-[0px_4px_10px_rgba(0,106,52,0.15)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Confirm Collection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 font-['Inter']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] tracking-tight">My Listings</h1>
          <p className="text-[#6f7a6f] text-[14px] mt-1">Manage your active and past food donations.</p>
        </div>
        <Link href="/donor/post-listing" className="inline-flex items-center gap-2 px-6 py-3 bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[14px] whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post New Donation
        </Link>
      </div>

      <div className="space-y-10">
        {claimedListings.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#fea520] animate-pulse"></div>
              <h2 className="text-[20px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Pending Pickups</h2>
              <span className="px-2 py-0.5 bg-[rgba(254,165,32,0.2)] text-[#865300] text-[12px] font-semibold rounded-[6px]">{claimedListings.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedListings.map((l) => <ListingCard key={l._id} listing={l} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[20px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-6">Active Listings</h2>
          {activeListings.length === 0 ? (
            <div className="bg-white p-12 rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] text-center">
              <p className="text-[#8a968a] font-medium text-[14px]">No active listings available.</p>
              <Link href="/donor/post-listing" className="text-[#006a34] text-[14px] font-semibold mt-3 inline-block hover:underline">Create one now &rarr;</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeListings.map((l) => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}
        </section>

        {pastListings.length > 0 && (
          <section>
            <h2 className="text-[20px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-6">Past Donations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {pastListings.map((l) => <ListingCard key={l._id} listing={l} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

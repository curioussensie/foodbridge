"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BrowseListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/listings/browse");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load listings");
        }
        const data = await res.json();
        setListings(data.listings);
        setFilteredListings(data.listings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [router]);

  // Handle Filtering
  useEffect(() => {
    let result = listings;
    if (categoryFilter) {
      result = result.filter((l) => l.category === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.foodName.toLowerCase().includes(q) ||
          (l.donorId?.donorProfile?.name || "").toLowerCase().includes(q),
      );
    }
    setFilteredListings(result);
  }, [categoryFilter, searchQuery, listings]);

  const handleClaim = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to claim this food? Make sure you can pick it up within the stated window.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/listings/${id}/claim`, { method: "PATCH" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to claim listing.");
      }

      // Redirect to confirmation page to show donor details
      router.push(`/recipient/claim/${id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-[24px] max-w-[1440px] mx-auto w-full flex flex-col gap-[32px]">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-heading font-semibold text-[#151c23] tracking-tight">
            Available Near You
          </h1>
          <p className="text-[16px] text-[#3f4940] mt-1">
            Fresh rescues ready for pickup in your local area.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {["", "Bakery", "Produce", "Prepared Meals"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-all ${
                  categoryFilter === cat
                    ? "bg-[#268549] text-[#f6fff3]"
                    : "bg-white border border-[#becabd] text-[#3f4940] hover:bg-slate-50"
                }`}
              >
                {cat || "All"}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-[#becabd] hidden sm:block mx-2"></div>

          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <div className="bg-[#edf4fe] border border-[#becabd] rounded-[8px] flex items-center px-3 py-2">
              <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search available food..."
                className="bg-transparent border-none outline-none w-full text-[14px] font-medium text-[#3f4940] placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center p-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-[#b1241a] rounded-[16px] border border-red-100 font-medium">
          {error}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white p-20 rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] border border-[#becabd] text-center">
          <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-[24px] font-heading font-semibold text-[#151c23]">No food found</h3>
          <p className="text-[16px] text-[#6f7a6f] mt-2 max-w-md mx-auto">
            We couldn't find any available food matching your criteria. Check
            back later or try different filters.
          </p>
          {(categoryFilter || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter("");
                setSearchQuery("");
              }}
              className="mt-8 px-6 py-2 bg-[#edf4fe] border border-[#becabd] text-[#151c23] font-semibold rounded-[8px] transition-all hover:bg-slate-100"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px]">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] border border-transparent hover:border-[#becabd] overflow-hidden flex flex-col transition-all duration-300 group"
            >
              <div className="h-[192px] w-full overflow-hidden relative">
                {listing.photoUrl ? (
                  <img
                    src={listing.photoUrl}
                    alt={listing.foodName}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center text-[#becabd]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-[8px] py-[4px] bg-[#fea520] text-[#694000] text-[12px] font-medium tracking-[0.6px] uppercase rounded-[9999px]">
                    {listing.category}
                  </span>
                </div>
              </div>

              <div className="p-[16px] flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-[24px] h-[24px] rounded-full bg-[#dbe3ed] flex items-center justify-center text-[10px]">
                      🏢
                    </div>
                    <span className="text-[12px] font-medium text-[#3f4940] truncate max-w-[120px]">
                      {listing.donorId?.donorProfile?.name || "Unknown Donor"}
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-[#3f4940] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    2.5 mi
                  </span>
                </div>
                
                <h3 className="text-[24px] font-heading font-semibold text-[#151c23] leading-[30px] mt-1 line-clamp-2">
                  {listing.foodName}
                </h3>

                <div className="mt-auto pt-[16px] flex flex-col gap-[12px]">
                  <div className="flex flex-col gap-[4px]">
                    <div className="flex justify-between items-center h-[12px]">
                      <span className="text-[12px] font-medium text-[#3f4940]">Pickup Window</span>
                      <span className="text-[12px] font-semibold text-[#b1241a]">
                        Ends in 45m
                      </span>
                    </div>
                    <div className="h-[6px] w-full bg-[#dbe3ed] rounded-[9999px] overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-0 bg-[#b1241a] w-[75%] rounded-[9999px]"></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(listing._id)}
                    className="w-full py-[10px] bg-[#fea520] hover:bg-[#e6951c] text-[#694000] font-semibold text-[14px] rounded-[8px] transition-all flex justify-center items-center gap-[8px]"
                  >
                    Reserve
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

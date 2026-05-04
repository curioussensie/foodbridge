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
    <div className="p-6 lg:p-10 space-y-10">
      {/* Header & Filters */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Browse Donations
            </h1>
            <p className="text-slate-500 mt-1">
              Find and claim available food in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="flex-1 md:w-56">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium"
              >
                <option value="">All Categories</option>
                <option value="Bakery">Bakery & Pastries</option>
                <option value="Produce">Fresh Produce</option>
                <option value="Prepared Meals">Prepared Meals</option>
                <option value="Groceries">Groceries</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex-1 md:w-72">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Search Food or Donor
              </label>
              <div className="relative">
                <svg
                  className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g., Bread, Hope Cafe..."
                  className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center p-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No food found</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            We couldn't find any available food matching your criteria. Check
            back later or try different filters.
          </p>
          {(categoryFilter || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter("");
                setSearchQuery("");
              }}
              className="mt-8 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {listing.photoUrl ? (
                <div className="h-52 bg-slate-200 w-full overflow-hidden relative">
                  <img
                    src={listing.photoUrl}
                    alt={listing.foodName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue-600 rounded-lg uppercase tracking-wider shadow-sm">
                      {listing.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-52 bg-slate-50 w-full flex items-center justify-center text-slate-200 relative">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white text-[10px] font-bold text-blue-600 rounded-lg uppercase tracking-wider shadow-sm">
                      {listing.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1 mb-1">
                  {listing.foodName}
                </h3>
                <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  {listing.quantity} • By{" "}
                  <span className="font-bold text-slate-700">
                    {listing.donorId?.donorProfile?.name || "Unknown"}
                  </span>
                </p>

                <div className="mt-auto space-y-5">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <div className="text-[10px] font-bold text-blue-800/60 mb-2 flex items-center uppercase tracking-widest">
                      <svg
                        className="w-3.5 h-3.5 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Pickup Window
                    </div>
                    <div className="text-sm text-blue-900 font-bold">
                      {new Date(listing.pickupStartTime).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                      )}{" "}
                      -{" "}
                      {new Date(listing.pickupEndTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-[11px] text-blue-600/70 font-medium mt-0.5">
                      {new Date(listing.pickupStartTime).toLocaleDateString(
                        [],
                        { dateStyle: "medium" },
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(listing._id)}
                    className="w-full h-12 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/5 hover:shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    Claim Donation
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

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
      result = result.filter((l) => 
        l.foodName.toLowerCase().includes(q) || 
        (l.donorId?.donorProfile?.name || "").toLowerCase().includes(q)
      );
    }
    setFilteredListings(result);
  }, [categoryFilter, searchQuery, listings]);

  const handleClaim = async (id: string) => {
    if (!window.confirm("Are you sure you want to claim this food? Make sure you can pick it up within the stated window.")) return;
    
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
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Filters */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Browse Donations</h1>
              <p className="text-slate-500 mt-1">Find and claim available food in your area.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-48">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Bakery">Bakery & Pastries</option>
                  <option value="Produce">Fresh Produce</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex-1 md:w-64">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search Food or Donor</label>
                <div className="relative">
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="E.g., Bread, Hope Cafe..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center p-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
            {error}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">No food found</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">We couldn't find any available food matching your criteria. Please try adjusting your filters or check back later.</p>
            {(categoryFilter || searchQuery) && (
              <button 
                onClick={() => { setCategoryFilter(""); setSearchQuery(""); }}
                className="mt-6 text-amber-500 font-medium hover:text-amber-600 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                {listing.photoUrl ? (
                  <div className="h-48 bg-slate-200 w-full overflow-hidden">
                    <img src={listing.photoUrl} alt={listing.foodName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-48 bg-slate-100 w-full flex items-center justify-center text-slate-300">
                    <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-1">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{listing.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{listing.foodName}</h3>
                  <p className="text-sm text-slate-600 mb-4">{listing.quantity} • By <span className="font-medium text-slate-700">{listing.donorId?.donorProfile?.name || "Unknown Donor"}</span></p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <div className="text-xs font-semibold text-amber-800 mb-1 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pickup Window
                      </div>
                      <div className="text-sm text-amber-900/80 font-medium">
                        {new Date(listing.pickupStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(listing.pickupEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">
                        {new Date(listing.pickupStartTime).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClaim(listing._id)}
                      className="w-full flex items-center justify-center py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none"
                    >
                      Claim Food
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

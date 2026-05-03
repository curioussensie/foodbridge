"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DonorDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchListings() {
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
    fetchListings();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Donor Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your surplus food listings and track your impact.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/donor/post-listing"
              className="inline-flex items-center justify-center min-h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none shadow-md shadow-amber-500/20"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Listing
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Your Listings</h2>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
              {error}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800">No listings yet</h3>
              <p className="text-slate-500 mt-1 mb-6">Start sharing your surplus food with the community today.</p>
              <Link href="/donor/post-listing" className="text-amber-500 font-medium hover:text-amber-600">
                Create your first listing &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {listing.photoUrl ? (
                    <div className="h-48 bg-slate-200 w-full">
                      <img src={listing.photoUrl} alt={listing.foodName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 bg-slate-100 w-full flex items-center justify-center text-slate-400">
                      <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{listing.foodName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        listing.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        listing.status === 'claimed' ? 'bg-blue-100 text-blue-700' :
                        listing.status === 'collected' ? 'bg-slate-100 text-slate-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{listing.quantity} • {listing.category}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                        <div className="font-medium text-slate-800 mb-1">Pickup Window:</div>
                        <div>{new Date(listing.pickupStartTime).toLocaleString()}</div>
                        <div>{new Date(listing.pickupEndTime).toLocaleString()}</div>
                      </div>
                      
                      {listing.status === "available" && (
                        <div className="flex gap-2 pt-2">
                          <Link 
                            href={`/donor/edit-listing/${listing._id}`}
                            className="flex-1 flex items-center justify-center min-h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

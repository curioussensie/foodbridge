"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClaimConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListingDetails() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load listing details");
        }
        const data = await res.json();
        
        // Ensure this listing actually belongs to this recipient
        // If the backend didn't populate donorId with full profile, it means unauthorized or not claimed by them
        if (!data.listing.donorId?.donorProfile?.contact) {
          throw new Error("You do not have permission to view this donor's details.");
        }
        
        setListing(data.listing);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchListingDetails();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Oops!</h2>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={() => router.push("/recipient/browse")}
            className="inline-block w-full min-h-12 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Claim Successful!</h1>
            <p className="text-lg text-slate-600">
              You have successfully claimed <span className="font-semibold text-emerald-700">{listing.quantity} of {listing.foodName}</span>.
            </p>
            <p className="text-slate-500 mt-2">The donor has been notified. Please pick up the food within the pickup window below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Donor Details Card */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center mb-4 text-amber-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="font-bold">Donor Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-amber-700/70 uppercase">Donor</div>
                  <div className="text-slate-800 font-medium">{listing.donorId.donorProfile.name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-700/70 uppercase">Pickup Address</div>
                  <div className="text-slate-800">{listing.donorId.donorProfile.address}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-700/70 uppercase">Contact</div>
                  <div className="text-slate-800">{listing.donorId.donorProfile.contact}</div>
                  <div className="text-slate-600 text-sm mt-0.5">{listing.donorId.email}</div>
                </div>
              </div>
            </div>

            {/* Pickup Details Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center mb-4 text-slate-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold">Pickup Window</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-sm font-semibold text-slate-500 mb-1">From</div>
                  <div className="text-slate-800 font-medium">
                    {new Date(listing.pickupStartTime).toLocaleDateString()} at {new Date(listing.pickupStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-sm font-semibold text-slate-500 mb-1">Until</div>
                  <div className="text-slate-800 font-medium">
                    {new Date(listing.pickupEndTime).toLocaleDateString()} at {new Date(listing.pickupEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link 
            href="/recipient/browse"
            className="flex items-center justify-center w-full min-h-14 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    </div>
  );
}

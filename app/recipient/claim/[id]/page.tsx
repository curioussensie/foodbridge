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
    <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-40 bg-linear-to-b from-blue-50/50 to-transparent"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Claim Confirmed!</h1>
            <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
              You've successfully reserved <span className="font-bold text-slate-700">{listing.quantity} of {listing.foodName}</span>. The donor has been notified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Donor Information */}
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 relative group overflow-hidden transition-all hover:bg-white hover:shadow-lg hover:border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Donor Information</h3>
              </div>
              <div className="space-y-5 relative z-10">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Donor Name</div>
                  <div className="text-slate-800 font-bold">{listing.donorId.donorProfile.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collection Address</div>
                  <div className="text-slate-600 font-medium text-sm leading-relaxed">{listing.donorId.donorProfile.address}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Person</div>
                  <div className="text-slate-800 font-bold">{listing.donorId.donorProfile.contact}</div>
                  <div className="text-blue-600 text-xs font-bold mt-1">{listing.donorId.email}</div>
                </div>
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />
            </div>

            {/* Collection Window */}
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 relative group overflow-hidden transition-all hover:bg-white hover:shadow-lg hover:border-amber-100">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Collection Window</h3>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="bg-white/60 p-5 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrive after</div>
                  <div className="text-slate-800 font-bold text-center">
                    {new Date(listing.pickupStartTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(listing.pickupStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="bg-white/60 p-5 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrive before</div>
                  <div className="text-slate-800 font-bold text-center">
                    {new Date(listing.pickupEndTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(listing.pickupEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/recipient/browse"
              className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              Browse More Donations
            </Link>
            <Link 
              href="/recipient/claims"
              className="flex-1 h-14 bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 font-bold rounded-2xl transition-all flex items-center justify-center"
            >
              View My History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

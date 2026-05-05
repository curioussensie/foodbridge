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
      <div className="min-h-screen bg-[#f7f9ff] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006a34]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] flex flex-col items-center justify-center p-4 font-['Inter']">
        <div className="bg-white max-w-md w-full p-8 rounded-[16px] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] border border-[#dbe3ed] text-center space-y-6">
          <div className="w-16 h-16 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Oops!</h2>
          <p className="text-[#6f7a6f]">{error}</p>
          <button
            onClick={() => router.push("/recipient/browse")}
            className="inline-block w-full min-h-[48px] flex items-center justify-center bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-10 font-['Inter']">
      {/* Hero Section */}
      <div className="bg-white rounded-[16px] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] border border-[#dbe3ed] overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgba(38,133,73,0.05)] to-transparent"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="w-20 h-20 bg-[rgba(38,133,73,0.1)] text-[#006a34] rounded-[12px] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-[32px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] tracking-tight mb-3">Claim Confirmed!</h1>
            <p className="text-[14px] text-[#6f7a6f] max-w-lg mx-auto leading-relaxed">
              You've successfully reserved <span className="font-semibold text-[#151c23]">{listing.quantity} of {listing.foodName}</span>. The donor has been notified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Donor Information */}
            <div className="bg-[#f7f9ff] rounded-[12px] p-6 border border-[#dbe3ed] relative group overflow-hidden transition-all hover:bg-white hover:shadow-[0px_8px_20px_rgba(0,106,52,0.08)]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-[#006a34] text-white rounded-[8px] flex items-center justify-center shadow-[0px_4px_10px_rgba(0,106,52,0.15)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                 </div>
                 <h3 className="text-[16px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Donor Information</h3>
              </div>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="text-[10px] font-bold text-[#8a968a] uppercase tracking-widest mb-1">Donor Name</div>
                  <div className="text-[#151c23] font-semibold text-[14px]">{listing.donorId.donorProfile.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#8a968a] uppercase tracking-widest mb-1">Collection Address</div>
                  <div className="text-[#3f4940] font-medium text-[14px] leading-relaxed">{listing.donorId.donorProfile.address}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#8a968a] uppercase tracking-widest mb-1">Contact Person</div>
                  <div className="text-[#151c23] font-semibold text-[14px]">{listing.donorId.donorProfile.contact}</div>
                  <div className="text-[#006a34] text-[12px] font-semibold mt-1">{listing.donorId.email}</div>
                </div>
              </div>
            </div>

            {/* Collection Window */}
            <div className="bg-[#f7f9ff] rounded-[12px] p-6 border border-[#dbe3ed] relative group overflow-hidden transition-all hover:bg-white hover:shadow-[0px_8px_20px_rgba(0,106,52,0.08)]">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-[rgba(254,165,32,0.2)] text-[#865300] rounded-[8px] flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <h3 className="text-[16px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Collection Window</h3>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="bg-white p-4 rounded-[8px] border border-[#dbe3ed] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-[#8a968a] uppercase tracking-widest mb-1">Arrive after</div>
                  <div className="text-[#151c23] font-semibold text-center text-[14px]">
                    {new Date(listing.pickupStartTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(listing.pickupStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-[#dbe3ed] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-[#8a968a] uppercase tracking-widest mb-1">Arrive before</div>
                  <div className="text-[#151c23] font-semibold text-center text-[14px]">
                    {new Date(listing.pickupEndTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(listing.pickupEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/recipient/browse"
              className="flex-1 h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)] flex items-center justify-center gap-2 text-[14px]"
            >
              Browse More Donations
            </Link>
            <Link 
              href="/recipient/claims"
              className="flex-1 h-[48px] bg-white hover:bg-[#f7f9ff] text-[#3f4940] border border-[#dbe3ed] font-semibold rounded-[8px] transition-colors flex items-center justify-center text-[14px]"
            >
              View My History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

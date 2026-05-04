"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RecipientOverviewPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, collected: 0 });
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/recipient/claims");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load claims");
        }
        const data = await res.json();
        setClaims(data.claims);
        
        const pending = data.claims.filter((c: any) => c.status === "claimed").length;
        const collected = data.claims.filter((c: any) => c.status === "collected").length;
        setStats({ total: data.claims.length, pending, collected });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeClaims = claims.filter(c => c.status === "claimed");

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">NGO Overview</h1>
          <p className="text-slate-500 mt-1">Track your claims and manage food collection.</p>
        </div>
        <Link href="/recipient/browse" className="inline-flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Browse Available Food
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Food Rescued</div>
          <div className="text-4xl font-extrabold text-blue-600">{stats.collected}</div>
          <div className="text-xs text-slate-400 mt-1">Completed pick-ups</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ring-2 ring-amber-500/10">
          <div className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-2">Pending Pickups</div>
          <div className="text-4xl font-extrabold text-amber-500">{stats.pending}</div>
          <div className="text-xs text-slate-400 mt-1">Claimed items awaiting collection</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Engagement</div>
          <div className="text-4xl font-extrabold text-slate-800">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1">Overall lifetime claims</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Claims Peek */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Active Claims</h2>
              <Link href="/recipient/claims" className="text-sm font-bold text-blue-600 hover:underline">View All History</Link>
           </div>
           
           {activeClaims.length === 0 ? (
             <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                   </svg>
                </div>
                <p className="text-slate-400 font-medium">You have no active claims.</p>
                <Link href="/recipient/browse" className="text-blue-600 text-sm font-bold mt-2 inline-block">Browse donations &rarr;</Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeClaims.map((claim: any) => (
                  <div key={claim._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">Claimed</div>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(claim.claimedAt || claim.updatedAt).toLocaleDateString()}</span>
                     </div>
                     <h3 className="text-lg font-bold text-slate-800 mb-1">{claim.foodName}</h3>
                     <p className="text-sm text-slate-500 mb-4">{claim.quantity}</p>
                     
                     <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           </div>
                           <div className="text-xs text-slate-600 font-medium line-clamp-1">{claim.donorId?.donorProfile?.address}</div>
                        </div>
                        <Link href={`/recipient/claim/${claim._id}`} className="w-full h-10 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs flex items-center justify-center transition-all">
                           View Details & Directions
                        </Link>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <h3 className="text-xl font-bold mb-4 relative z-10">Food Safety Notice</h3>
              <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">Please ensure you have adequate transport and storage for temperature-sensitive items. Always check the food quality upon collection.</p>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
           </div>

           <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Collection Process</h3>
             <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">Claim a donation that matches your needs.</p>
                </div>
                <div className="flex gap-4">
                   <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">Arrive within the specified pickup window.</p>
                </div>
                <div className="flex gap-4">
                   <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">Confirm collection and leave a rating for the donor.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

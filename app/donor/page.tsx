"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildMonthSlots(
  trend: { _id: { year: number; month: number }; count: number }[],
) {
  const now = new Date();
  const slots = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = trend.find(
      (t) => t._id.year === year && t._id.month === month,
    );
    slots.push({
      label: MONTH_NAMES[month - 1],
      count: found ? found.count : 0,
    });
  }
  return slots;
}

export default function DonorOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadStats() {
      try {
        const statsRes = await fetch("/api/donor/stats");
        if (statsRes.status === 401 || statsRes.status === 403) {
          router.push("/login");
          return;
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          throw new Error("Failed to load statistics");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [router]);

  const chartSlots = stats ? buildMonthSlots(stats.monthlyTrend || []) : [];
  const chartMax = Math.max(...chartSlots.map((s) => s.count), 1);

  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
      </div>
    );
  }

  const totalPosted = stats ? (stats.counts.available + stats.counts.claimed + stats.counts.collected + stats.counts.cancelled) : 0;
  const itemsClaimed = stats ? (stats.counts.claimed + stats.counts.collected) : 0;
  const recoveryRate = totalPosted > 0 ? Math.round((itemsClaimed / totalPosted) * 100) : 0;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-[7px]">
          <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[32px] leading-[41.6px]">
            Donor Overview
          </h1>
          <p className="font-['Inter'] font-normal text-[#3f4940] text-[18px] leading-[28.8px]">
            Track your impact and platform activity at a glance.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/donor/listings" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#dbe3ed] text-[#3f4940] font-semibold rounded-[8px] hover:bg-[#f7f9ff] transition-all shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
            View My Listings
          </Link>
        <Link href="/donor/post-listing" className="inline-flex items-center gap-2 px-6 py-3 bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[14px] whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post New Donation
        </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        {/* Overview Cards (Col span 4) */}
        <div className="md:col-span-4 flex flex-col gap-5">
          {/* Items Posted */}
          <div className="bg-white border border-[#dbe3ed] drop-shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[16px] p-[25px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[rgba(38,133,73,0.2)] rounded-[12px] size-[48px] flex items-center justify-center">
                 <svg className="w-6 h-6 text-[#006a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
            </div>
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mb-1">Total Posted</h3>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[48px] leading-[57.6px]">
              {totalPosted}
            </div>
            <div className="font-['Inter'] font-medium text-[#6f7a6f] text-[12px] mt-2">Overall history</div>
          </div>

          {/* Items Claimed */}
          <div className="bg-white border border-[#dbe3ed] drop-shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[16px] p-[25px] flex flex-col">
            <div className="flex items-start mb-4">
              <div className="bg-[rgba(254,165,32,0.2)] rounded-[12px] size-[48px] flex items-center justify-center">
                 <svg className="w-6 h-6 text-[#694000]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mb-1">Items Claimed</h3>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[48px] leading-[57.6px]">
              {itemsClaimed}
            </div>
            <div className="font-['Inter'] font-medium text-[#6f7a6f] text-[12px] mt-2">{recoveryRate}% recovery rate</div>
          </div>
        </div>

        {/* Secondary Stats & Quick Actions (Col span 8) */}
        <div className="md:col-span-8 flex flex-col gap-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="bg-white p-6 rounded-[16px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] ring-2 ring-[rgba(38,133,73,0.1)]">
               <div className="text-[#006a34] text-[12px] font-bold uppercase tracking-widest mb-2">Food Rescued</div>
               <div className="text-4xl font-['Plus_Jakarta_Sans'] font-extrabold text-[#006a34]">{stats?.counts.collected || 0}</div>
               <div className="text-xs font-['Inter'] text-[#6f7a6f] mt-1">Lifetime collections</div>
             </div>
             
             <div className="bg-white p-6 rounded-[16px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)]">
               <div className="text-[#3f4940] text-[12px] font-bold uppercase tracking-widest mb-2">Active Listings</div>
               <div className="text-4xl font-['Plus_Jakarta_Sans'] font-extrabold text-[#151c23]">{stats?.counts.available || 0}</div>
               <div className="text-xs font-['Inter'] text-[#6f7a6f] mt-1">Available for NGOs</div>
             </div>
           </div>

           {/* Graph Card */}
           <div className="bg-white border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[16px] relative h-[300px] overflow-hidden flex flex-col flex-1">
             <div className="p-6 flex justify-between items-center z-10">
               <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[20px]">Monthly Rescue Trend</h2>
             </div>
             
             <div className="flex-1 relative mx-6 mb-8 flex items-end pt-4 pb-2 border-b border-[#dbe3ed]">
               <div className="flex-1 flex justify-around items-end h-[180px]">
                 {chartSlots.map((slot, i) => {
                   const barHeightPct = slot.count === 0 ? 5 : Math.max((slot.count / chartMax) * 100, 10);
                   return (
                     <div key={i} className="flex flex-col items-center gap-2 group w-full px-2">
                       <div className="w-full max-w-[40px] bg-[rgba(38,133,73,0.2)] rounded-t-[6px] relative transition-all duration-300 group-hover:bg-[#006a34]" style={{ height: `${barHeightPct}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#151c23] text-white text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                            {slot.count}
                          </div>
                       </div>
                       <span className="font-['Inter'] font-semibold text-[#6f7a6f] text-[12px] uppercase">{slot.label}</span>
                     </div>
                   );
                 })}
               </div>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}


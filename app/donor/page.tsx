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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Donor Overview</h1>
          <p className="text-slate-500 mt-1">Track your impact and platform activity at a glance.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/donor/listings" className="inline-flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            View My Listings
          </Link>
          <Link href="/donor/post-listing" className="inline-flex items-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Post New Donation
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Food Rescued</div>
            <div className="text-4xl font-extrabold text-emerald-600">{stats.counts.collected}</div>
            <div className="text-xs text-slate-400 mt-1">Lifetime collections</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Active Listings</div>
            <div className="text-4xl font-extrabold text-amber-500">{stats.counts.available}</div>
            <div className="text-xs text-slate-400 mt-1">Available for NGOs</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ring-2 ring-blue-500/10">
            <div className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2">Pending Pickups</div>
            <div className="text-4xl font-extrabold text-blue-500">{stats.counts.claimed}</div>
            <div className="text-xs text-slate-400 mt-1">Claimed by recipients</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Posted</div>
            <div className="text-4xl font-extrabold text-slate-800">
              {stats.counts.available + stats.counts.claimed + stats.counts.collected + stats.counts.cancelled}
            </div>
            <div className="text-xs text-slate-400 mt-1">Overall history</div>
          </div>
        </div>
      )}

      {/* Analytics & Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-2">Monthly Rescue Trend</h3>
              <p className="text-slate-400 text-sm">Visualizing your donation impact over the last 6 months.</p>
            </div>
            
            <div className="flex-1 flex items-end gap-4 min-h-[200px] mb-8">
              {chartSlots.map((slot, i) => {
                const barHeightPx = slot.count === 0 ? 6 : Math.max((slot.count / chartMax) * 180, 20);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                    <div className="relative w-full flex flex-col items-center">
                       {slot.count > 0 && (
                         <span className="text-xs font-bold text-amber-500 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                           {slot.count}
                         </span>
                       )}
                       <div 
                         className="w-full max-w-[40px] rounded-t-xl transition-all duration-700 bg-amber-500/20 group-hover/bar:bg-amber-500"
                         style={{ height: `${barHeightPx}px` }}
                       />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{slot.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-8 border-t border-slate-800">
              <div className="flex items-center justify-between">
                 <p className="text-slate-400 text-sm">
                   You've maintained a <span className="text-white font-bold">consistent contribution</span> this quarter.
                 </p>
                 <Link href="/donor/listings" className="text-amber-500 font-bold text-sm hover:underline">View Detailed History &rarr;</Link>
              </div>
            </div>
          </div>
          {/* Decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] group-hover:bg-amber-500/10 transition-all duration-1000" />
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                 <Link href="/donor/post-listing" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div>
                       <div className="font-bold text-slate-800">New Donation</div>
                       <div className="text-xs text-slate-400">Post surplus food items</div>
                    </div>
                 </Link>
                 <Link href="/donor/listings" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                       <div className="font-bold text-slate-800">Manage Listings</div>
                       <div className="text-xs text-slate-400">Track pending pickups</div>
                    </div>
                 </Link>
              </div>
           </div>

           <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
              <div className="w-12 h-12 bg-white text-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Did you know?</h3>
              <p className="text-emerald-700/70 text-sm leading-relaxed">
                 Adding a clear photo to your donation increases the pickup rate by <span className="font-bold text-emerald-900">45%</span>. It helps NGOs identify the best use for the items.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

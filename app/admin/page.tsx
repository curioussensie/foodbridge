"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users?status=pending"),
        ]);

        if (statsRes.status === 401 || statsRes.status === 403) {
          router.push("/login");
          return;
        }

        if (statsRes.ok && pendingRes.ok) {
          const statsData = await statsRes.json();
          const pendingData = await pendingRes.json();
          setStats(statsData);
          setPendingUsers(pendingData.users);
        }
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 mt-1">Platform health and operational quick links.</p>
        </div>
        <div className="text-sm font-medium text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Users</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-extrabold text-slate-800">{stats?.users?.active || 0}</div>
            <div className="text-emerald-500 text-sm font-bold flex items-center gap-1 mb-1">
              Total: {stats?.users?.total || 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ring-2 ring-amber-500/20">
          <div className="text-amber-600 text-sm font-semibold uppercase tracking-wider mb-2">Pending Approvals</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-extrabold text-amber-500">{pendingUsers.length}</div>
            <Link href="/admin/pending" className="text-amber-600 text-xs font-bold hover:underline mb-1">
              View Queue &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Listings</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-extrabold text-slate-800">{stats?.listings?.available || 0}</div>
            <div className="text-blue-500 text-sm font-bold flex items-center gap-1 mb-1">
              +{stats?.listings?.claimed || 0} pending
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Food Rescued</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-extrabold text-emerald-600">{stats?.listings?.collected || 0}</div>
            <div className="text-slate-400 text-xs font-medium mb-1 italic">
              Lifetime total
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Queue Peek */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Registration Queue</h2>
            <Link href="/admin/pending" className="text-sm font-semibold text-amber-500 hover:text-amber-600">
              See all
            </Link>
          </div>
          <div className="flex-1">
            {pendingUsers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>No new applications pending review.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pendingUsers.slice(0, 5).map((user: any) => (
                  <div key={user._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${user.role === "Donor" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                        {user.role === "Donor" ? "D" : "R"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[200px]">
                          {user.role === "Donor" ? user.donorProfile?.restaurantName : user.ngoProfile?.orgName}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{user.email}</div>
                      </div>
                    </div>
                    <Link 
                      href="/admin/pending"
                      className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Category Management</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-[240px]">Update available food types for donors and refine classification.</p>
              <Link href="/admin/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20">
                Manage Categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            {/* Abstract Background Shape */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Link href="/admin/users" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-300 transition-all group">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="font-bold text-slate-800">User List</div>
                <div className="text-xs text-slate-400 mt-1">Manage existing accounts</div>
             </Link>
             
             <Link href="/admin/listings" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-300 transition-all group">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="font-bold text-slate-800">Moderation</div>
                <div className="text-xs text-slate-400 mt-1">Remove inappropriate posts</div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

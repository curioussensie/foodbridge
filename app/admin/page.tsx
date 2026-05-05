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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 md:p-8 flex flex-col gap-[32px]">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-[7px] max-w-[468px]">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[48px] leading-[57.6px]">
            Admin Overview
          </h1>
          <p className="font-['Inter'] text-[#3f4940] text-[18px] leading-[28.8px]">
            Platform health and operational quick links.
          </p>
        </div>
        <div className="font-['Inter'] font-semibold text-[#6f7a6f] text-[14px]">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Stat Card 1: Active Users */}
        <div className="bg-white border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between h-[180px]">
          <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[12px] tracking-[0.7px] uppercase mt-2">Active Users</h3>
          <div className="flex flex-col gap-1">
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[40px] leading-none">
              {stats?.users?.active || 0}
            </div>
            <div className="font-['Inter'] font-semibold text-[#006a34] text-[14px]">
              Total: {stats?.users?.total || 0}
            </div>
          </div>
        </div>

        {/* Stat Card 2: Pending Approvals */}
        <div className="bg-white border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between h-[180px] ring-2 ring-[rgba(254,165,32,0.2)] relative overflow-hidden">
          <div className="absolute bg-[rgba(254,165,32,0.1)] blur-[20px] right-[-24px] top-[-24px] size-[100px] rounded-full" />
          <h3 className="font-['Inter'] font-semibold text-[#694000] text-[12px] tracking-[0.7px] uppercase mt-2 relative z-10">Pending Approvals</h3>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#fea520] text-[40px] leading-none">
              {pendingUsers.length}
            </div>
            <Link href="/admin/pending" className="font-['Inter'] font-semibold text-[#694000] text-[14px] hover:underline">
              View Queue &rarr;
            </Link>
          </div>
        </div>

        {/* Stat Card 3: Active Listings */}
        <div className="bg-white border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between h-[180px]">
          <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[12px] tracking-[0.7px] uppercase mt-2">Active Listings</h3>
          <div className="flex flex-col gap-1">
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[40px] leading-none">
              {stats?.listings?.available || 0}
            </div>
            <div className="font-['Inter'] font-semibold text-[#006a34] text-[14px]">
              +{stats?.listings?.claimed || 0} pending
            </div>
          </div>
        </div>

        {/* Stat Card 4: Food Rescued */}
        <div className="bg-white border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between h-[180px] relative overflow-hidden">
          <div className="absolute bg-[rgba(38,133,73,0.1)] blur-[20px] right-[-24px] top-[-24px] size-[100px] rounded-full" />
          <h3 className="font-['Inter'] font-semibold text-[#006a34] text-[12px] tracking-[0.7px] uppercase mt-2 relative z-10">Food Rescued</h3>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#006a34] text-[40px] leading-none">
              {stats?.listings?.collected || 0}
            </div>
            <div className="font-['Inter'] text-[#6f7a6f] text-[14px]">
              Lifetime total
            </div>
          </div>
        </div>

        {/* Registration Queue Peek */}
        <div className="md:col-span-2 bg-white border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] flex flex-col h-[384px]">
          <div className="p-6 flex items-center justify-between border-b border-[#dbe3ed]">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[20px]">Registration Queue</h2>
            <Link href="/admin/pending" className="font-['Inter'] font-semibold text-[#006a34] text-[14px] hover:underline">
              See all
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {pendingUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6f7a6f] p-8 text-center">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-['Inter'] text-[14px]">No new applications pending review.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#dbe3ed]">
                {pendingUsers.slice(0, 5).map((user: any) => (
                  <div key={user._id} className="p-4 hover:bg-[#f7f9ff] transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold text-[14px] ${user.role === "Donor" ? "bg-[rgba(254,165,32,0.2)] text-[#694000]" : "bg-[rgba(38,133,73,0.2)] text-[#006a34]"}`}>
                        {user.role === "Donor" ? "D" : "R"}
                      </div>
                      <div>
                        <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px] truncate max-w-[120px] sm:max-w-[200px]">
                          {user.role === "Donor" ? user.donorProfile?.restaurantName : user.ngoProfile?.orgName}
                        </div>
                        <div className="font-['Inter'] text-[#6f7a6f] text-[12px] uppercase">{user.email}</div>
                      </div>
                    </div>
                    <Link 
                      href="/admin/pending"
                      className="px-4 py-2 bg-[#151c23] text-white font-['Inter'] font-semibold text-[12px] rounded-[6px] hover:bg-[#293139] transition-colors"
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
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-[#151c23] rounded-[12px] p-[32px] text-white relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="relative z-10">
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] mb-2">Category Management</h2>
              <p className="font-['Inter'] text-[rgba(255,255,255,0.7)] text-[14px] mb-6 max-w-[240px]">Update available food types for donors and refine classification.</p>
              <Link href="/admin/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-[#006a34] hover:bg-[#00552a] text-white font-['Inter'] font-semibold rounded-[8px] transition-colors">
                Manage Categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            {/* Abstract Background Shape */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[rgba(38,133,73,0.3)] rounded-full blur-[40px]" />
          </div>

          <div className="grid grid-cols-2 gap-5 h-[160px]">
             <Link href="/admin/users" className="bg-white p-6 rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] hover:border-[#006a34] transition-all flex flex-col justify-center items-center text-center group">
                <div className="w-12 h-12 bg-[#f7f9ff] text-[#006a34] rounded-[8px] flex items-center justify-center mb-3 group-hover:bg-[#006a34] group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">User List</div>
             </Link>
             
             <Link href="/admin/listings" className="bg-white p-6 rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] hover:border-[#006a34] transition-all flex flex-col justify-center items-center text-center group">
                <div className="w-12 h-12 bg-[#fdf5f4] text-[#b1241a] rounded-[8px] flex items-center justify-center mb-3 group-hover:bg-[#b1241a] group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">Moderation</div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

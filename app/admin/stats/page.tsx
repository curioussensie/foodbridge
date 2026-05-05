"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildSlots(trend: { _id: { year: number; month: number }; count: number }[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = trend.find((t) => t._id.year === year && t._id.month === month);
    return { label: MONTH_NAMES[month - 1], count: found ? found.count : 0 };
  });
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-5 text-center">
      <div className={`text-[32px] font-bold font-['Plus_Jakarta_Sans'] ${color}`}>{value}</div>
      <div className="text-[14px] text-[#6f7a6f] mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401 || res.status === 403) { router.push("/login"); return; }
        if (!res.ok) throw new Error("Failed to load stats.");
        setStats(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?month=${exportMonth}`);
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `foodbridge-report-${exportMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setExporting(false);
    }
  };

  const chartSlots = stats ? buildSlots(stats.monthlyTrend || []) : [];
  const chartMax = Math.max(...chartSlots.map((s) => s.count), 1);

  return (
    <div className="min-h-screen bg-transparent p-4 py-8 font-['Inter']">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgba(38,133,73,0.1)] rounded-[8px] flex items-center justify-center text-[#006a34]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Platform Impact Stats</h1>
              <p className="text-[#6f7a6f] text-[14px] mt-0.5">Live platform-wide metrics and monthly trend.</p>
            </div>
          </div>

          {/* US-A06: Export */}
          <div className="flex items-center gap-2">
            <label className="text-[14px] text-[#3f4940] font-medium whitespace-nowrap">Export month:</label>
            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="border border-[#dbe3ed] rounded-[8px] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] bg-white text-[#151c23]"
            />
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#006a34] hover:bg-[#00552a] text-white text-[14px] font-semibold rounded-[8px] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]" /></div>
        ) : error ? (
          <div className="p-4 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-[12px] border border-[#d43e30]/20">{error}</div>
        ) : stats && (
          <>
            {/* Users */}
            <section>
              <h2 className="text-[18px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-4">Users</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.users.total} color="text-[#151c23]" />
                <StatCard label="Active Users" value={stats.users.active} color="text-[#006a34]" />
                <StatCard label="Donors" value={stats.users.donors} color="text-[#694000]" />
                <StatCard label="NGO Recipients" value={stats.users.recipients} color="text-[#3f4940]" />
              </div>
            </section>

            {/* Listings */}
            <section>
              <h2 className="text-[18px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-4">Listings</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Donations Rescued" value={stats.listings.collected} color="text-[#006a34]" />
                <StatCard label="Active" value={stats.listings.available} color="text-[#694000]" />
                <StatCard label="Pending Pickup" value={stats.listings.claimed} color="text-[#865300]" />
                <StatCard label="Cancelled" value={stats.listings.cancelled} color="text-[#b1241a]" />
                <StatCard label="Removed" value={stats.listings.removed} color="text-[#d43e30]" />
              </div>
            </section>

            {/* Monthly trend chart */}
            <section>
              <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-6">
                <h2 className="text-[16px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-6">Monthly Donations Rescued (Last 6 Months)</h2>
                <div className="flex items-end gap-3" style={{ height: "128px" }}>
                  {chartSlots.map((slot, i) => {
                    const barHeightPx = slot.count === 0 ? 4 : Math.max((slot.count / chartMax) * 104, 12);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-[#6f7a6f]" style={{ minHeight: "16px" }}>
                          {slot.count > 0 ? slot.count : ""}
                        </span>
                        <div
                          className="w-full rounded-t-[4px] transition-all duration-500"
                          style={{ height: `${barHeightPx}px`, backgroundColor: slot.count === 0 ? "#f7f9ff" : "#006a34" }}
                        />
                        <span className="text-[12px] text-[#8a968a] font-medium">{slot.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

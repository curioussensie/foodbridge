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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
      <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
      <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
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
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Platform Impact Stats</h1>
              <p className="text-slate-500 text-sm mt-0.5">Live platform-wide metrics and monthly trend.</p>
            </div>
          </div>

          {/* US-A06: Export */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500 font-medium whitespace-nowrap">Export month:</label>
            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" /></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
        ) : stats && (
          <>
            {/* Users */}
            <section>
              <h2 className="text-lg font-bold text-slate-700 mb-3">Users</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.users.total} color="text-slate-800" />
                <StatCard label="Active Users" value={stats.users.active} color="text-emerald-600" />
                <StatCard label="Donors" value={stats.users.donors} color="text-amber-500" />
                <StatCard label="NGO Recipients" value={stats.users.recipients} color="text-blue-500" />
              </div>
            </section>

            {/* Listings */}
            <section>
              <h2 className="text-lg font-bold text-slate-700 mb-3">Listings</h2>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Donations Rescued" value={stats.listings.collected} color="text-emerald-600" />
                <StatCard label="Active" value={stats.listings.available} color="text-amber-500" />
                <StatCard label="Pending Pickup" value={stats.listings.claimed} color="text-blue-500" />
                <StatCard label="Cancelled" value={stats.listings.cancelled} color="text-orange-500" />
                <StatCard label="Removed" value={stats.listings.removed} color="text-red-500" />
              </div>
            </section>

            {/* Monthly trend chart */}
            <section>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-700 mb-6">Monthly Donations Rescued (Last 6 Months)</h2>
                <div className="flex items-end gap-3" style={{ height: "128px" }}>
                  {chartSlots.map((slot, i) => {
                    const barHeightPx = slot.count === 0 ? 4 : Math.max((slot.count / chartMax) * 104, 12);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500" style={{ minHeight: "16px" }}>
                          {slot.count > 0 ? slot.count : ""}
                        </span>
                        <div
                          className="w-full rounded-t-lg transition-all duration-500"
                          style={{ height: `${barHeightPx}px`, backgroundColor: slot.count === 0 ? "#f1f5f9" : "#10b981" }}
                        />
                        <span className="text-xs text-slate-400 font-medium">{slot.label}</span>
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

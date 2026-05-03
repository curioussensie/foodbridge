"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserLog = {
  adminId: string;
  action: string;
  reason: string;
  timestamp: string;
};

type UserData = {
  _id: string;
  email: string;
  role: "Donor" | "Recipient" | "Admin";
  status: "pending" | "active" | "suspended" | "banned" | "rejected";
  createdAt: string;
  adminLogs?: UserLog[];
  donorProfile?: {
    restaurantName: string;
    contact: string;
  };
  ngoProfile?: {
    orgName: string;
    phone: string;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [actionModal, setActionModal] = useState<{ userId: string; email: string; action: "suspend" | "ban" | "restore" } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch(`/api/admin/users`);
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load users.");
        const data = await res.json();
        // Exclude pending/rejected from this view, and exclude other admins
        const filtered = data.users.filter((u: UserData) => 
          u.role !== "Admin" && !["pending", "rejected"].includes(u.status)
        );
        setUsers(filtered);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [router]);

  const handleActionSubmit = async () => {
    if (!actionModal) return;
    if (actionModal.action !== "restore" && !actionReason.trim()) {
      setActionError("A reason is required.");
      return;
    }
    
    setProcessingId(actionModal.userId);
    try {
      const res = await fetch(`/api/admin/users/${actionModal.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionModal.action, reason: actionReason }),
      });
      if (!res.ok) throw new Error((await res.json()).error || `Failed to ${actionModal.action}.`);
      
      const newStatus = actionModal.action === "restore" ? "active" : actionModal.action === "suspend" ? "suspended" : "banned";
      
      setUsers((prev) => prev.map((u) => 
        u._id === actionModal.userId ? { ...u, status: newStatus as any } : u
      ));
      
      setActionModal(null);
      setActionReason("");
      setActionError("");
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const displayedUsers = filter === "all" ? users : users.filter(u => u.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Suspend, ban, or restore user accounts.</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["all", "active", "suspended", "banned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
        ) : displayedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <p className="text-slate-500 mt-1">No users found matching "{filter}".</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedUsers.map((user) => {
                    const name = user.role === "Donor" ? user.donorProfile?.restaurantName : user.ngoProfile?.orgName;
                    return (
                      <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{name || "—"}</div>
                          <div className="text-sm text-slate-500 mt-0.5">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.role === "Donor" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.status === "active" ? "bg-emerald-50 text-emerald-700" : user.status === "suspended" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {user.status === "active" ? (
                            <>
                              <button onClick={() => { setActionModal({ userId: user._id, email: user.email, action: "suspend" }); setActionReason(""); setActionError(""); }} className="text-xs font-semibold px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors">Suspend</button>
                              <button onClick={() => { setActionModal({ userId: user._id, email: user.email, action: "ban" }); setActionReason(""); setActionError(""); }} className="text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors">Ban</button>
                            </>
                          ) : (
                            <button onClick={() => { setActionModal({ userId: user._id, email: user.email, action: "restore" }); setActionReason(""); setActionError(""); }} className="text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors">Restore</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className={`text-lg font-bold mb-1 ${actionModal.action === "ban" ? "text-red-600" : actionModal.action === "suspend" ? "text-orange-600" : "text-emerald-600"}`}>
              {actionModal.action === "ban" ? "Permanently Ban User" : actionModal.action === "suspend" ? "Suspend User" : "Restore User Account"}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              You are about to <strong className="text-slate-700">{actionModal.action}</strong> <span className="font-medium text-slate-700">{actionModal.email}</span>.
              {actionModal.action === "suspend" && " They will not be able to log in, and their active listings will be hidden."}
              {actionModal.action === "ban" && " This is permanent. They will lose all access."}
              {actionModal.action === "restore" && " Their account and listings will be visible again."}
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Reason <span className={actionModal.action !== "restore" ? "text-red-500" : "text-slate-400 font-normal"}>( {actionModal.action !== "restore" ? "*" : "Optional"} )</span>
            </label>
            <textarea
              value={actionReason}
              onChange={(e) => { setActionReason(e.target.value); setActionError(""); }}
              rows={3}
              placeholder={`Reason for ${actionModal.action}...`}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
            {actionError && <p className="text-red-500 text-xs mt-1">{actionError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={processingId !== null}
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50 ${actionModal.action === "ban" ? "bg-red-500 hover:bg-red-600" : actionModal.action === "suspend" ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              >
                Confirm {actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="min-h-screen bg-transparent p-4 py-8 font-['Inter']">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgba(38,133,73,0.1)] rounded-[8px] flex items-center justify-center text-[#006a34]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">User Management</h1>
              <p className="text-[#6f7a6f] text-[14px] mt-0.5">Suspend, ban, or restore user accounts.</p>
            </div>
          </div>
          
          <div className="flex bg-[#f7f9ff] p-1 rounded-[8px] border border-[#dbe3ed]">
            {["all", "active", "suspended", "banned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-[14px] font-semibold rounded-[6px] capitalize transition-colors ${filter === f ? "bg-white text-[#151c23] shadow-sm" : "text-[#6f7a6f] hover:text-[#3f4940]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]" />
          </div>
        ) : error ? (
          <div className="p-4 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-[12px] border border-[#d43e30]/20">{error}</div>
        ) : displayedUsers.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-16 text-center">
            <p className="text-[#6f7a6f] text-[14px] mt-1">No users found matching "{filter}".</p>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f9ff] border-b border-[#dbe3ed] text-[12px] uppercase tracking-wider text-[#6f7a6f] font-semibold">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe3ed]">
                  {displayedUsers.map((user) => {
                    const name = user.role === "Donor" ? user.donorProfile?.restaurantName : user.ngoProfile?.orgName;
                    return (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#151c23] text-[14px]">{name || "—"}</div>
                          <div className="text-[12px] text-[#6f7a6f] mt-0.5">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-[4px] font-semibold uppercase tracking-wider ${user.role === "Donor" ? "bg-[rgba(254,165,32,0.2)] text-[#694000]" : "bg-[rgba(38,133,73,0.2)] text-[#006a34]"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[12px] px-2.5 py-1 rounded-full font-medium ${user.status === "active" ? "bg-[rgba(38,133,73,0.1)] text-[#006a34]" : user.status === "suspended" ? "bg-[rgba(254,165,32,0.1)] text-[#865300]" : "bg-[rgba(212,62,48,0.1)] text-[#b1241a]"}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {user.status === "active" ? (
                            <>
                              <button onClick={() => { setActionModal({ userId: user._id, email: user.email, action: "suspend" }); setActionReason(""); setActionError(""); }} className="text-[12px] font-semibold px-3 py-1.5 bg-[rgba(254,165,32,0.1)] text-[#865300] hover:bg-[rgba(254,165,32,0.2)] rounded-[6px] transition-colors">Suspend</button>
                              <button onClick={() => { setActionModal({ userId: user._id, email: user.email, action: "ban" }); setActionReason(""); setActionError(""); }} className="text-[12px] font-semibold px-3 py-1.5 bg-[rgba(212,62,48,0.1)] text-[#b1241a] hover:bg-[rgba(212,62,48,0.2)] rounded-[6px] transition-colors">Ban</button>
                            </>
                          ) : (
                            <button onClick={() => { setActionModal({ userId: user._id, email: user.email, action: "restore" }); setActionReason(""); setActionError(""); }} className="text-[12px] font-semibold px-3 py-1.5 bg-[rgba(38,133,73,0.1)] text-[#006a34] hover:bg-[rgba(38,133,73,0.2)] rounded-[6px] transition-colors">Restore</button>
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
        <div className="fixed inset-0 bg-[#151c23]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.1)] w-full max-w-md p-6">
            <h2 className={`text-[20px] font-bold font-['Plus_Jakarta_Sans'] mb-1 ${actionModal.action === "ban" ? "text-[#b1241a]" : actionModal.action === "suspend" ? "text-[#865300]" : "text-[#006a34]"}`}>
              {actionModal.action === "ban" ? "Permanently Ban User" : actionModal.action === "suspend" ? "Suspend User" : "Restore User Account"}
            </h2>
            <p className="text-[14px] text-[#6f7a6f] mb-4">
              You are about to <strong className="text-[#151c23]">{actionModal.action}</strong> <span className="font-medium text-[#151c23]">{actionModal.email}</span>.
              {actionModal.action === "suspend" && " They will not be able to log in, and their active listings will be hidden."}
              {actionModal.action === "ban" && " This is permanent. They will lose all access."}
              {actionModal.action === "restore" && " Their account and listings will be visible again."}
            </p>

            <label className="block text-[14px] font-medium text-[#3f4940] mb-1.5">
              Reason <span className={actionModal.action !== "restore" ? "text-[#b1241a]" : "text-[#8a968a] font-normal"}>( {actionModal.action !== "restore" ? "*" : "Optional"} )</span>
            </label>
            <textarea
              value={actionReason}
              onChange={(e) => { setActionReason(e.target.value); setActionError(""); }}
              rows={3}
              placeholder={`Reason for ${actionModal.action}...`}
              className="w-full border border-[#dbe3ed] rounded-[8px] px-4 py-3 text-[14px] text-[#151c23] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] resize-none"
            />
            {actionError && <p className="text-[#b1241a] text-[12px] mt-1">{actionError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 px-4 py-2.5 bg-[#f7f9ff] hover:bg-[#e7eff9] text-[#3f4940] font-semibold rounded-[8px] text-[14px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={processingId !== null}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-[8px] text-[14px] transition-colors disabled:opacity-50 ${actionModal.action === "ban" ? "bg-[#d43e30] hover:bg-[#b1241a]" : actionModal.action === "suspend" ? "bg-[#fea520] hover:bg-[#e5941c] text-[#694000]" : "bg-[#006a34] hover:bg-[#00552a]"}`}
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

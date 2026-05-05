"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PendingUser = {
  _id: string;
  email: string;
  role: "Donor" | "Recipient";
  createdAt: string;
  donorProfile?: {
    restaurantName: string;
    address: string;
    contact: string;
    foodType: string;
  };
  ngoProfile?: {
    orgName: string;
    contactPerson: string;
    phone: string;
    address: string;
  };
};

export default function AdminPendingPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    userId: string;
    email: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users?status=pending");
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load pending registrations.");
        const data = await res.json();
        setUsers(data.users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [router]);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to approve.");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setRejectError("A reason is required.");
      return;
    }
    if (!rejectModal) return;
    setProcessingId(rejectModal.userId);
    try {
      const res = await fetch(`/api/admin/users/${rejectModal.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to reject.");
      setUsers((prev) => prev.filter((u) => u._id !== rejectModal.userId));
      setRejectModal(null);
      setRejectReason("");
      setRejectError("");
    } catch (err: any) {
      setRejectError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 py-8 font-['Inter']">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[rgba(254,165,32,0.2)] rounded-[8px] flex items-center justify-center text-[#694000]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">
                Pending Registrations
              </h1>
              <p className="text-[#6f7a6f] text-[14px] mt-0.5">
                Review and approve or reject new account requests.
              </p>
            </div>
            {!loading && (
              <span className="ml-auto text-[12px] font-semibold bg-[rgba(254,165,32,0.2)] text-[#694000] px-3 py-1 rounded-[6px]">
                {users.length} pending
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]" />
          </div>
        ) : error ? (
          <div className="p-4 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-[12px] border border-[#d43e30]/20">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-16 text-center">
            <div className="w-14 h-14 bg-[rgba(38,133,73,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-[#006a34]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-[#151c23] font-['Plus_Jakarta_Sans']">
              All caught up!
            </h3>
            <p className="text-[#6f7a6f] mt-1 text-[14px]">
              No pending registrations to review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const profile =
                user.role === "Donor" ? user.donorProfile : user.ngoProfile;
              const name =
                user.role === "Donor"
                  ? user.donorProfile?.restaurantName
                  : user.ngoProfile?.orgName;
              const contact =
                user.role === "Donor"
                  ? user.donorProfile?.contact
                  : user.ngoProfile?.phone;
              const address =
                user.role === "Donor"
                  ? user.donorProfile?.address
                  : user.ngoProfile?.address;

              return (
                <div
                  key={user._id}
                  className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 font-bold text-[14px] font-['Plus_Jakarta_Sans'] ${user.role === "Donor" ? "bg-[rgba(254,165,32,0.2)] text-[#694000]" : "bg-[rgba(38,133,73,0.2)] text-[#006a34]"}`}
                        >
                          {user.role === "Donor" ? "D" : "R"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-[#151c23] font-['Plus_Jakarta_Sans'] text-[16px]">
                              {name || "—"}
                            </h3>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-[4px] font-semibold uppercase tracking-wider ${user.role === "Donor" ? "bg-[rgba(254,165,32,0.2)] text-[#694000]" : "bg-[rgba(38,133,73,0.2)] text-[#006a34]"}`}
                            >
                              {user.role === "Donor"
                                ? "Donor"
                                : "Recipient"}
                            </span>
                          </div>
                          <p className="text-[14px] text-[#6f7a6f] mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#6f7a6f] sm:text-right shrink-0">
                        Registered{" "}
                        {new Date(user.createdAt).toLocaleDateString([], {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>

                    {/* Profile Details */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 bg-[#f7f9ff] rounded-[8px] p-4 text-[14px] border border-[#dbe3ed]">
                      {address && (
                        <div className="flex gap-2 text-[#3f4940]">
                          <span className="text-[#6f7a6f] shrink-0 font-medium w-24">
                            Address
                          </span>
                          <span className="font-medium text-[#151c23]">
                            {address}
                          </span>
                        </div>
                      )}
                      {contact && (
                        <div className="flex gap-2 text-[#3f4940]">
                          <span className="text-[#6f7a6f] shrink-0 font-medium w-24">
                            Contact
                          </span>
                          <span className="font-medium text-[#151c23]">
                            {contact}
                          </span>
                        </div>
                      )}
                      {user.role === "Donor" && user.donorProfile?.foodType && (
                        <div className="flex gap-2 text-[#3f4940]">
                          <span className="text-[#6f7a6f] shrink-0 font-medium w-24">
                            Food Type
                          </span>
                          <span className="font-medium text-[#151c23]">
                            {user.donorProfile.foodType}
                          </span>
                        </div>
                      )}
                      {user.role === "Recipient" &&
                        user.ngoProfile?.contactPerson && (
                          <div className="flex gap-2 text-[#3f4940]">
                            <span className="text-[#6f7a6f] shrink-0 font-medium w-24">
                              Contact
                            </span>
                            <span className="font-medium text-[#151c23]">
                              {user.ngoProfile.contactPerson}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setRejectModal({
                            userId: user._id,
                            email: user.email,
                          });
                          setRejectReason("");
                          setRejectError("");
                        }}
                        disabled={processingId === user._id}
                        className="px-4 py-2 bg-[rgba(212,62,48,0.1)] hover:bg-[rgba(212,62,48,0.2)] text-[#b1241a] font-semibold rounded-[8px] text-[14px] transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(user._id)}
                        disabled={processingId === user._id}
                        className="px-4 py-2 bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] text-[14px] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === user._id ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-[#151c23]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.1)] w-full max-w-md p-6">
            <h2 className="text-[20px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-1">
              Reject Registration
            </h2>
            <p className="text-[14px] text-[#6f7a6f] mb-4">
              Rejecting{" "}
              <span className="font-medium text-[#151c23]">
                {rejectModal.email}
              </span>
              . They will see this reason when trying to log in.
            </p>

            <label className="block text-[14px] font-medium text-[#3f4940] mb-1.5">
              Reason <span className="text-[#b1241a]">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
              rows={3}
              placeholder="e.g. Incomplete information provided. Please re-register with a valid address."
              className="w-full border border-[#dbe3ed] rounded-[8px] px-4 py-3 text-[14px] text-[#151c23] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] resize-none"
            />
            {rejectError && (
              <p className="text-[#b1241a] text-[12px] mt-1">{rejectError}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 px-4 py-2.5 bg-[#f7f9ff] hover:bg-[#e7eff9] text-[#3f4940] font-semibold rounded-[8px] text-[14px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={processingId !== null}
                className="flex-1 px-4 py-2.5 bg-[#d43e30] hover:bg-[#b1241a] text-white font-semibold rounded-[8px] text-[14px] transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

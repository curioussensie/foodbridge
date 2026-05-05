"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  {
    name: "Overview",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: "Pending Approvals",
    href: "/admin/pending",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    badge: true,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    name: "Listing Moderation",
    href: "/admin/listings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: "Food Categories",
    href: "/admin/categories",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    name: "Impact Stats",
    href: "/admin/stats",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function checkPending() {
      try {
        const res = await fetch("/api/admin/users?status=pending");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.users.length);
        }
      } catch (e) {}
    }
    checkPending();
    // Refresh count occasionally
    const interval = setInterval(checkPending, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9ff] font-sans text-[#151c23]">
      {/* TopAppBar */}
      <header className="h-[64px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#268549] rounded-[8px] flex items-center justify-center text-[#f6fff3] font-heading font-bold text-sm shadow-[0px_4px_10px_rgba(0,106,52,0.1)]">
               V
             </div>
             <span className="text-[20px] font-heading font-bold text-[#15803d] tracking-tight">FoodBridge</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
           {pendingCount > 0 && (
              <Link href="/admin/pending" className="relative p-2 text-[#64748b] hover:text-[#15803d] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#b1241a] text-[10px] text-white font-bold rounded-full flex items-center justify-center border border-white">
                  {pendingCount}
                </span>
              </Link>
           )}
           <div className="w-8 h-8 rounded-full border border-[#becabd] overflow-hidden bg-slate-100 flex items-center justify-center">
             <span className="text-xs font-bold text-[#006a34]">A</span>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[256px] bg-[#f8f9fa] border-r border-[#e2e8f0] flex-col hidden lg:flex">
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="px-[16px]">
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between gap-[12px] px-[12px] py-[12px] transition-all ${
                      isActive
                        ? "bg-[#f0fdf4] border-r-4 border-[#15803d] text-[#15803d] rounded-bl-[8px] rounded-tl-[8px] -mr-[16px]"
                        : "text-[#64748b] hover:bg-slate-100 rounded-[8px]"
                    }`}
                  >
                    <div className="flex items-center gap-[12px]">
                      <span className={isActive ? "text-[#15803d]" : "text-[#64748b]"}>
                        {item.icon}
                      </span>
                      <span className={`font-heading ${isActive ? 'font-bold' : 'font-normal'} text-[14px]`}>{item.name}</span>
                    </div>
                    {item.badge && pendingCount > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-[#15803d] text-white" : "bg-[#fea520] text-[#694000]"
                      }`}>
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[#becabd]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-[12px] w-full px-[12px] py-[12px] text-[#64748b] hover:bg-slate-100 rounded-[8px] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-heading font-normal text-[14px]">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white border-b border-[#e2e8f0] p-4 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-heading font-bold text-[#15803d]">FoodBridge Admin</span>
            </Link>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

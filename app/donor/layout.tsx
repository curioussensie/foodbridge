"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  {
    name: "Overview",
    href: "/donor",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: "My Listings",
    href: "/donor/listings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: "Post Donation",
    href: "/donor/post-listing",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user from localStorage or just show "Donor"
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.email);
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isRegisterPage = pathname === "/donor/register";

  if (isRegisterPage) {
    return <div className="min-h-screen bg-[#f7f9ff]">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9ff] font-sans text-[#151c23]">
      {/* TopAppBar */}
      <header className="h-[64px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/donor" className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#268549] rounded-[8px] flex items-center justify-center text-[#f6fff3] font-heading font-bold text-sm shadow-[0px_4px_10px_rgba(0,106,52,0.1)]">
               V
             </div>
             <span className="text-[20px] font-heading font-bold text-[#15803d] tracking-tight">FoodBridge</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-full border border-[#becabd] overflow-hidden bg-slate-100 flex items-center justify-center">
             <span className="text-xs font-bold text-[#006a34]">
               {userName ? userName.charAt(0).toUpperCase() : "D"}
             </span>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[256px] bg-[#f8f9fa] border-r border-[#e2e8f0] flex-col hidden lg:flex">
          <nav className="flex-1 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="px-[16px]">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-[12px] px-[12px] py-[12px] transition-all ${
                      isActive
                        ? "bg-[#f0fdf4] border-r-4 border-[#15803d] text-[#15803d] rounded-bl-[8px] rounded-tl-[8px] -mr-[16px]"
                        : "text-[#64748b] hover:bg-slate-100 rounded-[8px]"
                    }`}
                  >
                    <span className={isActive ? "text-[#15803d]" : "text-[#64748b]"}>
                      {item.icon}
                    </span>
                    <span className={`font-heading ${isActive ? 'font-bold' : 'font-normal'} text-[14px]`}>{item.name}</span>
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[#becabd]">
            <div className="px-[16px] py-[12px] text-xs text-[#6f7a6f] mb-1 truncate">
              Logged in as {userName || "Donor"}
            </div>
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
            <Link href="/donor" className="flex items-center gap-2">
              <span className="font-heading font-bold text-[#15803d]">FoodBridge Donor</span>
            </Link>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

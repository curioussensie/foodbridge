"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
      </div>
    );
  }

  const totalPosted = stats ? (stats.counts.available + stats.counts.claimed + stats.counts.collected + stats.counts.cancelled) : 0;
  const itemsClaimed = stats ? (stats.counts.claimed + stats.counts.collected) : 0;
  const recoveryRate = totalPosted > 0 ? Math.round((itemsClaimed / totalPosted) * 100) : 0;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-[7px] mb-8">
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[32px] leading-[41.6px]">
          Welcome back, Vital Harvest
        </h1>
        <p className="font-['Inter'] font-normal text-[#3f4940] text-[18px] leading-[28.8px]">
          Here is an overview of your local rescue impact today.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        {/* Overview Cards (Col span 4) */}
        <div className="md:col-span-4 flex flex-col gap-5">
          {/* Items Posted */}
          <div className="bg-white border border-[#dbe3ed] drop-shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[16px] p-[25px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[rgba(38,133,73,0.2)] rounded-[12px] size-[48px] flex items-center justify-center">
                <img alt="Icon" className="size-[24px]" src="http://localhost:3845/assets/e933569bb0a61e5c79174e0e79e7f2e43a7bc249.svg" />
              </div>
              <div className="bg-[rgba(154,247,175,0.3)] rounded-full px-2 py-1 flex items-center gap-1">
                <img alt="Trend" className="w-[12px] h-[7px]" src="http://localhost:3845/assets/47ddbf44736d9bd1a1f3c78590be38463dedd573.svg" />
                <span className="font-['Inter'] font-medium text-[#006a34] text-[12px] leading-none">+12%</span>
              </div>
            </div>
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mb-1">Items Posted</h3>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[48px] leading-[57.6px]">
              {totalPosted || 342}
            </div>
            <div className="font-['Inter'] font-medium text-[#6f7a6f] text-[12px] mt-2">This month</div>
          </div>

          {/* Items Claimed */}
          <div className="bg-white border border-[#dbe3ed] drop-shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[16px] p-[25px] flex flex-col">
            <div className="flex items-start mb-4">
              <div className="bg-[rgba(254,165,32,0.2)] rounded-[12px] size-[48px] flex items-center justify-center">
                <img alt="Icon" className="size-[24px]" src="http://localhost:3845/assets/40682bc2ba577f6e6179d3f621968bc913164703.svg" />
              </div>
            </div>
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mb-1">Items Claimed</h3>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[48px] leading-[57.6px]">
              {itemsClaimed || 289}
            </div>
            <div className="font-['Inter'] font-medium text-[#6f7a6f] text-[12px] mt-2">{recoveryRate || 84}% recovery rate</div>
          </div>
        </div>

        {/* Prominent Action (Col span 8) */}
        <div className="md:col-span-8 bg-white rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] overflow-hidden relative flex flex-col justify-center min-h-[280px]">
          <div className="absolute inset-0">
            <img alt="Background" className="absolute w-full h-full object-cover" src="http://localhost:3845/assets/a23775a067f9f5e9194dbb3e1e3e173a3e4b32f1.png" />
          </div>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 p-[32px] flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2">
              <div className="bg-[#006a34] self-start rounded-full px-3 py-1">
                <span className="font-['Inter'] font-medium text-[12px] text-white tracking-[0.6px] uppercase">Urgent Action</span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[48px] text-white leading-[60px] mt-2">Got Surplus?</h2>
              <p className="font-['Inter'] text-[18px] text-white/90 leading-[28.8px] max-w-[448px]">
                Connect your excess perishable inventory directly with local community rescue teams. Every minute counts.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/donor/post-listing" className="inline-flex items-center gap-2 bg-[#fea520] rounded-[8px] px-6 py-3 hover:bg-[#e5941c] transition-colors relative shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <img alt="Icon" className="size-[20px]" src="http://localhost:3845/assets/cda195d0acc02acd48002d51ce03f250ad466df4.svg" />
                <span className="font-['Inter'] font-semibold text-[#694000] text-[14px]">Post Surplus Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[24px] leading-[33.6px]">Active Listings</h2>
            <p className="font-['Inter'] text-[#3f4940] text-[16px] leading-[25.6px]">Manage items currently pending pickup or awaiting claims.</p>
          </div>
          <Link href="/donor/listings" className="flex items-center gap-1 text-[#006a34] font-['Inter'] font-semibold text-[14px] hover:underline">
            View All
            <img alt="Arrow" className="size-[12px]" src="http://localhost:3845/assets/812649fbcd6aff9d98db00dddd4aa65fcb26d2bd.svg" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white border border-[#dbe3ed] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] overflow-hidden flex flex-col">
            <div className="h-[192px] relative w-full">
              <img alt="Bakery" className="absolute w-full h-full object-cover" src="http://localhost:3845/assets/2a1850e2e33171ff81b2d55bf057a07e26baa018.png" />
              <div className="absolute top-4 left-4 bg-[#268549] rounded-full px-3 py-1.5 flex items-center gap-1 shadow-sm">
                <img alt="Icon" className="size-[12px]" src="http://localhost:3845/assets/66709018179a57acd072a225668e6e6567fc6033.svg" />
                <span className="font-['Inter'] font-medium text-[#f6fff3] text-[12px]">Available</span>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                <span className="font-['Inter'] font-medium text-[#151c23] text-[12px]">Bakery</span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[#151c23] text-[20px] mb-2">Artisan Bread Surplus</h3>
              <p className="font-['Inter'] text-[#3f4940] text-[16px] leading-[25.6px] mb-4 flex-1">
                Approx 15 loaves of mixed sourdough and rye, baked this…
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Inter'] font-medium text-[#3f4940] text-[12px]">Time Remaining</span>
                <span className="font-['Inter'] font-semibold text-[#006a34] text-[12px]">4h 30m</span>
              </div>
              <div className="bg-[#e1e9f3] h-[6px] rounded-full mb-4 overflow-hidden">
                <div className="bg-[#006a34] h-full w-[40%] rounded-full"></div>
              </div>
              <button className="bg-[#e7eff9] border border-[#becabd] rounded-[8px] py-2.5 w-full font-['Inter'] font-semibold text-[#151c23] text-[14px] hover:bg-[#d8e3f2] transition-colors">
                Edit Details
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#dbe3ed] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] overflow-hidden flex flex-col">
            <div className="h-[192px] relative w-full">
              <img alt="Produce" className="absolute w-full h-full object-cover" src="http://localhost:3845/assets/6fd1e781de54aa926a051b629ab23ab4b37e64df.png" />
              <div className="absolute top-4 left-4 bg-[#fea520] rounded-full px-3 py-1.5 flex items-center gap-1 shadow-sm">
                <img alt="Icon" className="h-[12px] w-[10px]" src="http://localhost:3845/assets/c42a3072f28c7944b912354a864f6524b8a9cdb6.svg" />
                <span className="font-['Inter'] font-medium text-[#694000] text-[12px]">Claimed</span>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                <span className="font-['Inter'] font-medium text-[#151c23] text-[12px]">Produce</span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[#151c23] text-[20px] mb-4">Mixed Vegetable Crates</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#d43e30] rounded-full size-[24px] flex items-center justify-center">
                  <span className="font-['Inter'] font-semibold text-[#fffbff] text-[10px]">DT</span>
                </div>
                <span className="font-['Inter'] font-medium text-[#3f4940] text-[12px]">Claimed by Downtown Rescue</span>
              </div>
              <div className="bg-[#edf4fe] border border-[#becabd] rounded-[12px] p-3 flex items-center gap-3 mb-4">
                <img alt="QR Code" className="size-[40px]" src="http://localhost:3845/assets/550b2f6ff0023f18b65707419d0ee2f8b5d1263d.svg" />
                <div>
                  <div className="font-['Inter'] font-medium text-[#151c23] text-[12px]">Pickup Code Ready</div>
                  <div className="font-['Inter'] text-[#3f4940] text-[12px]">Scan upon arrival</div>
                </div>
              </div>
              <button className="border-2 border-[#006a34] rounded-[8px] py-2 w-full flex items-center justify-center gap-2 font-['Inter'] font-semibold text-[#006a34] text-[14px] hover:bg-[#006a34] hover:text-white transition-colors">
                Confirm Pickup
                <img alt="Check" className="w-[15px] h-[12px]" src="http://localhost:3845/assets/4e34d17f776de78b6b595712fb040f5ea9817329.svg" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#dbe3ed] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] overflow-hidden flex flex-col">
            <div className="h-[192px] relative w-full">
              <img alt="Meals" className="absolute w-full h-full object-cover" src="http://localhost:3845/assets/d6412ef8a8e3226d5ea418adcebc92f336aedac7.png" />
              <div className="absolute top-4 left-4 bg-[#d43e30] rounded-full px-3 py-1.5 flex items-center gap-1 shadow-sm">
                <img alt="Icon" className="h-[11px] w-[13px]" src="http://localhost:3845/assets/0c8ce160d10ab44d5d52526a3b2fd6aa65994273.svg" />
                <span className="font-['Inter'] font-medium text-[#fffbff] text-[12px]">Urgent</span>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                <span className="font-['Inter'] font-medium text-[#151c23] text-[12px]">Prepared Food</span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[#151c23] text-[20px] mb-2">Catered Pasta Trays</h3>
              <p className="font-['Inter'] text-[#3f4940] text-[16px] leading-[25.6px] mb-4 flex-1">
                4 large trays of penne marinara, kept at food safe temps.
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Inter'] font-medium text-[#b1241a] text-[12px]">Expiring Soon</span>
                <span className="font-['Inter'] font-semibold text-[#b1241a] text-[12px]">45 mins</span>
              </div>
              <div className="bg-[#e1e9f3] h-[6px] rounded-full mb-4 overflow-hidden">
                <div className="bg-[#d43e30] h-full w-[85%] rounded-full"></div>
              </div>
              <button className="bg-[#e7eff9] border border-[#becabd] rounded-[8px] py-2.5 w-full font-['Inter'] font-semibold text-[#151c23] text-[14px] hover:bg-[#d8e3f2] transition-colors">
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History List */}
      <div className="flex flex-col gap-4">
        <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[24px]">Recent History</h2>
        <div className="bg-white border border-[#dbe3ed] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] overflow-hidden">
          
          <div className="p-6 flex items-center justify-between border-b border-[#dbe3ed]">
            <div className="flex items-center gap-4">
              <div className="bg-[#e7eff9] rounded-[12px] size-[48px] flex items-center justify-center">
                <img alt="Icon" className="size-[20px]" src="http://localhost:3845/assets/c128a6f785053b35f78ffd730c6e7038081867e6.svg" />
              </div>
              <div>
                <div className="font-['Inter'] text-[#151c23] text-[16px]">Dairy Selection Box</div>
                <div className="font-['Inter'] text-[#3f4940] text-[14px]">Picked up by <span className="font-medium">Hope Kitchen</span></div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                <span className="font-['Inter'] font-medium text-[#6f7a6f] text-[12px]">Yesterday, 4:15 PM</span>
                <div className="bg-[rgba(154,247,175,0.3)] rounded-[4px] px-2 py-0.5 flex items-center gap-1">
                  <img alt="Icon" className="w-[13px] h-[7px]" src="http://localhost:3845/assets/edafd696dd9ba1ece6bc286c118e283318e58d7a.svg" />
                  <span className="font-['Inter'] text-[#006a34] text-[12px]">Completed</span>
                </div>
              </div>
              <button className="border border-[#becabd] rounded-full size-[32px] flex items-center justify-center hover:bg-slate-50 transition-colors">
                <img alt="Dots" className="w-[6px] h-[9px]" src="http://localhost:3845/assets/62ddf3967d3ec35c920c594f95481697e926f4ba.svg" />
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between border-b border-[#dbe3ed]">
            <div className="flex items-center gap-4">
              <div className="bg-[#e7eff9] rounded-[12px] size-[48px] flex items-center justify-center">
                <img alt="Icon" className="w-[22px] h-[19px]" src="http://localhost:3845/assets/f5ae2c5d7e9b0347777e34c5043551651deb5c01.svg" />
              </div>
              <div>
                <div className="font-['Inter'] text-[#151c23] text-[16px]">Assorted Deli Meats</div>
                <div className="font-['Inter'] text-[#3f4940] text-[14px]">Expired - Unclaimed</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                <span className="font-['Inter'] font-medium text-[#6f7a6f] text-[12px]">Oct 12, 8:00 PM</span>
                <div className="bg-[#e1e9f3] rounded-[4px] px-2 py-0.5 flex items-center gap-1">
                  <img alt="Icon" className="size-[12px]" src="http://localhost:3845/assets/8f41b2bc22384501c48a9ab97c8f89fcfc40d29e.svg" />
                  <span className="font-['Inter'] text-[#3f4940] text-[12px]">Expired</span>
                </div>
              </div>
              <button className="border border-[#becabd] rounded-full size-[32px] flex items-center justify-center hover:bg-slate-50 transition-colors">
                <img alt="Dots" className="w-[6px] h-[9px]" src="http://localhost:3845/assets/62ddf3967d3ec35c920c594f95481697e926f4ba.svg" />
              </button>
            </div>
          </div>

          <Link href="/donor/listings" className="block bg-[#f7f9ff] py-4 text-center cursor-pointer hover:bg-[#edf2f9] transition-colors">
            <span className="font-['Inter'] font-semibold text-[#006a34] text-[14px]">View Full History</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

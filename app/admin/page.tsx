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

  const collectedCount = stats?.listings?.collected || 0;
  const mealsSaved = collectedCount > 0 ? collectedCount * 5 : 4285;
  const kgRescued = collectedCount > 0 ? collectedCount * 2.5 : 1840;
  const co2Prevented = collectedCount > 0 ? collectedCount * 4 : 3450;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6 md:p-8 flex flex-col gap-[32px]">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-[7px] max-w-[468px]">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] text-[48px] leading-[57.6px]">
            Impact Profile
          </h1>
          <p className="font-['Inter'] text-[#3f4940] text-[18px] leading-[28.8px]">
            Track your contribution to the Vital Harvest ecosystem.
          </p>
        </div>
        <div className="bg-[#e7eff9] border border-[rgba(190,202,189,0.5)] rounded-[8px] p-[5px] flex items-center">
          <button className="px-[16px] py-[6px] rounded-[6px] hover:bg-white/50 transition-colors font-['Inter'] font-semibold text-[#3f4940] text-[14px]">Week</button>
          <button className="px-[16px] py-[6px] rounded-[6px] hover:bg-white/50 transition-colors font-['Inter'] font-semibold text-[#3f4940] text-[14px]">Month</button>
          <button className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] px-[16px] py-[6px] rounded-[6px] font-['Inter'] font-semibold text-[#006a34] text-[14px]">All Time</button>
        </div>
      </div>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat Card 1: Meals Saved */}
        <div className="bg-white border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between relative overflow-hidden h-[199px]">
          <div className="absolute bg-[rgba(154,247,175,0.2)] blur-[20px] right-[-24px] top-[-24px] size-[128px] rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mt-2">Meals Saved</h3>
            <div className="bg-[rgba(38,133,73,0.1)] rounded-full size-[40px] flex items-center justify-center">
              <img alt="Icon" className="w-[15px] h-[20px]" src="http://localhost:3845/assets/112263dbaad658cf64aed69860f98909449830e1.svg" />
            </div>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#006a34] text-[48px] leading-[57.6px]">
              {mealsSaved.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <img alt="Trend" className="w-[12px] h-[7px]" src="http://localhost:3845/assets/47ddbf44736d9bd1a1f3c78590be38463dedd573.svg" />
              <span className="font-['Inter'] text-[#6f7a6f] text-[16px]">+12% from last month</span>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Kilograms Rescued */}
        <div className="bg-white border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between relative overflow-hidden h-[199px]">
          <div className="absolute bg-[rgba(255,221,185,0.3)] blur-[20px] right-[-24px] top-[-24px] size-[128px] rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mt-2">Kilograms Rescued</h3>
            <div className="bg-[rgba(254,165,32,0.2)] rounded-full size-[40px] flex items-center justify-center">
              <img alt="Icon" className="size-[20px]" src="http://localhost:3845/assets/1e9a3a3c05e0e838ba73b12ed1365ab52ee490ba.svg" />
            </div>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#865300] text-[48px] leading-[57.6px]">
                {kgRescued.toLocaleString()}
              </div>
              <div className="font-['Plus_Jakarta_Sans'] font-semibold text-[#6f7a6f] text-[24px]">kg</div>
            </div>
            <div className="flex items-center gap-1">
              <img alt="Trend" className="w-[12px] h-[7px]" src="http://localhost:3845/assets/47ddbf44736d9bd1a1f3c78590be38463dedd573.svg" />
              <span className="font-['Inter'] text-[#6f7a6f] text-[16px]">+8% from last month</span>
            </div>
          </div>
        </div>

        {/* Stat Card 3: CO2 Prevented */}
        <div className="bg-white border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col justify-between relative overflow-hidden h-[199px]">
          <div className="absolute bg-[rgba(255,218,213,0.3)] blur-[20px] right-[-24px] top-[-24px] size-[128px] rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <h3 className="font-['Inter'] font-semibold text-[#3f4940] text-[14px] tracking-[0.7px] uppercase mt-2">CO2 Emissions Prevented</h3>
            <div className="bg-[rgba(212,62,48,0.1)] rounded-full size-[40px] flex items-center justify-center">
              <img alt="Icon" className="size-[17px]" src="http://localhost:3845/assets/09b85f3bca6456848665a03bb634a7f183c863ca.svg" />
            </div>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="font-['Plus_Jakarta_Sans'] font-bold text-[#b1241a] text-[48px] leading-[57.6px]">
                {co2Prevented.toLocaleString()}
              </div>
              <div className="font-['Plus_Jakarta_Sans'] font-semibold text-[#6f7a6f] text-[24px]">kg</div>
            </div>
            <div className="font-['Inter'] text-[#6f7a6f] text-[16px]">
              Equivalent to planting {Math.round(co2Prevented / 250)} trees
            </div>
          </div>
        </div>

        {/* Graph Card */}
        <div className="md:col-span-2 bg-white border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] relative h-[384px] overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center z-10">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[24px]">Impact Over Time</h2>
            <button className="flex items-center gap-1 font-['Inter'] font-semibold text-[#006a34] text-[14px] hover:underline">
              Export Report
              <img alt="Icon" className="size-[9px]" src="http://localhost:3845/assets/def367cc92e13508bb773c465f6b6e7383c5bb0d.svg" />
            </button>
          </div>
          
          <div className="flex-1 relative mx-6 mb-12 border-b border-[rgba(190,202,189,0.3)] flex items-end justify-between pt-8 pb-2">
            {/* Y Axis Labels */}
            <div className="absolute left-[-20px] top-0 bottom-0 w-[40px] flex flex-col justify-between text-right pb-4">
               <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">1000</span>
               <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">500</span>
               <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">0</span>
            </div>
            {/* Bars */}
            <div className="flex-1 flex justify-between items-end pl-8 px-4 h-[250px]">
               <div className="w-[40px] bg-[rgba(38,133,73,0.2)] rounded-t-[6px] h-[30%]"></div>
               <div className="w-[40px] bg-[rgba(38,133,73,0.3)] rounded-t-[6px] h-[45%]"></div>
               <div className="w-[40px] bg-[rgba(38,133,73,0.4)] rounded-t-[6px] h-[60%]"></div>
               <div className="w-[40px] bg-[rgba(38,133,73,0.5)] rounded-t-[6px] h-[40%]"></div>
               <div className="w-[40px] bg-[rgba(38,133,73,0.6)] rounded-t-[6px] h-[75%]"></div>
               <div className="w-[40px] bg-[#006a34] shadow-[0px_0px_7.5px_rgba(0,106,52,0.3)] rounded-t-[6px] h-[90%] relative group">
                  <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 bg-[#293139] text-[#eaf1fb] text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">900kg</div>
               </div>
               <div className="w-[40px] bg-[rgba(38,133,73,0.2)] rounded-t-[6px] h-[50%]"></div>
            </div>
          </div>
          {/* X Axis Labels */}
          <div className="absolute bottom-6 left-[50px] right-6 flex justify-between px-4">
             <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">Mon</span>
             <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">Tue</span>
             <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">Wed</span>
             <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">Thu</span>
             <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">Fri</span>
             <span className="font-['Inter'] font-semibold text-[#006a34] text-[12px]">Sat</span>
             <span className="font-['Inter'] text-[#6f7a6f] text-[12px]">Sun</span>
          </div>
        </div>

        {/* Badges Card */}
        <div className="bg-white border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] h-[384px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[24px]">Achievements</h2>
            <Link href="#" className="font-['Inter'] font-semibold text-[#006a34] text-[14px] hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-[#e7eff9] border border-[rgba(190,202,189,0.2)] rounded-[12px] p-4 flex flex-col items-center justify-center gap-2">
              <div className="size-[56px] rounded-full shadow-sm bg-gradient-to-br from-yellow-200 to-amber-500 flex items-center justify-center">
                <img alt="Badge" className="size-[20px]" src="http://localhost:3845/assets/bc9cf19b31fc5dfecb3125a26e4395ca03a0c7f7.svg" />
              </div>
              <div className="text-center">
                <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">Top 5%</div>
                <div className="font-['Inter'] text-[#6f7a6f] text-[10px]">Local Rescuer</div>
              </div>
            </div>
            
            <div className="bg-[#e7eff9] border border-[rgba(190,202,189,0.2)] rounded-[12px] p-4 flex flex-col items-center justify-center gap-2">
              <div className="size-[56px] rounded-full shadow-sm bg-gradient-to-br from-green-200 to-[#006a34] flex items-center justify-center">
                <img alt="Badge" className="w-[16px] h-[21px]" src="http://localhost:3845/assets/46004b0b81a8e5c970925a9e8921f4409cccf6a8.svg" />
              </div>
              <div className="text-center">
                <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">1k Club</div>
                <div className="font-['Inter'] text-[#6f7a6f] text-[10px]">Meals Saved</div>
              </div>
            </div>

            <div className="bg-[#e7eff9] border border-[rgba(190,202,189,0.2)] rounded-[12px] p-4 flex flex-col items-center justify-center gap-2">
              <div className="size-[56px] rounded-full shadow-sm bg-gradient-to-br from-blue-200 to-indigo-500 flex items-center justify-center">
                <img alt="Badge" className="w-[22px] h-[16px]" src="http://localhost:3845/assets/db8b3d3d4acbdd71bffe1f5bac941c97ef728609.svg" />
              </div>
              <div className="text-center">
                <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">Fast Mover</div>
                <div className="font-['Inter'] text-[#6f7a6f] text-[10px]">Avg Pickup &lt; 1h</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-[#becabd] border-dashed rounded-[12px] p-4 flex flex-col items-center justify-center gap-2 opacity-60">
              <div className="size-[56px] rounded-full bg-[#d3dbe5] flex items-center justify-center">
                <img alt="Lock" className="w-[16px] h-[21px]" src="http://localhost:3845/assets/0b84b866e2ae481fa0cf7d7b02860464b588c1e3.svg" />
              </div>
              <div className="text-center">
                <div className="font-['Inter'] font-semibold text-[#6f7a6f] text-[14px]">Next Goal</div>
                <div className="font-['Inter'] text-[#6f7a6f] text-[10px]">2,000kg Rescued</div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Leaderboard */}
        <div className="md:col-span-3 bg-white border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] rounded-[12px] p-[25px] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[#151c23] text-[24px]">Community Leaderboard</h2>
              <p className="font-['Inter'] text-[#3f4940] text-[16px]">See how your impact compares in the Vital Harvest network.</p>
            </div>
            <div className="bg-[#e7eff9] border border-[rgba(190,202,189,0.5)] rounded-[8px] p-[5px] flex items-center">
              <button className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] px-4 py-1.5 rounded-[6px] font-['Inter'] font-semibold text-[#006a34] text-[14px]">Local</button>
              <button className="px-4 py-1.5 rounded-[6px] font-['Inter'] font-semibold text-[#3f4940] text-[14px] hover:bg-white/50 transition-colors">Global</button>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(190,202,189,0.3)]">
                  <th className="py-3 px-4 font-['Inter'] font-semibold text-[#6f7a6f] text-[12px] uppercase tracking-wider w-[10%]">Rank</th>
                  <th className="py-3 px-4 font-['Inter'] font-semibold text-[#6f7a6f] text-[12px] uppercase tracking-wider w-[50%]">Organization / User</th>
                  <th className="py-3 px-4 font-['Inter'] font-semibold text-[#6f7a6f] text-[12px] uppercase tracking-wider text-right w-[25%]">Meals Saved</th>
                  <th className="py-3 px-4 font-['Inter'] font-semibold text-[#6f7a6f] text-[12px] uppercase tracking-wider text-right w-[15%]">Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[rgba(190,202,189,0.1)] hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="bg-[#fea520] text-[#694000] size-8 rounded-full flex items-center justify-center font-['Inter'] font-semibold text-[14px]">1</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#d3dbe5] overflow-hidden">
                        <img alt="Avatar" className="w-full h-full object-cover" src="http://localhost:3845/assets/b87d623eeed437f96c946eab5740813534c42a43.png" />
                      </div>
                      <div>
                        <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">Sunrise Bakery Hub</div>
                        <div className="font-['Inter'] text-[#6f7a6f] text-[12px]">Downtown District</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-['Inter'] text-[#151c23] text-[16px]">12,450</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <img alt="Up" className="size-3" src="http://localhost:3845/assets/5b509c07882c0eb3f3787f879450d430c34f28de.svg" />
                      <span className="font-['Inter'] font-medium text-[#006a34] text-[12px]">4.2%</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-[rgba(190,202,189,0.1)] hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="bg-[#dbe3ed] text-[#6f7a6f] size-8 rounded-full flex items-center justify-center font-['Inter'] font-semibold text-[14px]">2</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#d3dbe5] overflow-hidden">
                        <img alt="Avatar" className="w-full h-full object-cover" src="http://localhost:3845/assets/b4d629599e78f97caac34bca15e329fe7ba5584a.png" />
                      </div>
                      <div>
                        <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">TechCorp Cafeteria</div>
                        <div className="font-['Inter'] text-[#6f7a6f] text-[12px]">Northside Park</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-['Inter'] text-[#151c23] text-[16px]">8,920</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <img alt="Up" className="size-3" src="http://localhost:3845/assets/5b509c07882c0eb3f3787f879450d430c34f28de.svg" />
                      <span className="font-['Inter'] font-medium text-[#006a34] text-[12px]">1.1%</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-[rgba(38,133,73,0.05)] border-b border-[rgba(0,106,52,0.2)]">
                  <td className="py-4 px-4">
                    <div className="border-2 border-[#006a34] text-[#006a34] size-8 rounded-full flex items-center justify-center font-['Inter'] font-semibold text-[14px]">5</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full border-2 border-[#006a34] p-[2px] bg-white overflow-hidden">
                         <img alt="Avatar" className="w-full h-full object-cover rounded-full" src="http://localhost:3845/assets/ecb9ce5c714eed55d73735cdc6348be74e1bbcdb.png" />
                      </div>
                      <div>
                        <div className="font-['Inter'] font-semibold text-[#151c23] text-[14px]">Vital Harvest (You)</div>
                        <div className="font-['Inter'] text-[#006a34] text-[12px]">Moving up!</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-['Inter'] font-semibold text-[#151c23] text-[16px]">{mealsSaved.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <img alt="Up" className="size-3" src="http://localhost:3845/assets/5b509c07882c0eb3f3787f879450d430c34f28de.svg" />
                      <span className="font-['Inter'] font-medium text-[#006a34] text-[12px]">12.0%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

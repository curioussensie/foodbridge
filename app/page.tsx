import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#151c23] selection:bg-[#e7eff9] selection:text-[#006a34]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[rgba(190,202,189,0.3)] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#268549] rounded-[8px] flex items-center justify-center text-[#f6fff3] font-heading font-bold text-xl shadow-[0px_4px_10px_rgba(0,106,52,0.1)]">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-heading font-semibold text-[#15803d] tracking-[-0.5px] leading-none mb-1">FoodBridge</span>
              <span className="text-[12px] font-sans text-[#6f7a6f] leading-none">Vital Harvest Ecosystem</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-[32px]">
             <a href="#how-it-works" className="text-[14px] font-semibold text-[#6f7a6f] hover:text-[#006a34] transition-colors">How it Works</a>
             <a href="#impact" className="text-[14px] font-semibold text-[#6f7a6f] hover:text-[#006a34] transition-colors">Impact</a>
             <Link href="/login" className="text-[14px] font-semibold text-[#151c23] hover:text-[#006a34] transition-colors">Sign In</Link>
             <Link href="/donor/register" className="h-[40px] px-[16px] bg-[#006a34] hover:bg-[#268549] text-white text-[14px] font-semibold rounded-[8px] flex items-center justify-center transition-all shadow-[0px_4px_10px_rgba(0,106,52,0.15)]">
               Add New Listing
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-[140px] pb-[100px] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center">
          <div className="flex flex-col gap-[32px]">
            <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-[#e7eff9] text-[#006a34] rounded-[9999px] text-[14px] font-semibold border border-[rgba(190,202,189,0.5)] w-max">
              <span className="w-[8px] h-[8px] rounded-full bg-[#006a34] animate-pulse"></span>
              Powering the Vital Harvest ecosystem
            </div>
            <h1 className="text-[48px] md:text-[64px] font-heading font-bold text-[#151c23] leading-[1.1] tracking-tight">
              Share Surplus, <br />
              <span className="text-[#006a34]">End Hunger.</span>
            </h1>
            <p className="text-[18px] text-[#3f4940] font-normal leading-[1.6] max-w-lg">
              FoodBridge connects restaurants and businesses with local NGOs to redirect surplus food to those who need it most. Simple, fast, and impactful.
            </p>
            <div className="flex flex-col sm:flex-row gap-[16px] pt-[8px]">
              <Link href="/donor/register" className="h-[48px] px-[24px] bg-[#006a34] hover:bg-[#268549] text-white font-semibold rounded-[8px] flex items-center justify-center transition-all shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[16px]">
                Become a Donor
              </Link>
              <Link href="/recipient/register" className="h-[48px] px-[24px] bg-white hover:bg-[#f8f9fa] text-[#151c23] font-semibold rounded-[8px] flex items-center justify-center transition-all border border-[rgba(190,202,189,0.3)] shadow-sm text-[16px]">
                Register as NGO
              </Link>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-[rgba(154,247,175,0.2)] rounded-[24px] blur-[40px] group-hover:bg-[rgba(154,247,175,0.3)] transition-all duration-700"></div>
            <div className="relative bg-white p-[24px] rounded-[12px] border border-[rgba(190,202,189,0.3)] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] aspect-square overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1488459711615-228f19503358?q=80&w=2070&auto=format&fit=crop" 
                 alt="Fresh Food" 
                 className="w-full h-full object-cover rounded-[8px] grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.02]"
               />
               <div className="absolute bottom-[40px] left-[40px] right-[40px] bg-white/95 backdrop-blur-md p-[24px] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.08)] border border-[rgba(190,202,189,0.3)]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="text-[14px] font-semibold text-[#3f4940] tracking-[0.7px] uppercase">Meals Saved</span>
                    <div className="bg-[rgba(38,133,73,0.1)] rounded-[9999px] w-[40px] h-[40px] flex items-center justify-center">
                      <svg className="w-[20px] h-[20px] text-[#006a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-[8px]">
                    <span className="text-[48px] font-heading font-bold text-[#006a34] tracking-tight leading-none">12,450</span>
                    <span className="text-[16px] font-normal text-[#6f7a6f]">+12% this month</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-[100px] bg-white border-t border-[rgba(190,202,189,0.3)] shadow-[0px_-4px_20px_0px_rgba(0,106,52,0.02)]">
        <div className="max-w-[1200px] mx-auto px-6">
           <div className="mb-[64px] text-center flex flex-col gap-[16px] items-center">
              <span className="text-[14px] font-semibold tracking-[0.7px] text-[#3f4940] uppercase bg-[#e7eff9] px-[16px] py-[6px] rounded-[8px] border border-[rgba(190,202,189,0.5)]">The Process</span>
              <h3 className="text-[40px] md:text-[48px] font-heading font-bold text-[#151c23] tracking-tight">Three steps to change a life</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
              {[
                { title: "Post", desc: "Donors list surplus food items in seconds with our simple dashboard.", icon: "M12 4v16m8-8H4", color: "rgba(154,247,175,0.2)", textColor: "#006a34" },
                { title: "Claim", desc: "Approved NGOs browse local listings and claim food for their communities.", icon: "M21 15.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-3.5m18-10V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1.5m18 10l-9 5-9-5m18-10l-9 5-9-5", color: "rgba(254,165,32,0.2)", textColor: "#865300" },
                { title: "Deliver", desc: "Direct pickup and delivery ensures food stays fresh and reaches those in need.", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "rgba(212,62,48,0.1)", textColor: "#b1241a" }
              ].map((step, i) => (
                <div key={i} className="bg-white p-[32px] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] border border-[rgba(190,202,189,0.3)] hover:border-[#becabd] transition-all group flex flex-col items-start gap-[16px] relative overflow-hidden">
                   <div className="absolute bg-current blur-[40px] right-[-40px] rounded-[9999px] size-[160px] top-[-40px]" style={{ color: step.color }}></div>
                   <div className="w-[56px] h-[56px] rounded-[9999px] flex items-center justify-center relative z-10 transition-all duration-300" style={{ backgroundColor: step.color, color: step.textColor }}>
                      <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={step.icon} />
                      </svg>
                   </div>
                   <h4 className="text-[24px] font-heading font-semibold text-[#151c23] relative z-10">{step.title}</h4>
                   <p className="text-[16px] text-[#6f7a6f] font-normal leading-[1.5] relative z-10">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[32px] bg-white border-t border-[#e2e8f0]">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-[24px]">
           <div className="flex items-center gap-[8px]">
              <span className="text-[14px] font-semibold text-[#0f172a]">FoodBridge</span>
           </div>
           <div className="flex items-center gap-[16px] text-[12px] font-normal text-[#64748b]">
              <Link href="/login" className="hover:text-[#006a34] transition-colors">Privacy Policy</Link>
              <Link href="/login" className="hover:text-[#006a34] transition-colors">Rescue Terms</Link>
              <Link href="/admin" className="hover:text-[#006a34] transition-colors">Global Impact</Link>
           </div>
           <p className="text-[12px] text-[#64748b] font-normal text-right">&copy; 2026 FoodBridge. Powering the Vital Harvest ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}

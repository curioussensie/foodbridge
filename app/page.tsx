import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/20">
              FB
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">FoodBridge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
             <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-amber-600 transition-colors uppercase tracking-widest">How it Works</a>
             <a href="#impact" className="text-sm font-bold text-slate-500 hover:text-amber-600 transition-colors uppercase tracking-widest">Impact</a>
             <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors uppercase tracking-widest">Sign In</Link>
             <Link href="/donor/register" className="h-12 px-6 bg-slate-900 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-xl shadow-slate-900/10 hover:shadow-amber-500/20 uppercase tracking-widest text-xs">
               Join Now
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Fighting Food Waste Together
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tight">
              Share Surplus, <br />
              <span className="text-amber-500">End Hunger.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              FoodBridge connects restaurants and businesses with local NGOs to redirect surplus food to those who need it most. Simple, fast, and impactful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/donor/register" className="h-16 px-10 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-amber-500/30 text-sm uppercase tracking-widest">
                Become a Donor
              </Link>
              <Link href="/recipient/register" className="h-16 px-10 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black rounded-2xl flex items-center justify-center transition-all border border-slate-200 text-sm uppercase tracking-widest">
                Register as NGO
              </Link>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-500/20 rounded-[3rem] blur-3xl group-hover:bg-amber-500/30 transition-all duration-700"></div>
            <div className="relative bg-slate-50 rounded-[3rem] aspect-square overflow-hidden border border-slate-200 shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1488459711615-228f19503358?q=80&w=2070&auto=format&fit=crop" 
                 alt="Fresh Food" 
                 className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
               />
               <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Live Impact</span>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Updated Now</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">12,450+</span>
                    <span className="text-sm font-bold text-slate-500 mb-1.5 uppercase">Meals Shared</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="mb-20 text-center space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">The Process</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Three steps to change a life</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Post", desc: "Donors list surplus food items in seconds with our simple dashboard.", icon: "M12 4v16m8-8H4" },
                { title: "Claim", desc: "Approved NGOs browse local listings and claim food for their communities.", icon: "M21 15.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-3.5m18-10V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1.5m18 10l-9 5-9-5m18-10l-9 5-9-5" },
                { title: "Deliver", desc: "Direct pickup and delivery ensures food stays fresh and reaches those in need.", icon: "M13 10V3L4 14h7v7l9-11h-7z" }
              ].map((step, i) => (
                <div key={i} className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-100 hover:border-amber-200 transition-all group">
                   <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={step.icon} />
                      </svg>
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h4>
                   <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">FB</div>
              <span className="text-xl font-black tracking-tight text-slate-900">FoodBridge</span>
           </div>
           <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Link href="/login" className="hover:text-amber-500 transition-colors">Donor Portal</Link>
              <Link href="/login" className="hover:text-blue-500 transition-colors">NGO Portal</Link>
              <Link href="/admin" className="hover:text-slate-900 transition-colors">Admin</Link>
           </div>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">&copy; 2026 FoodBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

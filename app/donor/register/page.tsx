"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DonorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    foodType: "",
    email: "",
    password: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setStatus("success");
      setSuccessMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-12 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-slate-100 text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Welcome Aboard!</h2>
             <p className="text-slate-500 leading-relaxed font-medium">{successMessage}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
           <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">FB</div>
              <span className="text-xl font-black text-slate-800 tracking-tight">FoodBridge</span>
           </Link>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Partner with us</h1>
           <p className="text-slate-500 font-medium max-w-md mx-auto">Join hundreds of businesses reducing food waste and helping communities.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            {status === "error" && (
              <div className="mb-10 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="name">
                      Business Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="e.g. Bella Italia Restaurant"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="address">
                      Pickup Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="123 Main Street, London"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="contact">
                      Contact Phone
                    </label>
                    <input
                      id="contact"
                      name="contact"
                      type="tel"
                      required
                      value={formData.contact}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="+44 7123 456789"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="foodType">
                      Food Category
                    </label>
                    <select
                      id="foodType"
                      name="foodType"
                      required
                      value={formData.foodType}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800 bg-white"
                    >
                      <option value="" disabled>Select type</option>
                      <option value="Bakery">Bakery & Pastries</option>
                      <option value="Produce">Fresh Produce</option>
                      <option value="Prepared Meals">Prepared Meals</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-px flex-1 bg-slate-100"></div>
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Account Details</span>
                     <div className="h-px flex-1 bg-slate-100"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                        placeholder="owner@business.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="password">
                        Create Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-16 bg-slate-900 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/10 hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Donor Account"
                  )}
                </button>
                <p className="text-center text-sm text-slate-500 mt-8 font-medium">
                  Already have an account? <Link href="/login" className="text-amber-600 font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

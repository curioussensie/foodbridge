"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NgoRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    orgName: "",
    registrationNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch("/api/auth/register/ngo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Submitted!</h2>
             <p className="text-slate-500 leading-relaxed font-medium">Your account has been created. An administrator will review your NGO registration shortly.</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
          >
            Go to Login
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
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">FB</div>
              <span className="text-xl font-black text-slate-800 tracking-tight">FoodBridge</span>
           </Link>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Join the Mission</h1>
           <p className="text-slate-500 font-medium max-w-md mx-auto">Register your NGO to start receiving food donations for those in need.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="orgName">
                      Organization Name
                    </label>
                    <input
                      id="orgName"
                      name="orgName"
                      type="text"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="e.g. Hope Community Kitchen"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="registrationNumber">
                      NGO Reg. Number
                    </label>
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="REG-123456"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="contactPerson">
                      Contact Person
                    </label>
                    <input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="phone">
                      Contact Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-800"
                      placeholder="+44 7123 456789"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-px flex-1 bg-slate-100"></div>
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Account Credentials</span>
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
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-800"
                        placeholder="jane@organization.org"
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
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-800"
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
                  className="w-full h-16 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Register NGO Account"
                  )}
                </button>
                <p className="text-center text-sm text-slate-500 mt-8 font-medium">
                  Already registered? <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

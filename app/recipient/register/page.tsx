"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Server returned an invalid response. Please check backend logs.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#f7f9ff] flex items-center justify-center p-6 font-['Inter']">
        <div className="bg-white max-w-md w-full p-12 rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] border border-[#dbe3ed] text-center space-y-8">
          <div className="w-20 h-20 bg-[rgba(38,133,73,0.1)] text-[#006a34] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
             <h2 className="text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#151c23] tracking-tight mb-2">Submitted!</h2>
             <p className="text-[#6f7a6f] text-[14px] leading-relaxed font-medium">Your account has been created. An administrator will review your NGO registration shortly.</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-all shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[16px]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] py-[80px] px-6 font-['Inter'] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(38,133,73,0.05)] rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-[768px] mx-auto relative z-10">
        <div className="mb-[48px] text-center flex flex-col items-center">
           <Link href="/" className="inline-flex items-center gap-3 mb-[24px] group">
              <div className="w-10 h-10 rounded-[8px] relative overflow-hidden shadow-[0px_4px_10px_rgba(0,106,52,0.1)] group-hover:scale-105 transition-transform">
                <Image src="/foodbridge-logo.jpeg" alt="FoodBridge Logo" fill className="object-cover" />
              </div>
              <span className="text-[24px] font-['Plus_Jakarta_Sans'] font-bold text-[#006a34] tracking-[-0.5px]">FoodBridge</span>
           </Link>
           <h1 className="text-[36px] font-['Plus_Jakarta_Sans'] font-bold text-[#151c23] tracking-tight mb-3">Join the Mission</h1>
           <p className="text-[16px] text-[#6f7a6f] font-medium max-w-md mx-auto">Register your NGO to start receiving food donations for those in need.</p>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] border border-[#dbe3ed] overflow-hidden">
          <div className="p-8 sm:p-12">
            {status === "error" && (
              <div className="mb-10 p-4 bg-[rgba(212,62,48,0.1)] border border-[#d43e30]/20 text-[#b1241a] rounded-[8px] font-semibold text-[14px] text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-[40px]">
              <div className="space-y-[32px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="orgName">
                      Organization Name
                    </label>
                    <input
                      id="orgName"
                      name="orgName"
                      type="text"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      className="w-full px-[16px] py-[12px] bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                      placeholder="e.g. Hope Community Kitchen"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="registrationNumber">
                      NGO Reg. Number
                    </label>
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-[16px] py-[12px] bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                      placeholder="REG-123456"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="contactPerson">
                      Contact Person
                    </label>
                    <input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-[16px] py-[12px] bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="phone">
                      Contact Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-[16px] py-[12px] bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                      placeholder="+44 7123 456789"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-4 mb-[24px]">
                     <div className="h-px flex-1 bg-[#dbe3ed]"></div>
                     <span className="text-[10px] font-bold text-[#8a968a] uppercase tracking-[0.2em]">Account Credentials</span>
                     <div className="h-px flex-1 bg-[#dbe3ed]"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-[16px] py-[12px] bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                        placeholder="jane@organization.org"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="password">
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
                        className="w-full px-[16px] py-[12px] bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-[16px]">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-all shadow-[0px_4px_10px_rgba(0,106,52,0.15)] disabled:opacity-50 flex items-center justify-center gap-3 text-[16px]"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Register NGO Account"
                  )}
                </button>
                <p className="text-center text-[14px] text-[#6f7a6f] mt-8 font-medium">
                  Already registered? <Link href="/login" className="text-[#006a34] font-semibold hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

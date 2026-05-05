"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
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
      const response = await fetch("/api/auth/login", {
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
        throw new Error(data?.error || "Login failed");
      }

      // Redirect based on role
      if (data.user.role === "Donor") {
        router.push("/donor");
      } else if (data.user.role === "Recipient") {
        router.push("/recipient");
      } else if (data.user.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[rgba(154,247,175,0.2)] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[rgba(254,165,32,0.1)] rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-white max-w-md w-full p-[40px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,106,52,0.04)] border border-[#e2e8f0] relative z-10">
        <div className="mb-10 text-center flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-[24px] group">
            <div className="w-10 h-10 bg-[#268549] rounded-[8px] flex items-center justify-center text-[#f6fff3] font-heading font-bold text-xl shadow-[0px_4px_10px_rgba(0,106,52,0.1)] group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="text-[24px] font-heading font-semibold text-[#15803d] tracking-[-0.5px]">
              FoodBridge
            </span>
          </Link>
          <h1 className="text-[32px] font-heading font-bold text-[#151c23] tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-[14px] text-[#6f7a6f] font-medium">
            Continue your journey with us.
          </p>
        </div>

        {status === "error" && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-[#b1241a] rounded-[8px] font-semibold text-[14px] text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label
                className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-[16px] py-[12px] bg-[#f8f9fa] border border-[#becabd] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(0,106,52,0.1)] outline-none transition-all font-medium text-[#151c23] placeholder:text-slate-400 text-[14px]"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label
                className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-[16px] py-[12px] bg-[#f8f9fa] border border-[#becabd] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(0,106,52,0.1)] outline-none transition-all font-medium text-[#151c23] placeholder:text-slate-400 text-[14px]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-[48px] bg-[#006a34] text-white hover:bg-[#268549] font-semibold rounded-[8px] transition-all shadow-[0px_4px_10px_rgba(0,106,52,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 text-[16px]"
            >
              {status === "loading" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
            <p className="text-center text-[14px] text-[#6f7a6f] mt-8 font-medium">
              New here?{" "}
              <Link
                href="/donor/register"
                className="text-[#006a34] font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-white/5 backdrop-blur-xl max-w-md w-full p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              FB
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              FoodBridge
            </span>
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            Welcome Back
          </h1>
          <p className="text-slate-400 font-medium">
            Continue your journey with us.
          </p>
        </div>

        {status === "error" && (
          <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
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
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
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
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-16 bg-white text-slate-900 hover:bg-amber-500 hover:text-white font-black rounded-2xl transition-all shadow-xl shadow-white/5 hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {status === "loading" ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
            <p className="text-center text-sm text-slate-500 mt-10 font-medium">
              New here?{" "}
              <Link
                href="/donor/register"
                className="text-amber-500 font-bold hover:underline"
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

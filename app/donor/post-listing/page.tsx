"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    category: "",
    pickupStartTime: "",
    pickupEndTime: "",
    photoUrl: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories((data.categories || []).map((c: any) => c.name)))
      .catch(() => setCategories(["Bakery & Pastries", "Fresh Produce", "Prepared Meals", "Groceries", "Other"]));
  }, []);

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
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post listing");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="p-6 lg:p-20 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white max-w-md w-full p-12 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-slate-100 text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Success!</h2>
             <p className="text-slate-500 leading-relaxed font-medium">Your donation is now live and waiting for a recipient to claim it.</p>
          </div>
          <div className="space-y-3 pt-4">
            <button
              onClick={() => {
                setFormData({
                  foodName: "",
                  quantity: "",
                  category: "",
                  pickupStartTime: "",
                  pickupEndTime: "",
                  photoUrl: "",
                });
                setStatus("idle");
              }}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20"
            >
              Post Another Item
            </button>
            <button
              onClick={() => router.push("/donor")}
              className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
            >
              Go to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-slate-100 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Post a Donation</h1>
            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">Help reduce food waste by sharing your surplus items with those in need.</p>
          </div>

          {status === "error" && (
            <div className="mb-10 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="foodName">
                  What are you donating?
                </label>
                <input
                  id="foodName"
                  name="foodName"
                  type="text"
                  required
                  value={formData.foodName}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="e.g. 10 Loaves of Fresh Sourdough"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="e.g. 5 kg or 10 boxes"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800 bg-white"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 pt-4">
                 <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-[10px]">
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    Collection Window
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="pickupStartTime">
                        Starts From
                      </label>
                      <input
                        id="pickupStartTime"
                        name="pickupStartTime"
                        type="datetime-local"
                        required
                        value={formData.pickupStartTime}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="pickupEndTime">
                        Ends At
                      </label>
                      <input
                        id="pickupEndTime"
                        name="pickupEndTime"
                        type="datetime-local"
                        required
                        value={formData.pickupEndTime}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                 </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="photoUrl">
                  Photo URL <span className="text-slate-300 font-normal italic lowercase">(Optional)</span>
                </label>
                <input
                  id="photoUrl"
                  name="photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="https://images.unsplash.com/..."
                />
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
                    <>
                       Confirm & Post Listing
                    </>
                  )}
               </button>
               <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                  By posting, you agree to our food safety guidelines.
               </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

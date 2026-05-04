"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    category: "",
    pickupStartTime: "",
    pickupEndTime: "",
    photoUrl: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "submitting" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Helper to format Date string to datetime-local input format (YYYY-MM-DDThh:mm)
  const formatForInput = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    // Adjust for local timezone offset
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listing details.");
        }
        const data = await response.json();
        const listing = data.listing;
        
        if (listing.status !== "available") {
          throw new Error("Only available listings can be edited.");
        }

        setFormData({
          foodName: listing.foodName || "",
          quantity: listing.quantity || "",
          category: listing.category || "",
          pickupStartTime: formatForInput(listing.pickupStartTime),
          pickupEndTime: formatForInput(listing.pickupEndTime),
          photoUrl: listing.photoUrl || "",
        });
        setStatus("idle");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message);
      }
    }
    fetchListing();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update listing");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

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
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Updated!</h2>
             <p className="text-slate-500 leading-relaxed font-medium">Your listing has been updated successfully.</p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => router.push("/donor")}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20"
            >
              Go to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-6">
      <div className="mb-4">
        <Link href="/donor" className="text-slate-400 hover:text-amber-600 flex items-center font-bold text-xs uppercase tracking-widest transition-all group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Overview
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-slate-100 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Edit Listing</h1>
            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">Update your surplus food details for the community.</p>
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
                  Item Description
                </label>
                <input
                  id="foodName"
                  name="foodName"
                  type="text"
                  required
                  value={formData.foodName}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
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
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
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
                  <option value="Bakery & Pastries">Bakery & Pastries</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
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
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-800"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="pt-6">
               <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full h-16 bg-slate-900 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-900/10 hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
               >
                  {status === "submitting" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                       Save Changes
                    </>
                  )}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

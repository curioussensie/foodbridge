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
      <div className="p-6 lg:p-20 flex flex-col items-center justify-center min-h-[80vh] font-['Inter']">
        <div className="bg-white max-w-md w-full p-12 rounded-[16px] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] border border-[#dbe3ed] text-center space-y-8">
          <div className="w-20 h-20 bg-[rgba(38,133,73,0.1)] text-[#006a34] rounded-[12px] flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
             <h2 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-2">Success!</h2>
             <p className="text-[#6f7a6f] text-[14px] leading-relaxed font-medium">Your donation is now live and waiting for a recipient to claim it.</p>
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
              className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[14px]"
            >
              Post Another Item
            </button>
            <button
              onClick={() => router.push("/donor")}
              className="w-full h-[48px] bg-[#f7f9ff] border border-[#dbe3ed] hover:bg-[#e7eff9] text-[#3f4940] font-semibold rounded-[8px] transition-colors text-[14px]"
            >
              Go to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto font-['Inter']">
      <div className="bg-white rounded-[16px] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] border border-[#dbe3ed] overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="mb-12 text-center">
            <h1 className="text-[32px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] tracking-tight mb-3">Post a Donation</h1>
            <p className="text-[#6f7a6f] text-[14px] font-medium leading-relaxed max-w-md mx-auto">Help reduce food waste by sharing your surplus items with those in need.</p>
          </div>

          {status === "error" && (
            <div className="mb-10 p-4 bg-[rgba(212,62,48,0.1)] border border-[#d43e30]/20 text-[#b1241a] rounded-[8px] font-semibold text-[14px] text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="foodName">
                  What are you donating?
                </label>
                <input
                  id="foodName"
                  name="foodName"
                  type="text"
                  required
                  value={formData.foodName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                  placeholder="e.g. 10 Loaves of Fresh Sourdough"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                  placeholder="e.g. 5 kg or 10 boxes"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] text-[14px]"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 pt-2">
                 <h3 className="text-[14px] font-semibold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[rgba(254,165,32,0.2)] text-[#865300] rounded-[6px] flex items-center justify-center">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    Collection Window
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-[#dbe3ed] bg-[#f7f9ff] rounded-[8px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="pickupStartTime">
                        Starts From
                      </label>
                      <input
                        id="pickupStartTime"
                        name="pickupStartTime"
                        type="datetime-local"
                        required
                        value={formData.pickupStartTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] text-[14px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="pickupEndTime">
                        Ends At
                      </label>
                      <input
                        id="pickupEndTime"
                        name="pickupEndTime"
                        type="datetime-local"
                        required
                        value={formData.pickupEndTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] text-[14px]"
                      />
                    </div>
                 </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-[#3f4940] uppercase tracking-[0.6px] mb-2" htmlFor="photoUrl">
                  Photo URL <span className="text-[#8a968a] font-normal lowercase">(Optional)</span>
                </label>
                <input
                  id="photoUrl"
                  name="photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] placeholder:text-[#8a968a] text-[14px]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#dbe3ed]">
               <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-all shadow-[0px_4px_10px_rgba(0,106,52,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 text-[16px]"
               >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                       Confirm & Post Listing
                    </>
                  )}
               </button>
               <p className="text-center text-[12px] text-[#6f7a6f] font-medium mt-4">
                  By posting, you agree to our food safety guidelines.
               </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

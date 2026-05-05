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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006a34]"></div>
      </div>
    );
  }

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
             <h2 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] mb-2">Updated!</h2>
             <p className="text-[#6f7a6f] text-[14px] leading-relaxed font-medium">Your listing has been updated successfully.</p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => router.push("/donor")}
              className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)] text-[14px]"
            >
              Go to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-6 font-['Inter']">
      <div className="mb-4">
        <Link href="/donor" className="text-[#6f7a6f] hover:text-[#006a34] flex items-center font-semibold text-[12px] uppercase tracking-wider transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Overview
        </Link>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] border border-[#dbe3ed] overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="mb-12 text-center">
            <h1 className="text-[32px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans'] tracking-tight mb-3">Edit Listing</h1>
            <p className="text-[#6f7a6f] text-[14px] font-medium leading-relaxed max-w-md mx-auto">Update your surplus food details for the community.</p>
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
                  Item Description
                </label>
                <input
                  id="foodName"
                  name="foodName"
                  type="text"
                  required
                  value={formData.foodName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] text-[14px]"
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
                  className="w-full px-4 py-3 bg-[#f7f9ff] border border-[#dbe3ed] rounded-[8px] focus:border-[#006a34] focus:ring-2 focus:ring-[rgba(38,133,73,0.3)] outline-none transition-all font-medium text-[#151c23] text-[14px]"
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
                  <option value="Bakery & Pastries">Bakery & Pastries</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
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
                  disabled={status === "submitting"}
                  className="w-full h-[48px] bg-[#006a34] hover:bg-[#00552a] text-white font-semibold rounded-[8px] transition-colors shadow-[0px_4px_10px_rgba(0,106,52,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 text-[16px]"
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

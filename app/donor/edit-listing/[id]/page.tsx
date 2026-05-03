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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Listing Updated!</h2>
          <p className="text-slate-500 text-lg">Your changes have been saved successfully.</p>
          <button
            onClick={() => router.push("/donor/dashboard")}
            className="inline-block mt-4 w-full min-h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 py-8">
      <div className="w-full max-w-xl mb-4">
        <Link href="/donor/dashboard" className="text-slate-500 hover:text-slate-700 flex items-center font-medium transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white max-w-xl w-full p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Edit Listing</h1>
          <p className="text-slate-500">Update the details of your available surplus food.</p>
        </div>

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="foodName">
                Food Name / Description
              </label>
              <input
                id="foodName"
                name="foodName"
                type="text"
                required
                value={formData.foodName}
                onChange={handleChange}
                className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                >
                  <option value="" disabled>Select category</option>
                  <option value="Bakery">Bakery & Pastries</option>
                  <option value="Produce">Fresh Produce</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pickupStartTime">
                  Pickup Start Time
                </label>
                <input
                  id="pickupStartTime"
                  name="pickupStartTime"
                  type="datetime-local"
                  required
                  value={formData.pickupStartTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pickupEndTime">
                  Pickup End Time
                </label>
                <input
                  id="pickupEndTime"
                  name="pickupEndTime"
                  type="datetime-local"
                  required
                  value={formData.pickupEndTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="photoUrl">
                Photo URL (Optional)
              </label>
              <input
                id="photoUrl"
                name="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full min-h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {status === "submitting" ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

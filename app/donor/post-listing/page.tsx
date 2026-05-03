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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Listing Posted!</h2>
          <p className="text-slate-500 text-lg">Your food listing is now available for recipients to claim.</p>
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
            className="inline-block mt-4 w-full min-h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none"
          >
            Post Another Listing
          </button>
          <button
            onClick={() => router.push("/donor/dashboard")}
            className="inline-block mt-2 w-full min-h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white max-w-xl w-full p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Post a Food Listing</h1>
          <p className="text-slate-500">Share your surplus food with the community.</p>
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
                placeholder="e.g. 10 Loaves of Sourdough Bread"
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
                  placeholder="e.g. 5 kg or 10 boxes"
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full min-h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {status === "loading" ? "Posting..." : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

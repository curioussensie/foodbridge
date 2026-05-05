"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { _id: string; name: string; active: boolean };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.status === 401 || res.status === 403) { router.push("/login"); return; }
        if (!res.ok) throw new Error("Failed to load categories.");
        const data = await res.json();
        setCategories(data.categories);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleAdd = async () => {
    if (!newName.trim()) { setAddError("Name is required."); return; }
    setAdding(true); setAddError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add.");
      setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (e: any) {
      setAddError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) { setEditError("Name cannot be empty."); return; }
    setProcessingId(id); setEditError("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rename.");
      setCategories((prev) =>
        prev.map((c) => c._id === id ? { ...c, name: data.category.name } : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to update.");
      setCategories((prev) =>
        prev.map((c) => c._id === id ? { ...c, active: !currentActive } : c)
      );
    } catch (e: any) {
      alert(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 py-8 font-['Inter']">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#e7eff9] rounded-[8px] flex items-center justify-center text-[#151c23]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#151c23] font-['Plus_Jakarta_Sans']">Category Management</h1>
              <p className="text-[#6f7a6f] text-[14px] mt-0.5">Add, rename, or deactivate food categories.</p>
            </div>
          </div>

          {/* Add new */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setAddError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="New category name..."
              className="flex-1 border border-[#dbe3ed] rounded-[8px] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)]"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="px-5 py-2.5 bg-[#006a34] hover:bg-[#00552a] text-white text-[14px] font-semibold rounded-[8px] transition-colors disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
          {addError && <p className="text-[#b1241a] text-[12px] mb-4">{addError}</p>}
        </div>

        {loading ? (
          <div className="flex justify-center p-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006a34]" /></div>
        ) : error ? (
          <div className="p-4 bg-[rgba(212,62,48,0.1)] text-[#b1241a] rounded-[12px] border border-[#d43e30]/20">{error}</div>
        ) : (
          <div className="bg-white rounded-[12px] border border-[#dbe3ed] shadow-[0px_4px_10px_rgba(0,106,52,0.04)] overflow-hidden">
            <div className="px-6 py-3 bg-[#f7f9ff] border-b border-[#dbe3ed] text-[12px] uppercase tracking-wider font-semibold text-[#6f7a6f] flex justify-between">
              <span>Category</span>
              <span>{categories.length} total · {categories.filter(c => c.active).length} active</span>
            </div>
            <ul className="divide-y divide-[#dbe3ed]">
              {categories.map((cat) => (
                <li key={cat._id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#f7f9ff] transition-colors">
                  {editingId === cat._id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(cat._id)}
                        autoFocus
                        className="flex-1 border border-[#006a34] rounded-[6px] px-3 py-1.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[rgba(38,133,73,0.3)]"
                      />
                      <button onClick={() => handleRename(cat._id)} disabled={processingId === cat._id} className="text-[12px] font-semibold px-3 py-1.5 bg-[#006a34] text-white rounded-[6px] hover:bg-[#00552a] disabled:opacity-50">Save</button>
                      <button onClick={() => { setEditingId(null); setEditError(""); }} className="text-[12px] font-semibold px-3 py-1.5 bg-[#f7f9ff] border border-[#dbe3ed] text-[#3f4940] rounded-[6px] hover:bg-[#e7eff9]">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className={`flex-1 text-[14px] font-medium ${cat.active ? "text-[#151c23]" : "text-[#8a968a] line-through"}`}>
                        {cat.name}
                      </span>
                      {!cat.active && <span className="text-[10px] text-[#865300] font-semibold bg-[rgba(254,165,32,0.1)] px-2 py-0.5 rounded-[4px] uppercase tracking-wider">Inactive</span>}
                      <button
                        onClick={() => { setEditingId(cat._id); setEditName(cat.name); setEditError(""); }}
                        className="text-[12px] font-semibold px-3 py-1.5 bg-[#f7f9ff] border border-[#dbe3ed] text-[#3f4940] hover:bg-[#e7eff9] rounded-[6px] transition-colors"
                      >Rename</button>
                      <button
                        onClick={() => handleToggle(cat._id, cat.active)}
                        disabled={processingId === cat._id}
                        className={`text-[12px] font-semibold px-3 py-1.5 rounded-[6px] transition-colors disabled:opacity-50 ${cat.active ? "bg-[rgba(254,165,32,0.1)] text-[#865300] hover:bg-[rgba(254,165,32,0.2)]" : "bg-[rgba(38,133,73,0.1)] text-[#006a34] hover:bg-[rgba(38,133,73,0.2)]"}`}
                      >
                        {cat.active ? "Deactivate" : "Activate"}
                      </button>
                    </>
                  )}
                  {editError && editingId === cat._id && <p className="text-[#b1241a] text-[12px] mt-1">{editError}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

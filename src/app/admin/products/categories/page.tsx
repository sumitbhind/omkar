"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, FolderOpen, ToggleLeft, ToggleRight } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type EditState = { name: string; description: string; order: number };

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", description: "", order: 0 });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getCategories()
      .then((r) => setCats(r.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setSaving(true); setErr("");
    try {
      const r = await createCategory(name, slugify(name));
      setCats((prev) => [...prev, r.data]);
      setNewName(""); setNewDesc(""); setAdding(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (cat: Category) => {
    setSaving(true); setErr("");
    try {
      const r = await updateCategory(cat._id, {
        name: editState.name.trim(),
        slug: slugify(editState.name.trim()),
        description: editState.description.trim(),
        order: editState.order,
      });
      setCats((prev) => prev.map((c) => (c._id === cat._id ? r.data : c)));
      setEditId(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      const r = await updateCategory(cat._id, { isActive: !cat.isActive });
      setCats((prev) => prev.map((c) => (c._id === cat._id ? r.data : c)));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`"${cat.name}" aur iske saare Sub Categories + Products permanently delete ho jayenge.\n\nSure ho?`)) return;
    setDeletingId(cat._id);
    try {
      await deleteCategory(cat._id);
      setCats((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">{cats.length} categories total</p>
        </div>
        <button
          onClick={() => { setAdding((v) => !v); setNewName(""); setNewDesc(""); setErr(""); }}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
            adding ? "bg-gray-100 text-gray-600" : "bg-[#f26b31] hover:bg-[#d85720] text-white"
          }`}
        >
          {adding ? <X size={15} /> : <Plus size={15} />}
          {adding ? "Cancel" : "Add Category"}
        </button>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-[#f26b31]/30 shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">New Category</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name *"
                required autoFocus
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
              />
              {newName && <p className="text-xs text-gray-400 mt-1 pl-1">slug: {slugify(newName)}</p>}
            </div>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !newName.trim()}
              className="flex items-center gap-1.5 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
            >
              <Check size={14} /> {saving ? "Creating…" : "Create Category"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
        ) : cats.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Koi category nahi hai. Pehli category add karo.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cats.map((cat) =>
                editId === cat._id ? (
                  <tr key={cat._id} className="bg-orange-50/40">
                    <td className="px-5 py-3" colSpan={3}>
                      <div className="flex gap-2 flex-wrap">
                        <input
                          value={editState.name}
                          onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                          placeholder="Name"
                          className="border border-[#f26b31] rounded-lg px-3 py-1.5 text-sm focus:outline-none flex-1 min-w-[150px]"
                        />
                        <input
                          value={editState.description}
                          onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                          placeholder="Description"
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none flex-1 min-w-[150px]"
                        />
                        <input
                          type="number"
                          value={editState.order}
                          onChange={(e) => setEditState((s) => ({ ...s, order: Number(e.target.value) }))}
                          placeholder="Order"
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none w-20"
                        />
                      </div>
                      {editState.name && (
                        <p className="text-xs text-gray-400 mt-1 pl-1">slug: {slugify(editState.name)}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center" />
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditSave(cat)}
                          disabled={saving}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
                        >
                          <Check size={12} /> Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="flex items-center gap-1 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <FolderOpen size={14} className="text-[#f26b31]" />
                        </div>
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{cat.slug}</code>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-500 text-xs max-w-[200px] truncate">
                      {cat.description || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button onClick={() => handleToggle(cat)} title={cat.isActive ? "Active" : "Inactive"}>
                        {cat.isActive
                          ? <ToggleRight size={22} className="text-green-500" />
                          : <ToggleLeft size={22} className="text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditId(cat._id);
                            setEditState({ name: cat.name, description: cat.description, order: cat.order });
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat._id}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

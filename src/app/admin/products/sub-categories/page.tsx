"use client";

import { useEffect, useState } from "react";
import {
  getCategories,
  getProductGroups,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, Layers, ToggleLeft, ToggleRight, ChevronDown } from "lucide-react";

interface Category { _id: string; name: string; slug: string }
interface Group { _id: string; name: string; slug: string; category: string; pageTitle: string; order: number; isActive: boolean }

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function SubCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState({ name: "", pageTitle: "", order: 0 });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  // Load categories
  useEffect(() => {
    getCategories().then((r) => {
      const list = r.data ?? [];
      setCats(list);
      if (list.length > 0) setNewCatId(list[0]._id);
    });
  }, []);

  // Load groups when filter changes
  useEffect(() => {
    setLoading(true);
    getProductGroups(filterCat || undefined)
      .then((r) => setGroups(r.data ?? []))
      .finally(() => setLoading(false));
  }, [filterCat]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !newCatId) return;
    setSaving(true); setErr("");
    try {
      const r = await createProductGroup(name, slugify(name), newCatId, newPageTitle.trim() || name);
      setGroups((prev) => [...prev, r.data]);
      setNewName(""); setNewPageTitle(""); setAdding(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (g: Group) => {
    setSaving(true); setErr("");
    try {
      const r = await updateProductGroup(g._id, {
        name: editState.name.trim(),
        slug: slugify(editState.name.trim()),
        pageTitle: editState.pageTitle.trim(),
        order: editState.order,
      });
      setGroups((prev) => prev.map((x) => (x._id === g._id ? r.data : x)));
      setEditId(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (g: Group) => {
    try {
      const r = await updateProductGroup(g._id, { isActive: !g.isActive });
      setGroups((prev) => prev.map((x) => (x._id === g._id ? r.data : x)));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  };

  const handleDelete = async (g: Group) => {
    if (!confirm(`"${g.name}" aur iske saare Products permanently delete ho jayenge.\n\nSure ho?`)) return;
    setDeletingId(g._id);
    try {
      await deleteProductGroup(g._id);
      setGroups((prev) => prev.filter((x) => x._id !== g._id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setDeletingId(null);
    }
  };

  const catMap = Object.fromEntries(cats.map((c) => [c._id, c.name]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sub Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">{groups.length} sub categories</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Category filter */}
          <div className="relative">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-sm focus:outline-none focus:border-[#f26b31]"
            >
              <option value="">All Categories</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => { setAdding((v) => !v); setNewName(""); setNewPageTitle(""); setErr(""); }}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              adding ? "bg-gray-100 text-gray-600" : "bg-[#f26b31] hover:bg-[#d85720] text-white"
            }`}
          >
            {adding ? <X size={15} /> : <Plus size={15} />}
            {adding ? "Cancel" : "Add Sub Category"}
          </button>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-[#f26b31]/30 shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">New Sub Category</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <select
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                required
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-sm focus:outline-none focus:border-[#f26b31]"
              >
                <option value="">— Category select karo *</option>
                {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Sub category name *"
                required autoFocus
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
              />
              {newName && <p className="text-xs text-gray-400 mt-1 pl-1">slug: {slugify(newName)}</p>}
            </div>
            <input
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Page title (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !newName.trim() || !newCatId}
              className="flex items-center gap-1.5 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
            >
              <Check size={14} /> {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="py-16 text-center">
            <Layers size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Koi sub category nahi hai.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((g) =>
                editId === g._id ? (
                  <tr key={g._id} className="bg-orange-50/40">
                    <td className="px-5 py-3" colSpan={3}>
                      <div className="flex gap-2 flex-wrap">
                        <input
                          value={editState.name}
                          onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                          placeholder="Name"
                          className="border border-[#f26b31] rounded-lg px-3 py-1.5 text-sm focus:outline-none flex-1 min-w-[140px]"
                        />
                        <input
                          value={editState.pageTitle}
                          onChange={(e) => setEditState((s) => ({ ...s, pageTitle: e.target.value }))}
                          placeholder="Page title"
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none flex-1 min-w-[140px]"
                        />
                        <input
                          type="number"
                          value={editState.order}
                          onChange={(e) => setEditState((s) => ({ ...s, order: Number(e.target.value) }))}
                          placeholder="Order"
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none w-20"
                        />
                      </div>
                      {editState.name && <p className="text-xs text-gray-400 mt-1 pl-1">slug: {slugify(editState.name)}</p>}
                    </td>
                    <td className="px-3 py-3 text-center" />
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditSave(g)}
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
                  <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                          <Layers size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{g.name}</p>
                          {g.pageTitle && g.pageTitle !== g.name && (
                            <p className="text-xs text-gray-400">{g.pageTitle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        {catMap[g.category] ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{g.slug}</code>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button onClick={() => handleToggle(g)}>
                        {g.isActive
                          ? <ToggleRight size={22} className="text-green-500" />
                          : <ToggleLeft size={22} className="text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditId(g._id);
                            setEditState({ name: g.name, pageTitle: g.pageTitle, order: g.order });
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          disabled={deletingId === g._id}
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

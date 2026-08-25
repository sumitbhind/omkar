"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getCategories,
  getProductGroups,
  getProductsByGroup,
  deleteProduct,
  createCategory,
  deleteCategory,
  createProductGroup,
  deleteProductGroup,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2, ChevronDown, Package, X, Check } from "lucide-react";
import { toast, confirmDialog } from "@/lib/toast";

interface Category { _id: string; name: string; slug: string }
interface Group    { _id: string; name: string; slug: string }
interface Product  { _id: string; name: string; image: string; features: string[]; isActive: boolean }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [categories,   setCategories]   = useState<Category[]>([]);
  const [groups,       setGroups]       = useState<Group[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [catId,        setCatId]        = useState("");
  const [catSlug,      setCatSlug]      = useState("");
  const [groupSlug,    setGroupSlug]    = useState("");
  const [loading,      setLoading]      = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);

  const [addingCat,    setAddingCat]    = useState(false);
  const [addingGroup,  setAddingGroup]  = useState(false);
  const [newCatName,   setNewCatName]   = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [saving,       setSaving]       = useState(false);

  // Restore from URL params on mount
  useEffect(() => {
    const urlCatSlug   = searchParams.get("catSlug")   ?? "";
    const urlGroupSlug = searchParams.get("groupSlug") ?? "";

    getCategories().then((r) => {
      const cats: Category[] = r.data ?? [];
      setCategories(cats);
      if (urlCatSlug) {
        const matched = cats.find((c) => c.slug === urlCatSlug);
        if (matched) {
          setCatId(matched._id);
          setCatSlug(matched.slug);
          if (urlGroupSlug) setGroupSlug(urlGroupSlug);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load groups when category changes
  useEffect(() => {
    if (!catId) { setGroups([]); setGroupSlug(""); return; }
    getProductGroups(catId).then((r) => setGroups(r.data ?? []));
  }, [catId]);

  // Load products when group selected
  const loadProducts = useCallback(async () => {
    if (!catSlug || !groupSlug) { setProducts([]); return; }
    setLoading(true);
    try {
      const r = await getProductsByGroup(catSlug, groupSlug);
      setProducts(r.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [catSlug, groupSlug]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Category handlers ────────────────────────────────────────────────────────
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id  = e.target.value;
    const cat = categories.find((c) => c._id === id);
    setCatId(id);
    setCatSlug(cat?.slug ?? "");
    setGroupSlug("");
    setProducts([]);
    setAddingGroup(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const r = await createCategory(name, slugify(name));
      const c: Category = r.data;
      setCategories((prev) => [...prev, c]);
      setCatId(c._id);
      setCatSlug(c.slug);
      setGroupSlug("");
      setGroups([]);
      setProducts([]);
      setNewCatName("");
      setAddingCat(false);
      toast.success("Category create ho gayi!", c.name);
    } catch (err: unknown) {
      toast.error("Category create nahi ho sakki", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    const cat = categories.find((c) => c._id === catId);
    if (!cat) return;
    const ok = await confirmDialog(
      "Category Delete Karo",
      `"${cat.name}" category aur iske SARE groups aur products permanently delete ho jayenge.`
    );
    if (!ok) return;
    try {
      await deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c._id !== catId));
      setCatId(""); setCatSlug(""); setGroupSlug(""); setGroups([]); setProducts([]);
      toast.success("Category delete ho gayi");
    } catch (err: unknown) {
      toast.error("Category delete nahi ho sakki", err instanceof Error ? err.message : undefined);
    }
  };

  // ── Group handlers ────────────────────────────────────────────────────────────
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name || !catId) return;
    setSaving(true);
    try {
      const r = await createProductGroup(name, slugify(name), catId, name);
      const g: Group = r.data;
      setGroups((prev) => [...prev, g]);
      setGroupSlug(g.slug);
      setNewGroupName("");
      setAddingGroup(false);
      toast.success("Sub-category create ho gayi!", g.name);
    } catch (err: unknown) {
      toast.error("Sub-category create nahi ho sakki", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    const group = groups.find((g) => g.slug === groupSlug);
    if (!group) return;
    const ok = await confirmDialog(
      "Sub-category Delete Karo",
      `"${group.name}" group aur iske SARE products permanently delete ho jayenge.`
    );
    if (!ok) return;
    try {
      await deleteProductGroup(group._id);
      setGroups((prev) => prev.filter((g) => g._id !== group._id));
      setGroupSlug(""); setProducts([]);
      toast.success("Sub-category delete ho gayi");
    } catch (err: unknown) {
      toast.error("Sub-category delete nahi ho sakki", err instanceof Error ? err.message : undefined);
    }
  };

  // ── Product delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    const ok = await confirmDialog("Product Delete Karo", `"${name}" permanently delete ho jayega.`, "Haan, Delete Karo");
    if (!ok) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product delete ho gaya");
    } catch (err: unknown) {
      toast.error("Delete nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(null);
    }
  };

  const selectedGroup = groups.find((g) => g.slug === groupSlug);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-outfit">Products</h2>
        {selectedGroup && (
          <Link
            href={`/admin/products/new?groupId=${selectedGroup._id}&catSlug=${catSlug}&groupSlug=${groupSlug}`}
            className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">

        {/* ── Category row ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={catId}
              onChange={handleCategoryChange}
              className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-8 focus:outline-none focus:border-[#f26b31]"
            >
              <option value="">— Select Category —</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {catId && (
            <button
              onClick={handleDeleteCategory}
              title="Delete this category"
              className="px-3 py-2.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            onClick={() => { setAddingCat((v) => !v); setNewCatName(""); }}
            title={addingCat ? "Cancel" : "Add new category"}
            className={`px-3 py-2.5 border rounded-lg transition-colors ${
              addingCat
                ? "bg-gray-100 border-gray-300 text-gray-600"
                : "border-[#f26b31] text-[#f26b31] hover:bg-orange-50"
            }`}
          >
            {addingCat ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {/* Add category form */}
        {addingCat && (
          <form onSubmit={handleCreateCategory} className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name (e.g. Power Products)"
                required
                autoFocus
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
              />
              {newCatName && (
                <p className="text-xs text-gray-400 mt-0.5 pl-1">slug: {slugify(newCatName)}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || !newCatName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold rounded-lg whitespace-nowrap"
            >
              <Check size={13} /> {saving ? "Creating…" : "Create"}
            </button>
          </form>
        )}

        {/* ── Group row ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={groupSlug}
              onChange={(e) => setGroupSlug(e.target.value)}
              disabled={!catId}
              className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-8 focus:outline-none focus:border-[#f26b31] disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Select Product Group —</option>
              {groups.map((g) => (
                <option key={g._id} value={g.slug}>{g.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {groupSlug && (
            <button
              onClick={handleDeleteGroup}
              title="Delete this group"
              className="px-3 py-2.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            onClick={() => { setAddingGroup((v) => !v); setNewGroupName(""); }}
            disabled={!catId}
            title={addingGroup ? "Cancel" : "Add new product group"}
            className={`px-3 py-2.5 border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              addingGroup
                ? "bg-gray-100 border-gray-300 text-gray-600"
                : "border-[#f26b31] text-[#f26b31] hover:bg-orange-50"
            }`}
          >
            {addingGroup ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {/* Add group form */}
        {addingGroup && catId && (
          <form onSubmit={handleCreateGroup} className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. Air Circuit Breaker)"
                required
                autoFocus
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
              />
              {newGroupName && (
                <p className="text-xs text-gray-400 mt-0.5 pl-1">slug: {slugify(newGroupName)}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || !newGroupName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold rounded-lg whitespace-nowrap"
            >
              <Check size={13} /> {saving ? "Creating…" : "Create"}
            </button>
          </form>
        )}
      </div>

      {/* Product list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {!groupSlug ? null : loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Koi product nahi mila.{" "}
            {selectedGroup && (
              <Link
                href={`/admin/products/new?groupId=${selectedGroup._id}&catSlug=${catSlug}&groupSlug=${groupSlug}`}
                className="text-[#f26b31] hover:underline"
              >
                Pehla product add karo →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {products.map((p) => (
              <div key={p._id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.features.length} features</p>
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {p.isActive ? "Active" : "Hidden"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/products/${p._id}?catSlug=${catSlug}&groupSlug=${groupSlug}`}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    disabled={deleting === p._id}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

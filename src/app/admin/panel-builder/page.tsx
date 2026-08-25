"use client";

import { useEffect, useState } from "react";
import { toast, confirmDialog } from "@/lib/toast";
import {
  getPanelSections,
  createPanelSection,
  deletePanelSection,
  getAllPanelItemsAdmin,
  createPanelItem,
  updatePanelItem,
  deletePanelItem,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, Layers } from "lucide-react";

interface PanelSection { _id: string; name: string; slug: string; order: number }
interface PanelItem {
  _id: string; title: string; description: string;
  section: string; order: number; isActive: boolean;
}
interface EditForm { title: string; description: string; order: number; isActive: boolean }

const EMPTY_ADD  = { title: "", description: "", order: 0 };
const EMPTY_EDIT: EditForm = { title: "", description: "", order: 0, isActive: true };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function PanelBuilderPage() {
  // ── Sections state ──────────────────────────────────────────────────────────
  const [sections,        setSections]        = useState<PanelSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [activeSection,   setActiveSection]   = useState<PanelSection | null>(null);

  const [addingSec,    setAddingSec]    = useState(false);
  const [secName,      setSecName]      = useState("");
  const [secSlug,      setSecSlug]      = useState("");
  const [secOrder,     setSecOrder]     = useState(0);
  const [secSaving,    setSecSaving]    = useState(false);
  const [deletingSec,  setDeletingSec]  = useState<string | null>(null);

  // ── Items state ─────────────────────────────────────────────────────────────
  const [items,     setItems]     = useState<PanelItem[]>([]);
  const [loading,   setLoading]   = useState(false);

  const [adding,    setAdding]    = useState(false);
  const [addForm,   setAddForm]   = useState(EMPTY_ADD);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm,  setEditForm]  = useState<EditForm>(EMPTY_EDIT);

  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  // ── Load sections on mount ──────────────────────────────────────────────────
  useEffect(() => {
    setSectionsLoading(true);
    getPanelSections()
      .then((r) => {
        const list: PanelSection[] = r.data ?? [];
        setSections(list);
        if (list.length > 0) setActiveSection(list[0]);
      })
      .catch(() => {})
      .finally(() => setSectionsLoading(false));
  }, []);

  // ── Load items when active section changes ──────────────────────────────────
  useEffect(() => {
    if (!activeSection) { setItems([]); return; }
    setLoading(true);
    setAdding(false);
    setEditingId(null);
    getAllPanelItemsAdmin(activeSection.slug)
      .then((r) => setItems(r.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeSection]);

  // ── Add Section ─────────────────────────────────────────────────────────────
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim() || !secSlug.trim()) return;
    setSecSaving(true);
    try {
      const r = await createPanelSection(secName.trim(), secSlug.trim(), secOrder);
      const newSec: PanelSection = r.data;
      setSections((prev) => [...prev, newSec]);
      setActiveSection(newSec);
      setSecName(""); setSecSlug(""); setSecOrder(0); setAddingSec(false);
      toast.success("Section create ho gaya!", newSec.name);
    } catch (err: unknown) {
      toast.error("Section create nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally { setSecSaving(false); }
  };

  // ── Delete Section ──────────────────────────────────────────────────────────
  const handleDeleteSection = async (sec: PanelSection) => {
    const ok = await confirmDialog(
      "Section Delete Karo",
      `"${sec.name}" section aur uske saare items permanently delete ho jayenge.`
    );
    if (!ok) return;
    setDeletingSec(sec._id);
    try {
      await deletePanelSection(sec._id);
      setSections((prev) => prev.filter((s) => s._id !== sec._id));
      if (activeSection?._id === sec._id) {
        const remaining = sections.filter((s) => s._id !== sec._id);
        setActiveSection(remaining.length > 0 ? remaining[0] : null);
      }
      toast.success("Section delete ho gaya");
    } catch (err: unknown) {
      toast.error("Delete nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally { setDeletingSec(null); }
  };

  // ── Add Item ─────────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim() || !activeSection) return;
    setSaving(true);
    try {
      const r = await createPanelItem({ ...addForm, section: activeSection.slug });
      setItems((prev) => [...prev, r.data]);
      setAddForm(EMPTY_ADD); setAdding(false);
      toast.success("Item add ho gaya!", r.data.title);
    } catch (err: unknown) {
      toast.error("Item add nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally { setSaving(false); }
  };

  // ── Edit Item ─────────────────────────────────────────────────────────────────
  const startEdit = (item: PanelItem) => {
    setEditingId(item._id);
    setEditForm({ title: item.title, description: item.description, order: item.order, isActive: item.isActive });
    setAdding(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.title.trim()) return;
    setSaving(true);
    try {
      const r = await updatePanelItem(editingId, editForm);
      setItems((prev) => prev.map((i) => i._id === editingId ? r.data : i));
      setEditingId(null);
      toast.success("Item update ho gaya!");
    } catch (err: unknown) {
      toast.error("Update nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally { setSaving(false); }
  };

  // ── Delete Item ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, title: string) => {
    const ok = await confirmDialog("Item Delete Karo", `"${title}" permanently delete ho jayega.`, "Haan, Delete Karo");
    if (!ok) return;
    setDeleting(id);
    try {
      await deletePanelItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Item delete ho gaya");
    } catch (err: unknown) {
      toast.error("Delete nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally { setDeleting(null); }
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] transition";

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 font-outfit flex items-center gap-2">
          <Layers size={20} className="text-[#f26b31]" /> Panel Builder
        </h2>
        <div className="flex gap-2">
          {!addingSec && (
            <button
              onClick={() => { setAddingSec(true); setSecName(""); setSecSlug(""); setSecOrder(sections.length); }}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} /> New Section
            </button>
          )}
          {!adding && activeSection && (
            <button
              onClick={() => { setAdding(true); setEditingId(null); setAddForm(EMPTY_ADD); }}
              className="flex items-center gap-1.5 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} /> Add Item
            </button>
          )}
        </div>
      </div>

      {/* Add Section form */}
      {addingSec && (
        <form onSubmit={handleAddSection} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">New Section</p>
          <div className="flex gap-3">
            <input
              value={secName}
              onChange={(e) => { setSecName(e.target.value); setSecSlug(slugify(e.target.value)); }}
              placeholder="Section name (e.g. Solar Products)"
              required
              autoFocus
              className={inp}
            />
            <input
              value={secSlug}
              onChange={(e) => setSecSlug(slugify(e.target.value))}
              placeholder="slug (auto)"
              required
              className={`${inp} w-48`}
            />
            <input
              type="number"
              value={secOrder}
              onChange={(e) => setSecOrder(Number(e.target.value))}
              placeholder="Order"
              title="Display order"
              className={`${inp} w-20`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={secSaving || !secName.trim() || !secSlug.trim()}
              className="flex items-center gap-1.5 px-5 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Check size={13} /> {secSaving ? "Saving…" : "Create Section"}
            </button>
            <button type="button" onClick={() => setAddingSec(false)} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
              <X size={14} />
            </button>
          </div>
        </form>
      )}

      {sectionsLoading ? (
        <p className="text-center text-gray-400 text-sm py-16">Loading sections…</p>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">
          Koi section nahi hai.{" "}
          <button onClick={() => setAddingSec(true)} className="text-[#f26b31] hover:underline">
            Pehla section banao →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Section tabs */}
          <div className="flex border-b overflow-x-auto">
            {sections.map((sec) => (
              <div key={sec._id} className="relative group/tab flex-shrink-0">
                <button
                  onClick={() => setActiveSection(sec)}
                  className={`px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection?._id === sec._id
                      ? "border-b-2 border-[#f26b31] text-[#f26b31] bg-orange-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {sec.name}
                </button>
                {/* Delete section button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec); }}
                  disabled={deletingSec === sec._id}
                  title={`"${sec.name}" section delete karo`}
                  className="absolute top-1 right-1 opacity-0 group-hover/tab:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Add item form */}
          {adding && activeSection && (
            <form onSubmit={handleAdd} className="p-4 border-b bg-orange-50/30 space-y-3">
              <p className="text-xs font-semibold text-[#f26b31] uppercase tracking-wide">
                New Item — {activeSection.name}
              </p>
              <input
                value={addForm.title}
                onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title (e.g. Power Control Centre)"
                required autoFocus className={inp}
              />
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={3}
                className={`${inp} resize-none`}
              />
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={addForm.order}
                  onChange={(e) => setAddForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  placeholder="Order"
                  title="Display order (lower = first)"
                  className={`${inp} w-24`}
                />
                <button
                  type="submit"
                  disabled={saving || !addForm.title.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Check size={13} /> {saving ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setAdding(false)} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </form>
          )}

          {/* Items list */}
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-16">Loading…</p>
          ) : items.length === 0 && !adding ? (
            <p className="text-center text-gray-400 text-sm py-16">
              Koi item nahi hai.{" "}
              <button onClick={() => setAdding(true)} className="text-[#f26b31] hover:underline">
                Pehla item add karo →
              </button>
            </p>
          ) : (
            <div className="divide-y">
              {items.map((item) =>
                editingId === item._id ? (
                  <form key={item._id} onSubmit={handleUpdate} className="p-4 bg-blue-50/30 space-y-3">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Editing</p>
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Title" required autoFocus className={inp}
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Description (optional)" rows={3}
                      className={`${inp} resize-none`}
                    />
                    <div className="flex gap-3 items-center flex-wrap">
                      <input
                        type="number"
                        value={editForm.order}
                        onChange={(e) => setEditForm((f) => ({ ...f, order: Number(e.target.value) }))}
                        placeholder="Order" title="Display order" className={`${inp} w-24`}
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                          className="accent-[#f26b31] w-4 h-4"
                        />
                        Site par dikhao (Active)
                      </label>
                      <button
                        type="submit" disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <Check size={13} /> {saving ? "Saving…" : "Update"}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div key={item._id} className={`flex items-start gap-4 px-5 py-4 ${!item.isActive ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                        {!item.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">Hidden</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        disabled={deleting === item._id}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

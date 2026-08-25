"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Zap } from "lucide-react";
import { getPopups, createPopup, updatePopup, deletePopup, uploadImage, type Popup } from "@/lib/adminApi";
import Swal from "sweetalert2";

type PopupType = Popup["type"];

const TYPE_LABELS: Record<PopupType, string> = {
  announcement:  "Announcement",
  discount:      "Discount / Offer",
  newsletter:    "Newsletter Subscribe",
  "exit-intent": "Exit Intent",
};

const TYPE_COLORS: Record<PopupType, string> = {
  announcement:  "bg-blue-100 text-blue-700",
  discount:      "bg-green-100 text-green-700",
  newsletter:    "bg-purple-100 text-purple-700",
  "exit-intent": "bg-orange-100 text-orange-700",
};

interface FormState {
  title: string; content: string; buttonText: string; buttonLink: string;
  image: string; imagePublicId: string; type: PopupType;
  triggerDelay: string; bgColor: string; isActive: boolean;
  startDate: string; endDate: string;
}

const EMPTY: FormState = {
  title: "", content: "", buttonText: "", buttonLink: "",
  image: "", imagePublicId: "", type: "announcement",
  triggerDelay: "3", bgColor: "#ffffff", isActive: true,
  startDate: "", endDate: "",
};

export default function PopupsPage() {
  const [popups, setPopups]     = useState<Popup[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPopup, setEditPopup] = useState<Popup | null>(null);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPopups(await getPopups(true)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditPopup(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (p: Popup) => {
    setEditPopup(p);
    setForm({
      title: p.title, content: p.content, buttonText: p.buttonText, buttonLink: p.buttonLink,
      image: p.image, imagePublicId: p.imagePublicId, type: p.type,
      triggerDelay: String(p.triggerDelay), bgColor: p.bgColor, isActive: p.isActive,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate:   p.endDate   ? p.endDate.slice(0, 10)   : "",
    });
    setShowModal(true);
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const { url, publicId } = await uploadImage(file, "popups");
      setForm(f => ({ ...f, image: url, imagePublicId: publicId }));
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Upload failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setImgUploading(false); if (imgRef.current) imgRef.current.value = ""; }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        triggerDelay: Number(form.triggerDelay),
        startDate: form.startDate || null,
        endDate:   form.endDate   || null,
      };
      if (editPopup) {
        const updated = await updatePopup(editPopup._id, payload);
        setPopups(prev => prev.map(p => p._id === editPopup._id ? updated : p));
      } else {
        const created = await createPopup(payload);
        setPopups(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const toggleActive = async (p: Popup) => {
    try {
      const updated = await updatePopup(p._id, { isActive: !p.isActive });
      setPopups(prev => prev.map(x => x._id === p._id ? updated : x));
    } catch { /* ignore */ }
  };

  const handleDelete = async (p: Popup) => {
    const r = await Swal.fire({ title: "Delete popup?", text: `"${p.title}"`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete" });
    if (!r.isConfirmed) return;
    try {
      await deletePopup(p._id);
      setPopups(prev => prev.filter(x => x._id !== p._id));
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const setF = (key: keyof FormState, value: string | boolean) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Popup Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Website pe dikhnewale popups manage karo</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] font-medium">
          <Plus size={16} /> Add Popup
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />)}
        </div>
      ) : popups.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400 bg-white rounded-xl border">
          <Zap size={40} className="mb-3 opacity-40" />
          <p>Koi popup nahi. "Add Popup" se banao.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popups.map(p => (
            <div key={p._id} className={`bg-white border rounded-xl overflow-hidden ${!p.isActive ? "opacity-60" : ""}`}>
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.title} className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-800 truncate">{p.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TYPE_COLORS[p.type]}`}>
                    {TYPE_LABELS[p.type]}
                  </span>
                </div>
                {p.content && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.content}</p>}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>Delay: {p.triggerDelay}s</span>
                  {p.startDate && <span>• From: {new Date(p.startDate).toLocaleDateString("en-IN")}</span>}
                  {p.endDate   && <span>→ {new Date(p.endDate).toLocaleDateString("en-IN")}</span>}
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <button onClick={() => toggleActive(p)} className={`flex items-center gap-1 text-xs font-medium ${p.isActive ? "text-green-600" : "text-gray-400"}`}>
                    {p.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {p.isActive ? "Active" : "Inactive"}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl my-6 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editPopup ? "Edit Popup" : "New Popup"}</h2>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setF("title", e.target.value)} required placeholder="Popup ka title" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setF("type", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]">
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Delay (seconds)</label>
                  <input type="number" min={0} value={form.triggerDelay} onChange={e => setF("triggerDelay", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={form.content} onChange={e => setF("content", e.target.value)} rows={3} placeholder="Popup ka message" className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#f26b31]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input value={form.buttonText} onChange={e => setF("buttonText", e.target.value)} placeholder="Learn More" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input value={form.buttonLink} onChange={e => setF("buttonLink", e.target.value)} placeholder="/products" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <div className="flex items-center gap-3">
                  {form.image && <img src={form.image} alt="popup" className="w-16 h-12 object-cover rounded" />}
                  <button type="button" onClick={() => imgRef.current?.click()} disabled={imgUploading}
                    className="border-2 border-dashed border-gray-300 hover:border-[#f26b31] rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-[#f26b31] disabled:opacity-50">
                    {imgUploading ? "Uploading..." : form.image ? "Change" : "Upload Image"}
                  </button>
                  {form.image && <button type="button" onClick={() => setForm(f => ({ ...f, image: "", imagePublicId: "" }))} className="text-xs text-red-500 hover:underline">Remove</button>}
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
                </div>
              </div>
              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setF("endDate", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                Active (website pe dikhega)
              </label>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-[#f26b31] text-white py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? "Saving..." : editPopup ? "Update Popup" : "Create Popup"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 border rounded-lg text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

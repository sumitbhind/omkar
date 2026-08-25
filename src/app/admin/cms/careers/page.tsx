"use client";

import { useEffect, useState } from "react";
import { getCareerJobs, createCareerJob, updateCareerJob, deleteCareerJob, CareerJob } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, Briefcase, ToggleLeft, ToggleRight, MapPin, Tag } from "lucide-react";
import { toast, confirmDialog } from "@/lib/toast";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
const TYPE_COLORS: Record<string, string> = {
  "Full-time": "bg-green-100 text-green-700",
  "Part-time": "bg-blue-100 text-blue-700",
  "Contract":  "bg-purple-100 text-purple-700",
  "Internship":"bg-orange-100 text-orange-700",
};

interface FormState {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  order: number;
}

const EMPTY: FormState = { title: "", department: "", location: "", type: "Full-time", description: "", requirements: [""], order: 0 };

export default function CareersPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState<null | "add" | CareerJob>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getCareerJobs(true).then(setJobs).catch(() => setErr("Load failed")).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm({ ...EMPTY, requirements: [""] }); setErr(""); setModal("add"); };
  const openEdit = (j: CareerJob) => {
    setForm({ title: j.title, department: j.department, location: j.location, type: j.type, description: j.description, requirements: j.requirements.length ? [...j.requirements] : [""], order: j.order });
    setErr(""); setModal(j);
  };
  const closeModal = () => { setModal(null); setErr(""); };

  const addReq = () => setForm((f) => ({ ...f, requirements: [...f.requirements, ""] }));
  const updateReq = (i: number, val: string) => setForm((f) => { const r = [...f.requirements]; r[i] = val; return { ...f, requirements: r }; });
  const removeReq = (i: number) => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true); setErr("");
    const payload = { ...form, requirements: form.requirements.filter((r) => r.trim()) };
    try {
      if (modal === "add") {
        const created = await createCareerJob(payload);
        setJobs((prev) => [...prev, created]);
        toast.success("Job add ho gayi!", created.title);
      } else if (modal) {
        const updated = await updateCareerJob((modal as CareerJob)._id, payload);
        setJobs((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
        toast.success("Job update ho gayi!");
      }
      closeModal();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (j: CareerJob) => {
    try {
      const updated = await updateCareerJob(j._id, { isActive: !j.isActive });
      setJobs((prev) => prev.map((x) => (x._id === j._id ? updated : x)));
    } catch { setErr("Status update failed"); }
  };

  const handleDelete = async (j: CareerJob) => {
    const ok = await confirmDialog("Job Delete Karo", `"${j.title}" permanently delete ho jayegi.`, "Haan, Delete Karo");
    if (!ok) return;
    setDeletingId(j._id);
    try {
      await deleteCareerJob(j._id);
      setJobs((prev) => prev.filter((x) => x._id !== j._id));
      toast.success("Job delete ho gayi");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Delete failed"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Careers</h2>
          <p className="text-xs text-gray-400 mt-0.5">{jobs.length} job listings</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Plus size={15} /> Add Job
        </button>
      </div>

      {err && !modal && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
          <Briefcase size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Koi job listing nahi hai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j._id} className={`bg-white rounded-xl border shadow-sm p-4 ${!j.isActive ? "opacity-60 border-gray-100" : "border-gray-100"}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800">{j.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[j.type]}`}>{j.type}</span>
                        {j.department && (
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Tag size={10} />{j.department}</span>
                        )}
                        {j.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={10} />{j.location}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleToggle(j)} className="shrink-0">
                      {j.isActive ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-300" />}
                    </button>
                  </div>
                  {j.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{j.description}</p>}
                  {j.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {j.requirements.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{r}</span>
                      ))}
                      {j.requirements.length > 3 && <span className="text-xs text-gray-400">+{j.requirements.length - 3} more</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 ml-13 pl-1">
                <button onClick={() => openEdit(j)} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600">
                  <Pencil size={11} /> Edit
                </button>
                <button onClick={() => handleDelete(j)} disabled={deletingId === j._id} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50">
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">{modal === "add" ? "New Job Listing" : "Edit Job"}</h3>
              <button onClick={closeModal}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {err && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{err}</div>}

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Job Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Sales Executive" required autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Department</label>
                  <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    placeholder="Sales"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Location</label>
                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Indore, MP"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        form.type === t ? "bg-[#f26b31] text-white border-[#f26b31]" : "border-gray-200 text-gray-600 hover:border-[#f26b31]"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Job Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Job ke baare mein detail…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Requirements</label>
                  <button type="button" onClick={addReq} className="text-xs text-[#f26b31] hover:underline flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {form.requirements.map((req, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={req} onChange={(e) => updateReq(i, e.target.value)}
                        placeholder={`Requirement ${i + 1}`}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                      {form.requirements.length > 1 && (
                        <button type="button" onClick={() => removeReq(i)} className="p-2 text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !form.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg">
                  <Check size={14} /> {saving ? "Saving…" : modal === "add" ? "Create Job" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

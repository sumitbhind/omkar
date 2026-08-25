"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ExternalLink, Video, X, Edit2, Check } from "lucide-react";
import { getMediaFiles, createMediaFile, updateMediaFile, deleteMediaFile, type MediaFile } from "@/lib/adminApi";
import Swal from "sweetalert2";

interface VideoForm {
  name: string;
  url: string;
  thumbnail: string;
  altText: string;
}

const EMPTY_FORM: VideoForm = { name: "", url: "", thumbnail: "", altText: "" };

function getVideoId(url: string): { platform: "youtube" | "vimeo" | "other"; id: string } {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return { platform: "youtube", id: ytMatch[1] };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { platform: "vimeo", id: vimeoMatch[1] };
  return { platform: "other", id: "" };
}

function getEmbedUrl(url: string): string {
  const { platform, id } = getVideoId(url);
  if (platform === "youtube") return `https://www.youtube.com/embed/${id}`;
  if (platform === "vimeo") return `https://player.vimeo.com/video/${id}`;
  return url;
}

function getThumbFromUrl(url: string): string {
  const { platform, id } = getVideoId(url);
  if (platform === "youtube") return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return "";
}

export default function VideosPage() {
  const [videos, setVideos]     = useState<MediaFile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<VideoForm>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [preview, setPreview]   = useState<MediaFile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMediaFiles({ type: "video", limit: 50 });
      setVideos(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) return;
    setSaving(true);
    try {
      const thumb = form.thumbnail || getThumbFromUrl(form.url);
      const item = await createMediaFile({
        name: form.name || form.url,
        url: form.url,
        type: "video",
        thumbnail: thumb,
        altText: form.altText,
      });
      setVideos(prev => [item, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Failed to add video", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (vid: MediaFile) => {
    const result = await Swal.fire({
      title: "Delete video?",
      text: `"${vid.name}" delete ho jayegi.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Haan, delete karo",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMediaFile(vid._id);
      setVideos(prev => prev.filter(v => v._id !== vid._id));
      if (preview?._id === vid._id) setPreview(null);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleRename = async (id: string) => {
    try {
      const updated = await updateMediaFile(id, { name: editName });
      setVideos(prev => prev.map(v => v._id === id ? updated : v));
    } catch { /* ignore */ }
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Videos</h1>
          <p className="text-sm text-gray-500 mt-0.5">YouTube / Vimeo video links manage karo</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] font-medium"
        >
          <Plus size={16} /> Add Video
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">New Video Add Karo</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
              <input
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=... ya https://vimeo.com/..."
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
              />
              {form.url && (
                <p className="text-xs text-gray-500 mt-1">
                  Platform: {getVideoId(form.url).platform}
                  {getVideoId(form.url).id && ` (ID: ${getVideoId(form.url).id})`}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title / Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Video ka naam"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
                <input
                  value={form.thumbnail}
                  onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="Auto detect hoga YouTube ke liye"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-[#f26b31] text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add Video"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-video animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Video size={48} className="mb-3 opacity-40" />
          <p className="text-lg font-medium">Koi video nahi mila</p>
          <p className="text-sm mt-1">Upar "Add Video" se YouTube/Vimeo link add karo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {videos.map(vid => (
            <div key={vid._id} className="bg-white border rounded-xl overflow-hidden group">
              {/* Thumbnail */}
              <div
                className="relative aspect-video bg-gray-900 cursor-pointer"
                onClick={() => setPreview(vid)}
              >
                {vid.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vid.thumbnail} alt={vid.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={40} className="text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-gray-800 border-b-[8px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                {editId === vid._id ? (
                  <div className="flex gap-2">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleRename(vid._id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate flex-1" title={vid.name}>{vid.name || "Untitled"}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditId(vid._id); setEditName(vid.name); }} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded" title="Rename">
                        <Edit2 size={13} />
                      </button>
                      <a href={vid.url} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Open">
                        <ExternalLink size={13} />
                      </a>
                      <button onClick={() => handleDelete(vid)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1 truncate">{vid.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white">
              <X size={28} />
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                src={getEmbedUrl(preview.url)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
            <p className="text-white/80 text-sm mt-3 text-center">{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

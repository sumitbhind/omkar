"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Copy, Trash2, Search, CheckCircle, Image as ImageIcon, X } from "lucide-react";
import { getMediaFiles, deleteMediaFile, uploadImage, type MediaFile } from "@/lib/adminApi";
import Swal from "sweetalert2";

export default function ImagesGalleryPage() {
  const [images, setImages]     = useState<MediaFile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [q, setQ]               = useState("");
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied]     = useState<string | null>(null);
  const [preview, setPreview]   = useState<MediaFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await getMediaFiles({ type: "image", page: p, q: q || undefined, limit: 24 });
      setImages(res.data);
      setTotalPages(res.pages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, q]);

  useEffect(() => { load(page); }, [page]); // eslint-disable-line

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        await uploadImage(file, "media");
      }
      await load(1);
      setPage(1);
      Swal.fire({ icon: "success", title: `${files.length} image(s) uploaded`, timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Upload failed", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (img: MediaFile) => {
    const result = await Swal.fire({
      title: "Delete image?",
      text: `"${img.name}" permanently delete ho jayegi Cloudinary se bhi.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Haan, delete karo",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMediaFile(img._id);
      setImages(prev => prev.filter(i => i._id !== img._id));
      if (preview?._id === img._id) setPreview(null);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Images Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cloudinary pe upload ki gayi saari images</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium"
        >
          {uploading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Upload size={16} />
          )}
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Image naam se search karo..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
        />
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
          <Search size={16} />
        </button>
        {q && (
          <button type="button" onClick={() => { setQ(""); setPage(1); load(1); }} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ImageIcon size={48} className="mb-3 opacity-40" />
          <p className="text-lg font-medium">Koi image nahi mili</p>
          <p className="text-sm mt-1">Upar "Upload Images" button se add karo</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map(img => (
            <div key={img._id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border hover:border-[#f26b31] transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText || img.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreview(img)}
              />
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 gap-1">
                <button
                  title="Copy URL"
                  onClick={() => handleCopy(img.url, img._id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-white/90 hover:bg-white text-gray-800 text-xs py-1.5 rounded-lg font-medium"
                >
                  {copied === img._id ? <CheckCircle size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copied === img._id ? "Copied!" : "Copy"}
                </button>
                <button
                  title="Delete"
                  onClick={() => handleDelete(img)}
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">Next</button>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="font-medium text-gray-800 truncate">{preview.name}</p>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={preview.name} className="w-full max-h-[60vh] object-contain bg-gray-50" />
            <div className="px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 border-t">
              <span>{preview.folder}</span>
              {preview.size > 0 && <span>{(preview.size / 1024).toFixed(1)} KB</span>}
              <span>{new Date(preview.createdAt).toLocaleDateString("en-IN")}</span>
              <button
                onClick={() => handleCopy(preview.url, preview._id)}
                className="ml-auto flex items-center gap-1 bg-[#f26b31] text-white px-4 py-1.5 rounded-lg"
              >
                {copied === preview._id ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied === preview._id ? "Copied!" : "Copy URL"}
              </button>
              <button
                onClick={() => handleDelete(preview)}
                className="flex items-center gap-1 border border-red-300 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

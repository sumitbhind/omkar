"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, ExternalLink, Trash2, Search, FileText, X, Download } from "lucide-react";
import { getMediaFiles, deleteMediaFile, uploadPdf, type MediaFile } from "@/lib/adminApi";
import Swal from "sweetalert2";

export default function PdfFilesPage() {
  const [pdfs, setPdfs]           = useState<MediaFile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [q, setQ]                 = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getMediaFiles({ type: "pdf", page: p, q: q || undefined, limit: 20 });
      setPdfs(res.data);
      setTotalPages(res.pages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [q]);

  useEffect(() => { load(page); }, [page, load]);

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
        await uploadPdf(file, "media-pdfs");
      }
      setPage(1);
      await load(1);
      Swal.fire({ icon: "success", title: `${files.length} PDF(s) uploaded`, timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Upload failed", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (pdf: MediaFile) => {
    const result = await Swal.fire({
      title: "Delete PDF?",
      text: `"${pdf.name}" permanently delete ho jayegi Cloudinary se bhi.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Haan, delete karo",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMediaFile(pdf._id);
      setPdfs(prev => prev.filter(p => p._id !== pdf._id));
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">PDF Files</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cloudinary pe upload ki gayi saari PDF files</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium"
        >
          {uploading
            ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            : <Upload size={16} />
          }
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" multiple className="hidden" onChange={handleUpload} />
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="PDF naam se search karo..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
        />
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"><Search size={16} /></button>
        {q && (
          <button type="button" onClick={() => { setQ(""); setPage(1); load(1); }} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
            <X size={16} />
          </button>
        )}
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">File</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Folder</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Size</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Uploaded</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : pdfs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                <FileText size={40} className="mx-auto mb-2 opacity-40" />
                <p>Koi PDF nahi mili. Upload karo.</p>
              </td></tr>
            ) : pdfs.map(pdf => (
              <tr key={pdf._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex-shrink-0 bg-red-50 rounded-lg flex items-center justify-center">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[180px]" title={pdf.name}>{pdf.name || "Untitled"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500">{pdf.folder || "—"}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{formatSize(pdf.size)}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{new Date(pdf.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View PDF">
                      <ExternalLink size={15} />
                    </a>
                    <a href={pdf.url} download={pdf.name} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Download">
                      <Download size={15} />
                    </a>
                    <button onClick={() => handleDelete(pdf)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
